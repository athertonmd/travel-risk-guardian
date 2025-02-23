
import { Resend } from 'npm:resend@2.0.0';

export interface EmailResult {
  success: boolean;
  error?: any;
}

export class EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail({
    from,
    to,
    subject,
    html,
    reply_to
  }: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    reply_to?: string;
  }): Promise<EmailResult> {
    try {
      console.log('Attempting to send email:', {
        to,
        subject,
        replyTo: reply_to
      });

      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
        reply_to
      });

      if (error) {
        console.error('Resend API error:', error);
        return {
          success: false,
          error
        };
      }

      console.log('Email sent successfully:', data);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error
      };
    }
  }
}
