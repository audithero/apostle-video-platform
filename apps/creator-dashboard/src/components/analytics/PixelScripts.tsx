import { useEffect, useRef } from "react";

interface PixelScriptsProps {
  readonly metaPixelId?: string | null;
  readonly ga4Id?: string | null;
  readonly gtmId?: string | null;
  readonly tiktokPixelId?: string | null;
}

/**
 * Sanitize pixel ID to prevent injection via template literals.
 * Only allows alphanumeric characters, hyphens, underscores, and dots.
 */
function sanitizePixelId(id: string | null | undefined): string | null {
  if (!id) return null;
  const cleaned = id.replace(/[^a-zA-Z0-9\-_.]/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Injects analytics pixel scripts into the document head.
 * Renders nothing visually - only side-effects via useEffect.
 */
export function PixelScripts({
  metaPixelId,
  ga4Id,
  gtmId,
  tiktokPixelId,
}: PixelScriptsProps) {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const safeMetaId = sanitizePixelId(metaPixelId);
    const safeGa4Id = sanitizePixelId(ga4Id);
    const safeGtmId = sanitizePixelId(gtmId);
    const safeTiktokId = sanitizePixelId(tiktokPixelId);

    // Meta Pixel
    if (safeMetaId) {
      const script = document.createElement("script");
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${safeMetaId}');fbq('track','PageView');
      `;
      script.dataset.pixel = "meta";
      document.head.appendChild(script);
    }

    // GA4
    if (safeGa4Id) {
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${safeGa4Id}`;
      gtagScript.dataset.pixel = "ga4-lib";
      document.head.appendChild(gtagScript);

      const configScript = document.createElement("script");
      configScript.innerHTML = `
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());gtag('config','${safeGa4Id}');
      `;
      configScript.dataset.pixel = "ga4-config";
      document.head.appendChild(configScript);
    }

    // GTM
    if (safeGtmId) {
      const script = document.createElement("script");
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${safeGtmId}');
      `;
      script.dataset.pixel = "gtm";
      document.head.appendChild(script);
    }

    // TikTok Pixel
    if (safeTiktokId) {
      const script = document.createElement("script");
      script.innerHTML = `
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once",
        "ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=
        function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)
        ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i=
        "https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},
        ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,
        ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");
        o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${safeTiktokId}');ttq.page();
        }(window,document,'ttq');
      `;
      script.dataset.pixel = "tiktok";
      document.head.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      for (const el of document.querySelectorAll("[data-pixel]")) {
        el.remove();
      }
      injectedRef.current = false;
    };
  }, [metaPixelId, ga4Id, gtmId, tiktokPixelId]);

  return null;
}

/**
 * Fire a conversion event across all configured pixels on the client side.
 */
export function fireConversionEvent(
  eventType: "Purchase" | "Lead" | "CompleteRegistration",
  value?: number,
  currency?: string,
): void {
  const win = window as unknown as Record<string, unknown>;
  const fbq = win.fbq as ((...args: unknown[]) => void) | undefined;
  const gtag = win.gtag as ((...args: unknown[]) => void) | undefined;
  const ttq = win.ttq as { track: (...args: unknown[]) => void } | undefined;

  // Meta Pixel
  if (fbq) {
    const params = value ? { value, currency: currency ?? "USD" } : undefined;
    fbq("track", eventType, params);
  }

  // GA4
  if (gtag) {
    const gaEvent = eventType === "Purchase" ? "purchase" : eventType.toLowerCase();
    const params = value ? { value, currency: currency ?? "USD" } : undefined;
    gtag("event", gaEvent, params);
  }

  // TikTok
  if (ttq) {
    const ttEvent = eventType === "Purchase" ? "CompletePayment" : eventType;
    const params = value ? { value, currency: currency ?? "USD" } : undefined;
    ttq.track(ttEvent, params);
  }
}
