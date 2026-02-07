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

interface WelcomeEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  courseUrl: string;
  logoUrl?: string;
  brandColor?: string;
}

export function WelcomeEmail({
  studentName,
  creatorName,
  courseName,
  courseUrl,
  brandColor = "#2563eb",
}: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Welcome to ${courseName}!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Welcome to {courseName}!
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            You have been enrolled in <strong>{courseName}</strong> by {creatorName}.
            Your learning journey starts now!
          </Text>

          <Section style={buttonContainer}>
            <Link
              href={courseUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              Start Learning
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent by {creatorName}. If you did not expect this
            enrollment, you can safely ignore this email.
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
  marginTop: "32px",
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
