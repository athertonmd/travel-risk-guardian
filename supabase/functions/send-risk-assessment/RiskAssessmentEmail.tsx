import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.11';
import * as React from 'npm:react@18.2.0';

interface RiskAssessmentEmailProps {
  country: string;
  risk_level: string;
  information: string;
  isCC?: boolean;
  travellerName?: string;
  recordLocator?: string;
}

const getRiskColor = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case 'extreme':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

export const RiskAssessmentEmail = ({
  country,
  risk_level,
  information,
  isCC = false,
  travellerName,
  recordLocator,
}: RiskAssessmentEmailProps) => {
  const riskColor = getRiskColor(risk_level);

  return (
    <Html>
      <Head />
      <Preview>Risk Assessment Report for {country}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Risk Assessment Report</Heading>
          
          <Section style={contentSection}>
            <Heading as="h3" style={h3}>Country: {country}</Heading>
            
            {travellerName && (
              <Text style={infoText}>
                Traveller: <strong>{travellerName}</strong>
              </Text>
            )}
            
            {recordLocator && (
              <Text style={infoText}>
                Record Locator: <strong>{recordLocator}</strong>
              </Text>
            )}

            <Text style={{
              ...riskLevel,
              backgroundColor: riskColor,
            }}>
              Risk Level: {risk_level.toUpperCase()}
            </Text>
          </Section>

          <Section style={assessmentSection}>
            <Heading as="h4" style={h4}>Assessment Details:</Heading>
            <Text style={assessmentText}>{information}</Text>
          </Section>

          <Text style={footer}>
            This is an automated risk assessment notification.
            {isCC && (
              <>
                <br />
                You are receiving this as a CC recipient.
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: 0,
  textAlign: 'left' as const,
};

const h3 = {
  color: '#555',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const h4 = {
  color: '#444',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const contentSection = {
  margin: '20px 0',
};

const infoText = {
  color: '#666',
  fontSize: '14px',
  margin: '5px 0',
};

const riskLevel = {
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  display: 'inline-block',
  margin: '10px 0',
  fontWeight: 'bold',
};

const assessmentSection = {
  backgroundColor: '#f5f5f5',
  padding: '15px',
  borderRadius: '5px',
  margin: '20px 0',
};

const assessmentText = {
  color: '#666',
  lineHeight: '1.6',
  fontSize: '14px',
  margin: '0',
};

const footer = {
  color: '#888',
  fontSize: '13px',
  marginTop: '20px',
  textAlign: 'left' as const,
};

export default RiskAssessmentEmail;
