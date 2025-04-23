import { supabase, handleSupabaseError } from '../lib/supabase';
import { CompleteReport, EmploymentFacilitation, Report } from '../types/database.types';



export const reportService = {
  async createReport(
    reportingPeriod: string,
    reportingOffice: string,
    entries: Omit<EmploymentFacilitation, 'id' | 'report_id' | 'created_at' | 'updated_at'>[]
  ): Promise<CompleteReport | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }
  
      if (!session?.user?.id) {
        console.error('No authenticated user found');
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
      });
  
      if (rpcError) {
        console.error('Error executing insert_employment_report function:', rpcError.message);
        return handleSupabaseError<null>(rpcError, null);
      }
  
      // Optionally fetch the latest report to return
      const { data: recentReports, error: fetchError } = await supabase
        .from("employment_reports")
        .select("*, employment_facilitation_entries(*)")
        .eq("reporting_period", reportingPeriod)
        .eq("reporting_office", reportingOffice)
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
      const { data, error } = await supabase
        .from('employment_reports')  // Correct table for reports
        .select('*, employment_facilitation_entries(*)')  // Ensure entries are included
        .order('created_at', { ascending: false });  // Optional: Sorting reports by creation date

      if (error) return handleSupabaseError<CompleteReport[]>(error, []);
      return data || [];
    } catch (error) {
      return handleSupabaseError<CompleteReport[]>(error, []);
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
