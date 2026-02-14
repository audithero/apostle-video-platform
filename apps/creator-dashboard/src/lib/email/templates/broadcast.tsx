import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

/** Server-safe HTML sanitizer for email content (no DOM dependency). */
function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, "")
    .replace(/<iframe\b[^>]*>.*?<\/iframe\s*>/gi, "")
    .replace(/<object\b[^>]*>.*?<\/object\s*>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<form\b[^>]*>.*?<\/form\s*>/gi, "")
    .replace(/\bon\w+\s*=/gi, "data-removed=")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/vbscript\s*:/gi, "blocked:")
    .replace(/data\s*:\s*text\/html/gi, "blocked:");
}

interface BroadcastEmailProps {
  subject: string;
  bodyHtml: string;
  creatorName: string;
  unsubscribeUrl: string;
  brandColor?: string;
}

export function BroadcastEmail({
  subject,
  bodyHtml,
  creatorName,
  unsubscribeUrl,
  brandColor = "#2563eb",
}: BroadcastEmailProps) {
  const sanitizedHtml = sanitizeEmailHtml(bodyHtml);
  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            {subject}
          </Heading>

          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

          <Hr style={hr} />

          <Text style={footer}>
            Sent by {creatorName}.{" "}
            <a href={unsubscribeUrl} style={unsubLink}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700" as const,
  marginBottom: "24px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  lineHeight: "20px",
};

const unsubLink = {
  color: "#6b7280",
  textDecoration: "underline",
};
