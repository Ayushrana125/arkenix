# Supabase Edge Function Setup Guide

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Select your project (Arkenix)

### Step 2: Navigate to Edge Functions
1. In the left sidebar, click on **"Edge Functions"** (under "Project Settings" or in the main menu)
2. If you don't see it, look for **"Functions"** in the sidebar

### Step 3: Create New Function
1. Click the **"Create a new function"** or **"New Function"** button
2. Function name: `import_client_users`
3. Click **"Create function"**

### Step 4: Copy and Paste the Code
1. Delete any default/template code in the editor
2. Copy the entire code from the section below
3. Paste it into the editor

### Step 5: Deploy
1. Click **"Deploy"** or **"Save"** button
2. Wait for deployment to complete (usually takes 10-30 seconds)

---

## Edge Function Code (Copy This Entire Block)

```typescript
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
    // Get environment variables (automatically available in Supabase)
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
```

---

## What This Function Does

1. **Receives Data**: Accepts POST requests with `client_id` and `rows` array
2. **Validates**: Checks that client_id exists and rows is an array
3. **Adds client_id**: Automatically adds `client_id` to each row before inserting
4. **Batch Insert**: Inserts rows in batches of 500 for better performance
5. **Returns Result**: Sends back how many rows were inserted

---

## Testing the Function

After deployment, you can test it from the Supabase dashboard:
1. Go to the function page
2. Click "Invoke" or "Test"
3. Use this test payload:

```json
{
  "client_id": "your-client-id-here",
  "rows": [
    {
      "first_name": "Test",
      "last_name": "User",
      "title": "Developer",
      "official_email": "test@example.com",
      "mobile_number": "+1234567890",
      "company": "Test Company",
      "industry": "Technology",
      "user_type": "lead"
    }
  ]
}
```

---

## Important Notes

- The function uses **Service Role Key** automatically (no need to configure)
- It bypasses Row Level Security (RLS) to insert data
- Environment variables (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are automatically available
- The function handles CORS automatically
- Errors are logged but don't crash the function

---

## If You Need Help

If you encounter any issues:
1. Check the function logs in the Supabase dashboard
2. Make sure the function name is exactly: `import_client_users`
3. Verify your `clients_user_data` table exists and has the correct columns
4. Check that the function is deployed (status should show "Active")

