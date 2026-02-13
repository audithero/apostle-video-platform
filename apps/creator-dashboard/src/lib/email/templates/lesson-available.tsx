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

interface LessonAvailableEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  moduleName: string;
  lessonUrl: string;
  brandColor?: string;
}

export function LessonAvailableEmail({
  studentName,
  creatorName,
  courseName,
  moduleName,
  lessonUrl,
  brandColor = "#2563eb",
}: LessonAvailableEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`New content available in ${courseName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            New Lesson Unlocked!
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            A new module is now available in <strong>{courseName}</strong>:
          </Text>

          <Section style={moduleBox}>
            <Text style={moduleTitle}>{moduleName}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={lessonUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              Continue Learning
            </Link>
          </Section>

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

const moduleBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const moduleTitle = {
  fontSize: "18px",
  fontWeight: "600" as const,
  color: "#1f2937",
  margin: "0",
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
