
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

interface LogEntry {
  id?: string;
  recipient: string;
  cc?: string[] | null;
  country: string;
  risk_level: string;
  sent_by: string;
  recipient_status: string;
  cc_status?: string | null;
  sent_at: string;
  traveller_name?: string | null;
  client_id?: string | null;
  recipient_error_message?: string | null;
  cc_error_message?: string | null;
}

export class EmailLogger {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createLog(data: LogEntry) {
    console.log('Creating email log:', data);
    const { data: logEntry, error } = await this.supabase
      .from('email_logs')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating email log:', error);
      throw error;
    }

    return logEntry;
  }

  async updateLog(id: string, updates: Partial<LogEntry>) {
    console.log('Updating email log:', { id, updates });
    const { error } = await this.supabase
      .from('email_logs')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating email log:', error);
      throw error;
    }
  }
}
