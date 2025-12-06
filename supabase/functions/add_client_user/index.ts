// Supabase Edge Function: add_client_user
// Adds a new user to clients_user_data table with client_id for security

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { client_id, user_data } = await req.json();

    // Validate request structure
    if (!client_id || typeof client_id !== 'string') {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'client_id is required and must be a string',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user_data || typeof user_data !== 'object') {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'user_data is required and must be an object',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare data for insertion
    const insertData = {
      ...user_data,
      client_id: client_id, // Ensure client_id is set
      created_at: new Date().toISOString(),
    };

    // Remove id if present (will be auto-generated)
    delete insertData.id;

    if (Object.keys(insertData).length <= 2) { // Only client_id and created_at
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'No valid user data provided',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert new user
    const { data, error } = await supabase
      .from('clients_user_data')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Failed to add user: ${error.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Failed to create user',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'User added successfully',
        data: data[0],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});