/**
 * Analytics pixel integration helpers.
 * Generates client-side tracking snippets for Meta Pixel, GA4, GTM, and TikTok Pixel.
 */

interface PixelConfig {
  metaPixelId?: string | null;
  ga4Id?: string | null;
  gtmId?: string | null;
  tiktokPixelId?: string | null;
}

/**
 * Generates the Meta (Facebook) Pixel base code snippet.
 */
export function getMetaPixelSnippet(pixelId: string): string {
  return `
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
alt="" /></noscript>`.trim();
}

/**
 * Generates the Google Analytics 4 snippet.
 */
export function getGA4Snippet(measurementId: string): string {
  return `
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');
</script>`.trim();
}

/**
 * Generates the Google Tag Manager snippet.
 */
export function getGTMSnippet(containerId: string): string {
  return `
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>`.trim();
}

/**
 * Generates the GTM noscript fallback.
 */
export function getGTMNoScript(containerId: string): string {
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
}

/**
 * Generates the TikTok Pixel snippet.
 */
export function getTikTokPixelSnippet(pixelId: string): string {
  return `
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>`.trim();
}

/**
 * Generates all configured pixel snippets for injection into the <head>.
 */
export function getAllPixelSnippets(config: PixelConfig): string {
  const snippets: string[] = [];

  if (config.metaPixelId) {
    snippets.push(getMetaPixelSnippet(config.metaPixelId));
  }
  if (config.ga4Id) {
    snippets.push(getGA4Snippet(config.ga4Id));
  }
  if (config.gtmId) {
    snippets.push(getGTMSnippet(config.gtmId));
  }
  if (config.tiktokPixelId) {
    snippets.push(getTikTokPixelSnippet(config.tiktokPixelId));
  }

  return snippets.join("\n");
}

/**
 * Generates pixel event tracking calls for conversions.
 */
export function getConversionSnippets(
  config: PixelConfig,
  eventType: "Purchase" | "Lead" | "CompleteRegistration" | "ViewContent",
  value?: number,
  currency?: string,
): string {
  const snippets: string[] = [];

  if (config.metaPixelId) {
    const params = value ? `, {value: ${String(value)}, currency: '${currency ?? "USD"}'}` : "";
    snippets.push(`<script>fbq('track', '${eventType}'${params});</script>`);
  }

  if (config.ga4Id) {
    const gaEvent = eventType === "Purchase" ? "purchase" : eventType.toLowerCase();
    const params = value ? `, {value: ${String(value)}, currency: '${currency ?? "USD"}'}` : "";
    snippets.push(`<script>gtag('event', '${gaEvent}'${params});</script>`);
  }

  if (config.tiktokPixelId) {
    const ttEvent = eventType === "Purchase" ? "CompletePayment" : eventType;
    const params = value ? `, {value: ${String(value)}, currency: '${currency ?? "USD"}'}` : "";
    snippets.push(`<script>ttq.track('${ttEvent}'${params});</script>`);
  }

  return snippets.join("\n");
}
