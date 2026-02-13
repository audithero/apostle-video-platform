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

interface CertificateIssuedEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  certificateUrl: string;
  serialNumber?: string;
  brandColor?: string;
}

export function CertificateIssuedEmail({
  studentName,
  creatorName,
  courseName,
  certificateUrl,
  serialNumber,
  brandColor = "#2563eb",
}: CertificateIssuedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your certificate for ${courseName} is ready`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Certificate Issued
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            Your certificate of completion for <strong>{courseName}</strong> is
            ready to download.
          </Text>

          <Section style={certBox}>
            <Text style={certTitle}>Certificate of Completion</Text>
            <Text style={certCourse}>{courseName}</Text>
            <Text style={certStudent}>{studentName}</Text>
            {serialNumber ? (
              <Text style={certSerial}>Serial: {serialNumber}</Text>
            ) : null}
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={certificateUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              Download Certificate
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Issued by {creatorName}
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

const certBox = {
  background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
  borderRadius: "12px",
  padding: "32px 24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "2px solid #c7d2fe",
};

const certTitle = {
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  color: "#6b7280",
  letterSpacing: "2px",
  margin: "0 0 8px 0",
};

const certCourse = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#1f2937",
  margin: "0 0 4px 0",
};

const certStudent = {
  fontSize: "16px",
  fontStyle: "italic" as const,
  color: "#4b5563",
  margin: "0 0 8px 0",
};

const certSerial = {
  fontSize: "11px",
  color: "#9ca3af",
  margin: "8px 0 0 0",
  fontFamily: "monospace",
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
