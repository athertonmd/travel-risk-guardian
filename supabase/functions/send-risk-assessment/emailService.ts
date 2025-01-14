import { EmailPayload, EmailResult } from './types.ts';

export class EmailService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    const startTime = Date.now();
    console.log('Sending email with payload:', payload);

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      const endTime = Date.now();
      console.log(`Email sent in ${endTime - startTime}ms. Response:`, responseData);

      if (!res.ok) {
        console.error('Resend API error response:', responseData);
        return {
          success: false,
          error: responseData.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      const endTime = Date.now();
      console.error(`Error sending email after ${endTime - startTime}ms:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}