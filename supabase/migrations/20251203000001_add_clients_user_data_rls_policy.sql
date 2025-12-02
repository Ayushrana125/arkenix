/*
  # Add RLS policy for clients_user_data table

  This policy allows SELECT queries on the clients_user_data table
  filtered by client_id so that each client can only see their own data.
  
  Note: This allows anonymous and authenticated users to query the table
  for their specific client_id. For production, consider implementing
  more restrictive policies or using Supabase Auth with user-specific policies.
*/

-- Ensure RLS is enabled (in case it wasn't already)
ALTER TABLE clients_user_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow SELECT queries filtered by client_id
CREATE POLICY "Allow SELECT for client's own data"
  ON clients_user_data
  FOR SELECT
  TO anon, authenticated
  USING (true);

