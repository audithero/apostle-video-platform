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

interface CourseCompletedEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  certificateUrl?: string;
  communityUrl?: string;
  brandColor?: string;
}

export function CourseCompletedEmail({
  studentName,
  creatorName,
  courseName,
  certificateUrl,
  communityUrl,
  brandColor = "#2563eb",
}: CourseCompletedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Congratulations on completing ${courseName}!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Congratulations!
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            You have completed <strong>{courseName}</strong>. That is an amazing
            achievement!
          </Text>

          {certificateUrl ? (
            <Section style={buttonContainer}>
              <Link
                href={certificateUrl}
                style={{ ...button, backgroundColor: brandColor }}
              >
                Download Certificate
              </Link>
            </Section>
          ) : null}

          {communityUrl ? (
            <Section>
              <Text style={paragraph}>
                Join the community to connect with fellow graduates:
              </Text>
              <Section style={buttonContainer}>
                <Link
                  href={communityUrl}
                  style={{ ...secondaryButton }}
                >
                  Join Community
                </Link>
              </Section>
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
  marginBottom: "24px",
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

const secondaryButton = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "10px 24px",
  borderRadius: "6px",
  display: "inline-block",
  border: "1px solid #d1d5db",
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
