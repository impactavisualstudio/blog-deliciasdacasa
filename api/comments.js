// api/comments.js — Vercel KV - agora vai
import { kv } from '@vercel/kv';

function cors(res, reqOrigin = '') {
  const PROD1 = 'https://blog-deliciasdacasa.vercel.app';
  const LOCAL = 'http://localhost:8080';
  let origin = PROD1;
  if (/^https?:\/\/[^/]+\.vercel\.app$/.test(reqOrigin)) origin = reqOrigin;
  if (reqOrigin === LOCAL) origin = LOCAL;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const esc = (s, n) => String(s || '').slice(0, n).replace(/[<>]/g, c => (c === '<' ? '&lt;' : '&gt;'));
const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default async function handler(req, res) {
  cors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const isGet = req.method === 'GET';
  const slug = isGet ? req.query.slug : req.body?.slug;
  const cleanSlug = esc(slug, 300).trim();
  if (!cleanSlug) return res.status(400).json({ error: 'slug obrigatório' });

  const key = `comments:${cleanSlug}`;

  try {
    if (isGet) {
      const raw = await kv.lrange(key, 0, 199);
      const items = (raw || []).map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const name = esc(req.body?.name, 80).trim();
      const body = esc(req.body?.body, 2000).trim();
      if (!name || !body) return res.status(400).json({ error: 'name e body são obrigatórios' });

      // anti-flood: 30s por IP+slug
      const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
        || req.socket?.remoteAddress || '0.0.0.0';
      const gateKey = `gate:${cleanSlug}:${ip}`;
      const nx = await kv.set(gateKey, '1', { ex: 30, nx: true });
      if (nx === null) return res.status(429).json({ error: 'Aguarde alguns segundos e tente de novo.' });

      const comment = { id: newId(), name, body, created_at: new Date().toISOString() };
      await kv.lpush(key, JSON.stringify(comment));
      await kv.ltrim(key, 0, 999);
      return res.status(201).json(comment);
    }

    res.setHeader('Allow', 'GET,POST,OPTIONS');
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}