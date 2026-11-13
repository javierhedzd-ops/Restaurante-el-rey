// Distancia por calles (no en línea recta) desde El Rey hasta el cliente.
// Sin llave usa OSRM (servicio comunitario gratuito, pide no pasar de 1 consulta por segundo).
// Si algún día se guarda el secreto ORS_KEY, usa OpenRouteService, que es más firme.
// El origen es fijo (el restaurante), así nadie puede usar esta función para otras rutas.
const ORIGEN = [-89.599178, 20.976046]; // [lng, lat] de Carnitas El Rey
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, content-type, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const resp = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resp({ error: 'metodo' }, 405);
  const llave = Deno.env.get('ORS_KEY');
  let lat: number, lng: number;
  try { ({ lat, lng } = await req.json()); } catch { return resp({ error: 'cuerpo' }, 400); }
  // Solo Mérida y alrededores (unos 60 km): evita gastar consultas en rutas absurdas.
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat - ORIGEN[1]) > 0.6 || Math.abs(lng - ORIGEN[0]) > 0.6) return resp({ error: 'fuera' }, 400);
  try {
    let metros: number | undefined;
    if (llave) {
      const r = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST', signal: AbortSignal.timeout(6000),
        headers: { Authorization: llave, 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: [ORIGEN, [lng, lat]] }),
      });
      if (r.ok) metros = (await r.json())?.routes?.[0]?.summary?.distance;
    }
    if (!Number.isFinite(metros)) {
      const url = `https://router.project-osrm.org/route/v1/driving/${ORIGEN[0]},${ORIGEN[1]};${lng},${lat}?overview=false`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'AriLabs-ElRey/1.0' } });
      if (r.ok) metros = (await r.json())?.routes?.[0]?.distance;
    }
    if (!Number.isFinite(metros)) return resp({ error: 'sin_ruta' }, 502);
    return resp({ km: Math.round((metros as number) / 100) / 10 });
  } catch (_) { return resp({ error: 'red' }, 504); }
});
