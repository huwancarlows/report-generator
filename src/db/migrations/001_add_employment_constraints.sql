CREATE OR REPLACE FUNCTION insert_employment_report(
  reporting_period TEXT,
  reporting_office TEXT,
  entries JSONB,
  profile_id INTEGER  -- Add profile_id parameter
)
RETURNS VOID AS $$
DECLARE
  report_id UUID;
  entry JSONB;
BEGIN
  -- Insert into parent report table with profile_id
  INSERT INTO employment_reports (reporting_period, reporting_office, profile_id)
  VALUES (reporting_period, reporting_office, profile_id)
  RETURNING id INTO report_id;

  -- Loop through each entry and insert
  FOR entry IN SELECT * FROM jsonb_array_elements(entries)
  LOOP
    INSERT INTO employment_facilitation_entries (
      report_id,
      program,
      indicator,
      sub_indicator,
      sub_sub_indicator,
      previous_report_period,
      current_period,
      remarks
    )
    VALUES (
      report_id,
      entry->>'program',
      entry->>'indicator',
      entry->>'sub_indicator',
      entry->>'sub_sub_indicator',
      (entry->>'previous_report_period')::INT,
      (entry->>'current_period')::INT,
      entry->>'remarks'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;