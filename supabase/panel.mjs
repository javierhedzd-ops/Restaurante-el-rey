#!/usr/bin/env node
// Herramienta para manejar el panel del dueño en Supabase (para Ari o Claude).
// Sin dependencias: Node 18 o más nuevo.
//
// Necesita el token personal de Supabase de Javi en la variable
// SUPABASE_ACCESS_TOKEN (empieza con sbp_). Nunca lo escribas en el repositorio.
//
//   node supabase/panel.mjs estado
//   node supabase/panel.mjs editores
//   node supabase/panel.mjs editor-agregar correo@ejemplo.com [contraseña]
//   node supabase/panel.mjs editor-quitar correo@ejemplo.com
//   node supabase/panel.mjs contrasena correo@ejemplo.com [nueva]
//   node supabase/panel.mjs precios
//   node supabase/panel.mjs precio-borrar <id>        (vuelve al precio de index.html)
//   node supabase/panel.mjs fotos
//   node supabase/panel.mjs foto-borrar <clave>       (vuelve a fotos/<clave>.jpg)
//   node supabase/panel.mjs instalar                  (corre supabase/instalar.sql)
//   node supabase/panel.mjs sql "select ..."          (consulta directa)

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const PROYECTO = 'nnaecikpyqhhmvuxtlhz';        // Carnitas-el-rey
const API = `https://api.supabase.com/v1/projects/${PROYECTO}`;
const SITIO = `https://${PROYECTO}.supabase.co`;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

function falla(msg) { console.error('Error: ' + msg); process.exit(1); }
if (!TOKEN) falla('falta SUPABASE_ACCESS_TOKEN (el token personal de Supabase de Javi).');

async function api(ruta, opciones = {}) {
  const r = await fetch(API + ruta, {
    ...opciones,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  });
  const texto = await r.text();
  if (!r.ok) falla(`Supabase respondió ${r.status}: ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : null;
}
const sql = q => api('/database/query', { method: 'POST', body: JSON.stringify({ query: q }) });
const texto = v => `'${String(v).replace(/'/g, "''")}'`;

let secreta = null;   // llave secreta del proyecto: solo en memoria, nunca se imprime
async function llaveSecreta() {
  if (secreta) return secreta;
  const llaves = await api('/api-keys?reveal=true');
  const k = llaves.find(k => k.type === 'secret') || llaves.find(k => k.name === 'service_role');
  if (!k || !k.api_key) falla('no encontré la llave secreta del proyecto.');
  return (secreta = k.api_key);
}
async function auth(ruta, opciones = {}) {
  const k = await llaveSecreta();
  const headers = { apikey: k, 'Content-Type': 'application/json' };
  if (!k.startsWith('sb_')) headers.Authorization = `Bearer ${k}`;
  const r = await fetch(`${SITIO}/auth/v1${ruta}`, { ...opciones, headers });
  const t = await r.text();
  if (!r.ok) falla(`Auth respondió ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
async function buscarUsuario(correo) {
  const d = await auth('/admin/users?per_page=1000');
  return (d.users || []).find(u => (u.email || '').toLowerCase() === correo);
}
const contrasenaNueva = () => randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);

const [cmd, a, b] = process.argv.slice(2);
const correo = (a || '').trim().toLowerCase();

switch (cmd) {
  case 'estado': {
    const p = await api('');
    const c = await api('/config/auth');
    const [r] = await sql(`select (select count(*) from public.precios) precios, (select count(*) from public.fotos) fotos,
      (select string_agg(email, ', ') from public.editores) editores`);
    console.log(`Proyecto: ${p.name} (${p.status})`);
    console.log(`Registro de cuentas nuevas: ${c.disable_signup ? 'apagado (bien)' : 'ENCENDIDO: apágalo'}`);
    console.log(`Editores: ${r.editores || 'ninguno'}`);
    console.log(`Precios cambiados: ${r.precios} · Fotos subidas: ${r.fotos}`);
    break;
  }
  case 'editores':
    console.table(await sql('select email from public.editores order by email'));
    break;
  case 'editor-agregar': {
    if (!correo.includes('@')) falla('uso: editor-agregar correo@ejemplo.com [contraseña]');
    await sql(`insert into public.editores (email) values (${texto(correo)}) on conflict do nothing`);
    const existe = await buscarUsuario(correo);
    if (existe) { console.log(`${correo} ya tenía usuario; ahora también es editor.`); break; }
    const clave = b || contrasenaNueva();
    await auth('/admin/users', { method: 'POST', body: JSON.stringify({ email: correo, password: clave, email_confirm: true }) });
    console.log(`Listo: ${correo} puede editar.`);
    console.log(`Contraseña: ${clave}`);
    console.log('Entra en https://javierhedzd-ops.github.io/Restaurante-el-rey/#dueno');
    break;
  }
  case 'editor-quitar': {
    if (!correo.includes('@')) falla('uso: editor-quitar correo@ejemplo.com');
    await sql(`delete from public.editores where email = ${texto(correo)}`);
    const u = await buscarUsuario(correo);
    if (u) await auth(`/admin/users/${u.id}`, { method: 'DELETE' });
    console.log(`${correo} ya no puede editar${u ? ' y su usuario se borró' : ''}.`);
    break;
  }
  case 'contrasena': {
    const u = await buscarUsuario(correo);
    if (!u) falla(`no existe el usuario ${correo}`);
    const clave = b || contrasenaNueva();
    await auth(`/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ password: clave }) });
    console.log(`Contraseña nueva de ${correo}: ${clave}`);
    break;
  }
  case 'precios':
    console.table(await sql('select id, precio, actualizado from public.precios order by actualizado desc'));
    break;
  case 'precio-borrar':
    if (!a) falla('uso: precio-borrar <id del platillo>');
    await sql(`delete from public.precios where id = ${texto(a)}`);
    console.log(`Listo: ${a} vuelve al precio de index.html.`);
    break;
  case 'fotos':
    console.table(await sql('select clave, actualizado from public.fotos order by actualizado desc'));
    break;
  case 'foto-borrar':
    if (!a) falla('uso: foto-borrar <clave>');
    await sql(`delete from public.fotos where clave = ${texto(a)}`);
    { const k = await llaveSecreta(); const h = { apikey: k }; if (!k.startsWith('sb_')) h.Authorization = `Bearer ${k}`;
      await fetch(`${SITIO}/storage/v1/object/fotos/${a}.jpg`, { method: 'DELETE', headers: h }); }
    console.log(`Listo: ${a} vuelve a fotos/${a}.jpg y la foto subida se borró.`);
    break;
  case 'instalar': {
    const ruta = new URL('./instalar.sql', import.meta.url);
    await sql(readFileSync(ruta, 'utf8'));
    await api('/config/auth', { method: 'PATCH', body: JSON.stringify({ disable_signup: true }) });
    console.log('Instalado: tablas, carpeta de fotos, reglas y registro apagado.');
    break;
  }
  case 'sql':
    if (!a) falla('uso: sql "select ..."');
    console.log(JSON.stringify(await sql(a), null, 2));
    break;
  default:
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).map(l => l.slice(3)).join('\n'));
}
