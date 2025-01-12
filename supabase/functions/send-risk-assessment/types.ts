export interface EmailRequest {
  to: string;
  cc?: string[];
  country: string;
  risk_level: string;
  information: string;
  user_id: string;
  travellerName: string;
}

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  travellerName: string;
}

export interface EmailLogEntry {
  recipient: string;
  cc: string[] | null;
  country: string;
  risk_level: string;
  sent_by: string;
  recipient_status: 'pending' | 'sent' | 'failed';
  cc_status?: 'pending' | 'sent' | 'failed' | null;
  recipient_error_message?: string | null;
  cc_error_message?: string | null;
  sent_at: string;
  traveller_name: string | null;
}