import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PaymentReceiptEmailProps {
  studentName: string;
  creatorName: string;
  courseName: string;
  amountFormatted: string;
  currency: string;
  transactionId: string;
  paymentDate: string;
  brandColor?: string;
}

export function PaymentReceiptEmail({
  studentName,
  creatorName,
  courseName,
  amountFormatted,
  currency,
  transactionId,
  paymentDate,
  brandColor = "#2563eb",
}: PaymentReceiptEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Payment receipt for ${courseName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>
            Payment Receipt
          </Heading>

          <Text style={paragraph}>
            Hi {studentName},
          </Text>

          <Text style={paragraph}>
            Thank you for your purchase. Here is your payment receipt.
          </Text>

          <Section style={receiptBox}>
            <table style={receiptTable} cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={labelCell}>Item</td>
                  <td style={valueCell}>{courseName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Amount</td>
                  <td style={valueCell}>
                    {amountFormatted} {currency.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>Date</td>
                  <td style={valueCell}>{paymentDate}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Transaction</td>
                  <td style={{ ...valueCell, fontFamily: "monospace", fontSize: "13px" }}>
                    {transactionId}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Payment processed by {creatorName}. If you have questions about
            this charge, please reply to this email.
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

const receiptBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const receiptTable = {
  width: "100%",
};

const labelCell = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#6b7280",
  padding: "6px 0",
  verticalAlign: "top" as const,
  width: "120px",
};

const valueCell = {
  fontSize: "14px",
  color: "#1f2937",
  padding: "6px 0",
  verticalAlign: "top" as const,
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
