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
  profile_id: number;
  created_at: string;
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
  program: string;
  indicator: string;
  sub_indicator?: string | null;
  sub_sub_indicator?: string | null;
  previous_report_period: number;
  current_period: number;
  remarks?: string | null;
}

export interface CompleteReport extends Report {
  entries: EmploymentFacilitation[];
  profile: Profile;
} 