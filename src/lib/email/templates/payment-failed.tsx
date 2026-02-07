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

interface PaymentFailedEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  amountFormatted: string;
  updatePaymentUrl: string;
  retryDate?: string;
  brandColor?: string;
}

export function PaymentFailedEmail({
  studentName,
  creatorName,
  courseName,
  amountFormatted,
  updatePaymentUrl,
  retryDate,
  brandColor = "#2563eb",
}: PaymentFailedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Action needed: Payment failed for ${courseName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: "#dc2626" }}>
            Payment Failed
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            We were unable to process your payment of{" "}
            <strong>{amountFormatted}</strong> for{" "}
            <strong>{courseName}</strong>.
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              Please update your payment method to maintain access to your
              course.
              {retryDate
                ? ` We will automatically retry on ${retryDate}.`
                : ""}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={updatePaymentUrl}
              style={{ ...button, backgroundColor: brandColor }}
            >
              Update Payment Method
            </Link>
          </Section>

          <Text style={smallText}>
            If you believe this is an error, please contact us by replying to
            this email.
          </Text>

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

const warningBox = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "20px 0",
  borderLeft: "4px solid #dc2626",
};

const warningText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#991b1b",
  margin: "0",
};

const smallText = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "20px",
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

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  lineHeight: "20px",
};
