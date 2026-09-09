CREATE TABLE IF NOT EXISTS staff_identity (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  email TEXT NOT NULL CHECK (email LIKE '%_@_%._%')
);

CREATE TABLE IF NOT EXISTS virtual_webmasters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  primary_contact_name TEXT NOT NULL CHECK (length(trim(primary_contact_name)) > 0),
  primary_contact_email TEXT NOT NULL CHECK (primary_contact_email LIKE '%_@_%._%'),
  request_details TEXT NOT NULL CHECK (length(trim(request_details)) > 0),
  csm_name TEXT,
  csm_email TEXT CHECK (csm_email IS NULL OR csm_email = '' OR csm_email LIKE '%_@_%._%'),
  lifecycle_state TEXT NOT NULL DEFAULT 'active'
    CHECK (lifecycle_state IN ('awaiting_review', 'active', 'extended', 'closing', 'closed')),
  assigned_vwm_id TEXT REFERENCES virtual_webmasters(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS additional_recipients (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email LIKE '%_@_%._%'),
  UNIQUE (school_id, email)
);

CREATE TABLE IF NOT EXISTS global_templates (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('teresa', 'vwm')),
  subject TEXT NOT NULL CHECK (length(trim(subject)) > 0),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  variables_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_automation (
  school_id TEXT PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
  kickoff_date TEXT NOT NULL,
  closing_date TEXT NOT NULL,
  kickoff_enabled INTEGER NOT NULL DEFAULT 1 CHECK (kickoff_enabled IN (0, 1)),
  six_week_enabled INTEGER NOT NULL DEFAULT 1 CHECK (six_week_enabled IN (0, 1)),
  two_week_enabled INTEGER NOT NULL DEFAULT 1 CHECK (two_week_enabled IN (0, 1)),
  closing_enabled INTEGER NOT NULL DEFAULT 1 CHECK (closing_enabled IN (0, 1)),
  used_hours_enabled INTEGER NOT NULL DEFAULT 1 CHECK (used_hours_enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (date(kickoff_date) IS NOT NULL),
  CHECK (date(closing_date) IS NOT NULL),
  CHECK (date(closing_date) >= date(kickoff_date))
);

CREATE TABLE IF NOT EXISTS workflow_occurrences (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  workflow TEXT NOT NULL
    CHECK (workflow IN ('kickoff', 'six_week', 'two_week', 'closing', 'used_hours', 'extension')),
  source_key TEXT NOT NULL,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'superseded')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  UNIQUE (school_id, workflow, source_key)
);

CREATE INDEX IF NOT EXISTS workflow_occurrences_due
  ON workflow_occurrences(status, due_at);

CREATE TABLE IF NOT EXISTS extension_events (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  previous_closing_date TEXT NOT NULL,
  new_closing_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (date(new_closing_date) > date(previous_closing_date))
);

CREATE TABLE IF NOT EXISTS simulated_sent_emails (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  occurrence_id TEXT NOT NULL REFERENCES workflow_occurrences(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL REFERENCES global_templates(key),
  sequence_order INTEGER NOT NULL CHECK (sequence_order > 0),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipients_json TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  processed_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'simulated_sent' CHECK (status = 'simulated_sent'),
  UNIQUE (school_id, occurrence_id, template_key)
);

CREATE INDEX IF NOT EXISTS simulated_sent_emails_school
  ON simulated_sent_emails(school_id, processed_at DESC);
