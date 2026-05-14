export type Role = 'ADMIN' | 'SUPERINTENDENT' | 'STAFF' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  company_id?: string;
  avatar?: string;
}

export interface Vessel {
  id: string;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  company_id: string;
  created_at: string;
}

export interface Report {
  id: number;
  company_id: string;
  vessel_id: string;
  report_data: any;
  status: 'Pending' | 'APPROVED' | 'REJECTED';
  created_by: string;
  approved_by?: string;
  created_at: string;
}

export interface Finding {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CLOSED';
}

export interface DashboardStats {
  totalVessels: number;
  totalReports: number;
  pendingApprovals: number;
  approvedReports: number;
}
