import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CommunityMentionEmailProps {
  recipientName: string;
  mentionedByName: string;
  channelName: string;
  postSnippet: string;
  postUrl: string;
  creatorName: string;
  brandColor?: string;
}

export function CommunityMentionEmail({
  recipientName,
  mentionedByName,
  channelName,
  postSnippet,
  postUrl,
  creatorName,
  brandColor = "#2563eb",
}: CommunityMentionEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`${mentionedByName} mentioned you in ${channelName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            You Were Mentioned
          </Heading>

          <Text style={paragraph}>
            Hi {recipientName},
          </Text>

          <Text style={paragraph}>
            <strong>{mentionedByName}</strong> mentioned you in{" "}
            <strong>#{channelName}</strong>:
          </Text>

          <Section style={quoteBox}>
            <Text style={quoteText}>{postSnippet}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={postUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              View Post
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Community notification from {creatorName}
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

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
};

const quoteBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  borderLeft: "4px solid #2563eb",
};

const quoteText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4b5563",
  margin: "0",
  fontStyle: "italic" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "32px",
};

const button = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "6px",
  display: "inline-block",
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
