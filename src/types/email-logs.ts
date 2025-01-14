export interface EmailLog {
  id: string;
  sent_at: string;
  recipient_status: string;
  recipient_error_message?: string | null;
  cc_status?: string | null;
  cc_error_message?: string | null;
  recipient: string;
  cc?: string[];
  country: string;
  risk_level: string;
  traveller_name: string | null;
  client_id: string | null;
  clients?: {
    name: string;
  } | null;
  profiles: {
    email: string;
  };
}