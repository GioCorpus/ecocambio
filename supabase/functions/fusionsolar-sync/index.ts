import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FUSIONSOLAR_BASE = 'https://eu5.fusionsolar.huawei.com';

let xsrfToken: string | null = null;
let sessionCookies: string[] = [];

async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch(`${FUSIONSOLAR_BASE}/thirdData/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: username, systemCode: password }),
  });

  const setCookies = response.headers.getSetCookie?.() || [];
  sessionCookies = setCookies;
  
  const xsrf = setCookies.find(c => c.startsWith('XSRF-TOKEN='));
  if (xsrf) {
    xsrfToken = xsrf.split(';')[0].split('=')[1];
  }

  const data = await response.json();
  return data.failCode === 0;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (xsrfToken) headers['XSRF-TOKEN'] = xsrfToken;
  if (sessionCookies.length > 0) {
    headers['Cookie'] = sessionCookies.map(c => c.split(';')[0]).join('; ');
  }
  return headers;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, inverterId, credentials, stationCode } = await req.json();

    if (action === 'test_connection') {
      const loginSuccess = await login(credentials.username, credentials.password);
      if (!loginSuccess) {
        return new Response(JSON.stringify({ success: false, error: 'Login failed' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const stationsRes = await fetch(`${FUSIONSOLAR_BASE}/thirdData/stations`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ pageNo: 1 }),
      });
      const stations = await stationsRes.json();
      
      return new Response(JSON.stringify({ 
        success: true, 
        stations: stations.data?.list || [],
        message: `Found ${stations.data?.total || 0} stations`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'get_stations') {
      const loginSuccess = await login(credentials.username, credentials.password);
      if (!loginSuccess) throw new Error('Login failed');

      const stationsRes = await fetch(`${FUSIONSOLAR_BASE}/thirdData/stations`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ pageNo: 1 }),
      });
      const stations = await stationsRes.json();
      
      return new Response(JSON.stringify({ success: true, stations: stations.data?.list || [] }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'sync_readings') {
      const { data: inverter } = await supabase
        .from('inverters')
        .select('*, plants(*)')
        .eq('id', inverterId)
        .single();

      if (!inverter) throw new Error('Inverter not found');

      const apiCreds = inverter.api_credentials as { username?: string; password?: string; site_id?: string } | null;
      if (!apiCreds?.username || !apiCreds?.password) throw new Error('Missing credentials');

      const loginSuccess = await login(apiCreds.username, apiCreds.password);
      if (!loginSuccess) {
        await supabase.from('inverters').update({ status: 'offline' }).eq('id', inverterId);
        throw new Error('Login failed');
      }

      const stationCodeToUse = stationCode || apiCreds.site_id;
      if (!stationCodeToUse) throw new Error('No station code');

      const devListRes = await fetch(`${FUSIONSOLAR_BASE}/thirdData/getDevList`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ stationCodes: stationCodeToUse }),
      });
      const deviceList = await devListRes.json();
      const inverterDevices = (deviceList.data || []).filter((d: { devTypeId: number }) => d.devTypeId === 1);
      
      if (inverterDevices.length === 0) throw new Error('No inverters found');

      const devIds = inverterDevices.map((d: { id: number }) => d.id).join(',');
      const kpiRes = await fetch(`${FUSIONSOLAR_BASE}/thirdData/getDevRealKpi`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ devIds, devTypeId: 1 }),
      });
      const deviceKpis = await kpiRes.json();

      const now = new Date().toISOString();
      const readings = [];

      for (const device of inverterDevices) {
        const kpi = deviceKpis.data?.find((d: { devId: number }) => d.devId === device.id);
        if (kpi) {
          readings.push({
            inverter_id: inverterId,
            plant_id: inverter.plant_id,
            power_kw: (kpi.dataItemMap.active_power || 0) / 1000,
            energy_today_kwh: kpi.dataItemMap.day_cap || 0,
            energy_total_kwh: kpi.dataItemMap.total_cap || 0,
            temperature_c: kpi.dataItemMap.temperature || null,
            voltage_dc: kpi.dataItemMap.pv1_u || null,
            current_dc: kpi.dataItemMap.pv1_i || null,
            voltage_ac: kpi.dataItemMap.a_u || null,
            frequency_hz: kpi.dataItemMap.elec_freq || null,
            raw_data: kpi.dataItemMap,
            recorded_at: now,
          });
        }
      }

      if (readings.length > 0) {
        await supabase.from('readings').insert(readings);
      }

      await supabase.from('inverters').update({ status: 'online', last_seen_at: now }).eq('id', inverterId);

      return new Response(JSON.stringify({ success: true, readings_count: readings.length }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
