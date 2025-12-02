/*
  # Add RLS policy for arkenix_clients table

  This policy allows SELECT queries on the arkenix_clients table
  so that login authentication can check username and password.
  
  Note: This allows anonymous users to query the table for login purposes.
  For production, consider implementing more restrictive policies or
  using Supabase Auth instead of direct password checks.
*/

-- Ensure RLS is enabled (in case it wasn't already)
ALTER TABLE arkenix_clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow SELECT queries for login authentication
CREATE POLICY "Allow SELECT for login authentication"
  ON arkenix_clients
  FOR SELECT
  TO anon, authenticated
  USING (true);

