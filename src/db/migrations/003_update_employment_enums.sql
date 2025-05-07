-- Add profile_id column to employment_reports
ALTER TABLE employment_reports 
ADD COLUMN profile_id INTEGER REFERENCES profiles(id);