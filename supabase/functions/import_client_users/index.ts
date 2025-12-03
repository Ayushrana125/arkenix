// Supabase Edge Function: import_client_users
// Imports validated user data into clients_user_data table

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
    const { client_id, rows } = await req.json();

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

    if (!Array.isArray(rows)) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'rows must be an array',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'rows array cannot be empty',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare rows with client_id injected into each row
    const rowsWithClientId = rows.map((row) => ({
      ...row,
      client_id: client_id, // Auto-inject client_id
    }));

    // Insert rows in batches of 500
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < rowsWithClientId.length; i += BATCH_SIZE) {
      const batch = rowsWithClientId.slice(i, i + BATCH_SIZE);

      try {
        const { data, error } = await supabase
          .from('clients_user_data')
          .insert(batch)
          .select();

        if (error) {
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
          console.error('Batch insert error:', error);
        } else {
          totalInserted += data?.length || batch.length;
        }
      } catch (err: any) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${err.message}`);
        console.error('Batch insert exception:', err);
      }
    }

    // Return response
    if (errors.length > 0 && totalInserted === 0) {
      // All batches failed
      return new Response(
        JSON.stringify({
          status: 'error',
          message: `Failed to insert rows: ${errors.join('; ')}`,
          inserted: 0,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (errors.length > 0) {
      // Partial success
      return new Response(
        JSON.stringify({
          status: 'partial_success',
          inserted: totalInserted,
          message: `Inserted ${totalInserted} rows with some errors: ${errors.join('; ')}`,
          errors: errors,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Full success
      return new Response(
        JSON.stringify({
          status: 'success',
          inserted: totalInserted,
          message: 'Rows imported successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
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

