import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    
    if (req.method === 'GET') {
      // Get query parameters for filtering
      const limit = parseInt(url.searchParams.get('limit') || '100')
      const from = url.searchParams.get('from') // ISO date string
      const to = url.searchParams.get('to') // ISO date string
      const lowVoltageOnly = url.searchParams.get('low_voltage') === 'true'

      let query = supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (from) {
        query = query.gte('created_at', from)
      }
      if (to) {
        query = query.lte('created_at', to)
      }
      if (lowVoltageOnly) {
        query = query.eq('is_low_voltage', true)
      }

      const { data, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        count: data.length,
        readings: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'POST') {
      // Insert new reading
      const body = await req.json()
      
      const { voltage, current, watts, kilowatts, is_low_voltage } = body

      if (voltage === undefined || current === undefined) {
        return new Response(JSON.stringify({
          success: false,
          error: 'voltage and current are required'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { data, error } = await supabase
        .from('sensor_readings')
        .insert({
          voltage,
          current,
          watts: watts || voltage * current,
          kilowatts: kilowatts || (voltage * current) / 1000,
          is_low_voltage: is_low_voltage || voltage < 50
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        reading: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      })
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
