import { supabase, handleSupabaseError } from '../lib/supabase';
import { CompleteReport, EmploymentFacilitation, Report, ProgramType } from '../types/database.types';

export const reportService = {
  async createReport(
    reportingPeriod: string,
    reportingOffice: string,
    entries: Omit<EmploymentFacilitation, 'id' | 'report_id' | 'created_at' | 'updated_at'>[]
  ): Promise<CompleteReport | null> {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.error('No authenticated user found');
        return null;
      }

      const user = JSON.parse(storedUser);
      if (!user?.id) {
        console.error('Invalid user data');
        return null;
      }

      // Validate the `program` field for each entry
      const isValid = entries.every(entry =>
        this.isValidProgram(entry.program)
      );

      if (!isValid) {
        console.error('One or more programs are invalid.');
        return null;
      }

      const { error: rpcError } = await supabase.rpc("insert_employment_report", {
        reporting_period: reportingPeriod,
        reporting_office: reportingOffice,
        entries: entries.map(entry => ({
          program: entry.program,
          indicator: entry.indicator,
          sub_indicator: entry.sub_indicator,
          sub_sub_indicator: entry.sub_sub_indicator,
          previous_report_period: entry.previous_report_period,
          current_period: entry.current_period,
          remarks: entry.remarks,
        })),
        profile_id: user.id // Use the user's ID directly
      });

      if (rpcError) {
        console.error('Error executing insert_employment_report function:', rpcError.message);
        return handleSupabaseError<null>(rpcError, null);
      }

      // Fetch the latest report
      const { data: recentReports, error: fetchError } = await supabase
        .from("employment_reports")
        .select("*, employment_facilitation_entries(*)")
        .eq("reporting_period", reportingPeriod)
        .eq("reporting_office", reportingOffice)
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !recentReports) {
        console.error("Failed to fetch newly inserted report");
        return handleSupabaseError<null>(fetchError, null);
      }

      return {
        ...recentReports,
        entries: recentReports.employment_facilitation_entries || [],
      };
    } catch (error) {
      console.error('Unexpected error in createReport:', error);
      return handleSupabaseError<null>(error, null);
    }
  },

  isValidProgram(program: string): program is ProgramType {
    return [
      'JOB_VACANCIES',
      'APPLICANTS_REGISTERED',
      'APPLICANTS_REFERRED',
      'APPLICANTS_PLACED',
      'PWD_PROJECTS',
      'PWD_TRAINING',
      'APPLICANTS_COUNSELLED',
      'APPLICANTS_TESTED',
      'CAREER_GUIDANCE',
      'JOB_FAIR',
      'LIVELIHOOD'
    ].includes(program);
  },

  async getReport(id: string): Promise<CompleteReport | null> {
    try {
      // Fetch the report from the correct table
      const { data: report, error: reportError } = await supabase
        .from('employment_reports')  // Change from 'reports' to 'employment_reports'
        .select('*')
        .eq('id', id)
        .single();

      if (reportError) return handleSupabaseError<null>(reportError, null);

      // Fetch related entries from employment_facilitation_entries
      const { data: entries, error: entriesError } = await supabase
        .from('employment_facilitation_entries')  // Corrected table name
        .select('*')
        .eq('report_id', id);

      if (entriesError) return handleSupabaseError<null>(entriesError, null);

      return {
        ...report,
        entries: entries || [],
      };
    } catch (error) {
      return handleSupabaseError<null>(error, null);
    }
  },

  async getUserReports(): Promise<CompleteReport[]> {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.error('No authenticated user found');
        return [];
      }

      const user = JSON.parse(storedUser);
      if (!user?.id) {
        console.error('Invalid user data');
        return [];
      }

      // Get reports for the current user
      const { data: reports, error: reportsError } = await supabase
        .from('employment_reports')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        return [];
      }

      if (!reports || reports.length === 0) {
        return [];
      }

      // Get entries for these reports
      const reportIds = reports.map(report => report.id);
      const { data: entries, error: entriesError } = await supabase
        .from('employment_facilitation_entries')
        .select('*')
        .in('report_id', reportIds);

      if (entriesError) {
        console.error('Error fetching entries:', entriesError);
        return [];
      }

      return reports.map(report => ({
        ...report,
        entries: entries?.filter(entry => entry.report_id === report.id) || []
      }));
    } catch (error) {
      console.error('Unexpected error in getUserReports:', error);
      return [];
    }
  },

  async submitReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employment_reports')
        .update({ status: 'submitted' })
        .eq('id', id);

      if (error) return handleSupabaseError<boolean>(error, false);
      return true;
    } catch (error) {
      return handleSupabaseError<boolean>(error, false);
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employment_reports')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError<boolean>(error, false);
      return true;
    } catch (error) {
      return handleSupabaseError<boolean>(error, false);
    }
  },
};