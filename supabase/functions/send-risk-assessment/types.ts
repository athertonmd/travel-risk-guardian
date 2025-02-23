
export interface EmailData {
  subject: string;
  country: string;
  risk_level: string;
  information: string;
  travellerName?: string;
  recordLocator?: string;
}

export interface EmailResults {
  primary: {
    success: boolean;
    error?: any;
  };
  cc: {
    success: boolean;
    error?: any;
  } | null;
}
