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

interface EnrollmentConfirmationEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  courseUrl: string;
  pricePaid?: string;
  brandColor?: string;
}

export function EnrollmentConfirmationEmail({
  studentName,
  creatorName,
  courseName,
  courseUrl,
  pricePaid,
  brandColor = "#2563eb",
}: EnrollmentConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`You're enrolled in ${courseName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Enrollment Confirmed
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            Your enrollment in <strong>{courseName}</strong> is confirmed.
            {pricePaid ? ` A payment of ${pricePaid} has been processed.` : ""}
          </Text>

          <Section style={detailBox}>
            <Text style={detailLabel}>Course</Text>
            <Text style={detailValue}>{courseName}</Text>
            <Text style={detailLabel}>Instructor</Text>
            <Text style={detailValue}>{creatorName}</Text>
            {pricePaid ? (
              <>
                <Text style={detailLabel}>Amount Paid</Text>
                <Text style={detailValue}>{pricePaid}</Text>
              </>
            ) : null}
          </Section>

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

const detailBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
};

const detailLabel = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "8px 0 2px 0",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "500" as const,
  color: "#1f2937",
  margin: "0 0 8px 0",
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
