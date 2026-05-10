/*
  # Create bathing sessions tracking table

  1. New Tables
    - `bathing_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `mode` (text) - 'Bath', 'Shower', or 'Both'
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `duration_seconds` (integer, calculated)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bathing_sessions` table
    - Add policy for authenticated users to read/write/delete their own sessions
*/

CREATE TABLE IF NOT EXISTS bathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('Bath', 'Shower', 'Both')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_seconds integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bathing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON bathing_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON bathing_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON bathing_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON bathing_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_bathing_sessions_user_id ON bathing_sessions(user_id);
CREATE INDEX idx_bathing_sessions_start_time ON bathing_sessions(start_time DESC);
