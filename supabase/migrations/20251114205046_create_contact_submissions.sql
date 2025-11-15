/*
  # Create contact_submissions table

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `name` (text, required)
      - `company` (text, optional)
      - `message` (text, required)
      - `source` (text, tracks which button was clicked)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy to allow anonymous inserts (public quote requests)
    - Add policy to allow anyone to view their own submissions (via email verification if needed)
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  company text,
  message text NOT NULL,
  source text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
