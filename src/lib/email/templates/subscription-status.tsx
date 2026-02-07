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

interface SubscriptionStatusEmailProps {
  studentName: string;
  creatorName: string;
  status: "canceling" | "canceled" | "renewed";
  courseName?: string;
  endDate?: string;
  resubscribeUrl?: string;
  brandColor?: string;
}

const statusConfig = {
  canceling: {
    title: "Subscription Canceling",
    preview: "Your subscription will end soon",
    color: "#d97706",
  },
  canceled: {
    title: "Subscription Canceled",
    preview: "Your subscription has ended",
    color: "#dc2626",
  },
  renewed: {
    title: "Subscription Renewed",
    preview: "Your subscription has been renewed",
    color: "#16a34a",
  },
};

export function SubscriptionStatusEmail({
  studentName,
  creatorName,
  status,
  courseName,
  endDate,
  resubscribeUrl,
  brandColor = "#2563eb",
}: SubscriptionStatusEmailProps) {
  const config = statusConfig[status];

  return (
    <Html lang="en">
      <Head />
      <Preview>{config.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: config.color }}>
            {config.title}
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          {status === "canceling" ? (
            <>
              <Text style={paragraph}>
                Your subscription{courseName ? ` to ${courseName}` : ""} has
                been set to cancel.
                {endDate
                  ? ` You will continue to have access until ${endDate}.`
                  : ""}
              </Text>
              <Text style={paragraph}>
                Changed your mind? You can resubscribe at any time before your
                access ends.
              </Text>
            </>
          ) : null}

          {status === "canceled" ? (
            <>
              <Text style={paragraph}>
                Your subscription{courseName ? ` to ${courseName}` : ""} has
                ended. You no longer have access to the course content.
              </Text>
              <Text style={paragraph}>
                If you would like to regain access, you can resubscribe below.
              </Text>
            </>
          ) : null}

          {status === "renewed" ? (
            <Text style={paragraph}>
              Your subscription{courseName ? ` to ${courseName}` : ""} has been
              successfully renewed. You can continue learning without
              interruption.
            </Text>
          ) : null}

          {resubscribeUrl && status !== "renewed" ? (
            <Section style={buttonContainer}>
              <Link
                href={resubscribeUrl}
                style={{ ...button, backgroundColor: brandColor }}
              >
                Resubscribe
              </Link>
            </Section>
          ) : null}

          <Hr style={hr} />

          <Text style={footer}>
            Sent by {creatorName}
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
