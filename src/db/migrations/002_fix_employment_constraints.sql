-- Parent report
CREATE TABLE employment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporting_period TEXT NOT NULL,
  reporting_office TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Child rows
CREATE TABLE employment_facilitation_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES employment_reports(id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  indicator TEXT NOT NULL,
  sub_indicator TEXT,
  sub_sub_indicator TEXT,
  previous_report_period INT NOT NULL,
  current_period INT NOT NULL,
  remarks TEXT
);
