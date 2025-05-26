import { supabase, handleSupabaseError } from '../app/utils/supabaseClient';
import { CompleteReport, EmploymentFacilitation, Report, ProgramType, Profile } from '../types/database.types';

export const reportService = {
  /**
   * Create a new employment report for the given user.
   * @param reportingPeriod - The reporting period (e.g., '2024-05')
   * @param reportingOffice - The reporting office name
   * @param entries - The employment facilitation entries
   * @param userId - The user's UUID (profile_id)
   */
  async createReport(
    reportingPeriod: string,
    reportingOffice: string,
    entries: Omit<EmploymentFacilitation, 'id' | 'report_id' | 'created_at' | 'updated_at'>[],
    userId: string
  ): Promise<CompleteReport | null> {
    try {
      if (!userId) {
        console.error('No authenticated user found');
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
          previous_female_count: entry.previous_female_count,
          current_female_count: entry.current_female_count,
          remarks: entry.remarks,
        })),
        profile_id: userId
      });

      if (rpcError) {
        console.error('Error executing insert_employment_report function:', rpcError.message);
        return handleSupabaseError<null>(rpcError, null);
      }

      // Fetch the latest report with profile information
      const { data: recentReport, error: fetchError } = await supabase
        .from("employment_reports")
        .select(`
          *,
          employment_facilitation_entries (*),
          profile:profiles (
            id,
            role,
            name,
            municipal_mayor,
            address
          )
        `)
        .eq("reporting_period", reportingPeriod)
        .eq("reporting_office", reportingOffice)
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !recentReport) {
        console.error("Failed to fetch newly inserted report");
        return handleSupabaseError<null>(fetchError, null);
      }

      return {
        ...recentReport,
        entries: recentReport.employment_facilitation_entries || [],
        profile: recentReport.profile
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
      const { data: report, error: reportError } = await supabase
        .from('employment_reports')
        .select(`
          *,
          employment_facilitation_entries (*),
          profile:profiles (
            id,
            role,
            name,
            municipal_mayor,
            address
          )
        `)
        .eq('id', id)
        .single();

      if (reportError) return handleSupabaseError<null>(reportError, null);
      if (!report) return null;

      return {
        ...report,
        entries: report.employment_facilitation_entries || [],
        profile: report.profile
      };
    } catch (error) {
      return handleSupabaseError<null>(error, null);
    }
  },

  /**
   * Get all reports for a user by userId (UUID)
   * @param userId - The user's UUID (profile_id)
   */
  async getUserReports(userId: string): Promise<CompleteReport[]> {
    try {
      if (!userId) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }

      const { data: reports, error: reportsError } = await supabase
        .from('employment_reports')
        .select(`
          *,
          employment_facilitation_entries (*),
          profile:profiles (
            id,
            role,
            name,
            municipal_mayor,
            address
          )
        `)
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      // Debug log
      console.log('Fetching reports for userId:', userId, 'Error:', reportsError, 'Data:', reports);

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        throw reportsError;
      }

      if (!reports || reports.length === 0) {
        return [];
      }

      // Validate and transform the data
      return reports.map(report => {
        // Ensure all required fields are present
        if (!report.id || !report.reporting_period || !report.reporting_office) {
          console.warn('Invalid report data:', report);
          return null;
        }

        return {
          ...report,
          entries: report.employment_facilitation_entries || [],
          profile: report.profile
        };
      }).filter((report): report is CompleteReport => report !== null);
    } catch (error) {
      console.error('Unexpected error in getUserReports:', error);
      throw error;
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

  /**
   * Get the previous report for a user by userId (UUID)
   * @param reportingPeriod - The reporting period (e.g., '2024-05')
   * @param reportingOffice - The reporting office name
   * @param userId - The user's UUID (profile_id)
   */
  async getPreviousReport(reportingPeriod: string, reportingOffice: string, userId: string) {
    // Query for the most recent report before the given period for the office and user
    // (Assume reportingPeriod is in YYYY-MM format)
    const { data, error } = await supabase
      .from("employment_reports")
      .select(`
        *,
        employment_facilitation_entries(
          program,
          indicator,
          sub_indicator,
          sub_sub_indicator,
          previous_report_period,
          current_period,
          previous_female_count,
          current_female_count,
          remarks
        )
      `)
      .eq("reporting_office", reportingOffice)
      .eq("profile_id", userId)
      .lt("reporting_period", reportingPeriod)
      .order("reporting_period", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Error fetching previous report:', error);
      return null;
    }
    return data;
  },
};


