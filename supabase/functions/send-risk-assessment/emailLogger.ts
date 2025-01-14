import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { EmailLogEntry, EmailLogUpdate } from './types.ts';

export class EmailLogger {
  private readonly supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createLog(logEntry: Omit<EmailLogEntry, 'id'>): Promise<EmailLogEntry> {
    console.log('Creating email log with entry:', {
      ...logEntry,
      client_id: logEntry.client_id || 'not provided',
    });

    const { data, error } = await this.supabase
      .from('email_logs')
      .insert([logEntry])
      .select()
      .single();

    if (error) {
      console.error('Error creating email log:', error);
      throw error;
    }

    console.log('Successfully created email log:', {
      id: data.id,
      recipient: data.recipient,
      client_id: data.client_id || 'not set',
      sent_by: data.sent_by
    });

    return data;
  }

  async updateLog(logId: string, update: EmailLogUpdate): Promise<void> {
    console.log('Updating email log:', { logId, update });
    
    const { error } = await this.supabase
      .from('email_logs')
      .update(update)
      .eq('id', logId);

    if (error) {
      console.error('Error updating email log:', error);
      throw error;
    }
  }
}