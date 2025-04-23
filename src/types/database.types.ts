export type ProgramType =
  | 'JOB_VACANCIES'
  | 'APPLICANTS_REGISTERED'
  | 'APPLICANTS_REFERRED'
  | 'APPLICANTS_PLACED'
  | 'PWD_PROJECTS'
  | 'PWD_TRAINING'
  | 'APPLICANTS_COUNSELLED'
  | 'APPLICANTS_TESTED'
  | 'CAREER_GUIDANCE'
  | 'JOB_FAIR'
  | 'LIVELIHOOD';

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Report {
  id: string;
  reporting_period: string;
  reporting_office: string;
  created_at: string;
  updated_at: string;
  status: ReportStatus;
}

export interface Profile {
  id: number;
  email: string;
  role: 'admin' | 'user';
  name: string;
  municipal_mayor: string;
  address: string;
}

export interface EmploymentFacilitation {
  id: string;
  report_id: string;
  program: ProgramType;
  indicator: string;
  sub_indicator?: string;
  sub_sub_indicator?: string;
  previous_report_period: number;
  current_period: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface CompleteReport extends Report {
  entries: EmploymentFacilitation[];
} 