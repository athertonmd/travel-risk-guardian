import { EmailPayload, EmailResult } from './types.ts';

export class EmailService {
  private readonly apiKey: string;
  private readonly apiEndpoint = 'https://api.resend.com/emails';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    const startTime = Date.now();
    console.log('Starting email send process with Resend API');

    try {
      console.log('Sending request to Resend API:', {
        endpoint: this.apiEndpoint,
        to: payload.to,
        subject: payload.subject ? payload.subject.substring(0, 30) + '...' : 'No subject'
      });

      const res = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      const endTime = Date.now();
      console.log(`Email API request completed in ${endTime - startTime}ms`);

      if (!res.ok) {
        console.error('Resend API error:', {
          status: res.status,
          statusText: res.statusText,
          response: responseData
        });
        return {
          success: false,
          error: responseData.message || 'Failed to send email'
        };
      }

      console.log('Email sent successfully:', {
        id: responseData.id,
        to: payload.to
      });

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      const endTime = Date.now();
      console.error(`Error in email service after ${endTime - startTime}ms:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}