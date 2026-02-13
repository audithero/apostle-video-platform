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

interface QuizResultsEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  quizTitle: string;
  scorePercent: number;
  passed: boolean;
  passingScore: number;
  courseUrl: string;
  brandColor?: string;
}

export function QuizResultsEmail({
  studentName,
  creatorName,
  courseName,
  quizTitle,
  scorePercent,
  passed,
  passingScore,
  courseUrl,
  brandColor = "#2563eb",
}: QuizResultsEmailProps) {
  const resultColor = passed ? "#16a34a" : "#dc2626";
  const resultText = passed ? "Passed" : "Not Passed";

  return (
    <Html lang="en">
      <Head />
      <Preview>{`Quiz results: ${String(scorePercent)}% on ${quizTitle}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Quiz Results
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            Here are your results for <strong>{quizTitle}</strong> in{" "}
            <strong>{courseName}</strong>.
          </Text>

          <Section style={scoreBox}>
            <Text style={{ ...scoreNumber, color: resultColor }}>
              {scorePercent}%
            </Text>
            <Text style={{ ...resultBadge, color: resultColor }}>
              {resultText}
            </Text>
            <Text style={scoreDetail}>
              Passing score: {String(passingScore)}%
            </Text>
          </Section>

          {passed ? (
            <Text style={paragraph}>
              Great job! You can continue to the next lesson.
            </Text>
          ) : (
            <Text style={paragraph}>
              You can review the material and try again.
            </Text>
          )}

          <Section style={buttonContainer}>
            <Link
              href={courseUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              {passed ? "Continue Course" : "Review & Retry"}
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

const scoreBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #e5e7eb",
};

const scoreNumber = {
  fontSize: "48px",
  fontWeight: "700" as const,
  margin: "0",
  lineHeight: "1",
};

const resultBadge = {
  fontSize: "18px",
  fontWeight: "600" as const,
  margin: "8px 0 4px 0",
};

const scoreDetail = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "4px 0 0 0",
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
