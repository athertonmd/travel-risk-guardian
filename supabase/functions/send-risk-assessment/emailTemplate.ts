
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

export const generateEmailHtml = (country: string, risk_level: string, information: string, isCC = false, travellerName?: string, recordLocator?: string): string => {
  const travellerInfo = travellerName ? `<p style="margin: 5px 0 0; color: #666;">Traveller: <strong>${travellerName}</strong></p>` : '';
  const recordLocatorInfo = recordLocator ? `<p style="margin: 5px 0 0; color: #666;">Record Locator: <strong>${recordLocator}</strong></p>` : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Risk Assessment Report</h2>
      <div style="margin: 20px 0;">
        <h3 style="color: #555;">Country: ${country}</h3>
        ${travellerInfo}
        ${recordLocatorInfo}
        <p style="background-color: ${getRiskColor(risk_level)}; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
          Risk Level: ${risk_level.toUpperCase()}
        </p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h4 style="color: #444;">Assessment Details:</h4>
        <p style="color: #666; line-height: 1.6;">${information}</p>
      </div>
      <div style="margin-top: 20px; font-size: 0.9em; color: #888;">
        <p>This is an automated risk assessment notification.</p>
      </div>
    </div>
  `;
};
