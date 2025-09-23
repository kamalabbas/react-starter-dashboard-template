export interface Lead {
  id: number;
  URL: string;
  IP: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface DataLeads {
  leads: Lead[];
}
