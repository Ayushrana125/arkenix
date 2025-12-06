// Supabase Edge Function: update_client_user
// Updates user data in clients_user_data table filtered by client_id for security

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
    const { client_id, user_id, user_data } = await req.json();

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

    if (!user_id || (typeof user_id !== 'string' && typeof user_id !== 'number')) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'user_id is required and must be a string or number',
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

    // Remove id and client_id from user_data to prevent overwriting
    const { id, client_id: _, ...updateData } = user_data;

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'No valid fields to update',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update user - CRITICAL: Filter by client_id to prevent unauthorized updates
    const { data, error } = await supabase
      .from('clients_user_data')
      .update(updateData)
      .eq('client_id', client_id) // Security: Only update this client's data
      .eq('id', String(user_id))
      .select();

    if (error) {
      console.error('Update error:', error);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Failed to update user: ${error.message}`,
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
          message: 'User not found or you do not have permission to update this user',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'User updated successfully',
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
