export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to: string;
}

export interface EmailResult {
  success: boolean;
  data?: any;
  error?: any;
}

export interface EmailResults {
  primary: EmailResult;
  cc?: EmailResult;
}

export interface EmailLogUpdate {
  recipient_status: 'sent' | 'failed';
  recipient_error_message: string | null;
  cc_status: 'sent' | 'failed' | null;
  cc_error_message: string | null;
}

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  cc: string[] | null;
  country: string;
  risk_level: string;
  sent_by: string;
  recipient_status: 'pending' | 'sent' | 'failed';
  cc_status?: 'pending' | 'sent' | 'failed' | null;
  sent_at: string;
  traveller_name: string | null;
}