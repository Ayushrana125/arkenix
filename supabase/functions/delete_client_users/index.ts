// Supabase Edge Function: delete_client_users
// Deletes user data from clients_user_data table filtered by client_id for security

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
    const { client_id, user_ids } = await req.json();

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

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'user_ids is required and must be a non-empty array',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate all user_ids are strings or numbers
    const validUserIds = user_ids.filter((id) => {
      return id !== null && id !== undefined && (typeof id === 'string' || typeof id === 'number');
    });

    if (validUserIds.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'No valid user_ids provided',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert all IDs to strings for consistency
    const userIdsAsStrings = validUserIds.map((id) => String(id));

    // Delete users - CRITICAL: Filter by client_id to prevent unauthorized deletions
    // This ensures users can only delete their own client's data
    const { data, error } = await supabase
      .from('clients_user_data')
      .delete()
      .eq('client_id', client_id) // Security: Only delete from this client's data
      .in('id', userIdsAsStrings)
      .select();

    if (error) {
      console.error('Delete error:', error);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Failed to delete users: ${error.message}`,
          deleted: 0,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const deletedCount = data?.length || 0;

    // Return success response
    return new Response(
      JSON.stringify({
        status: 'success',
        deleted: deletedCount,
        message: `Successfully deleted ${deletedCount} user(s)`,
        deleted_ids: data?.map((row) => row.id) || [],
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
        deleted: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

