import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const IPTV_HOST = 'http://cdnbrux.top';
const USER = '593114288';
const PASS = '948423782';

// Proxy para playlist .m3u8
app.get('/live/:streamFile', async (req, res) => {
  const file = req.params.streamFile;
  const url = `${IPTV_HOST}/live/${USER}/${PASS}/${file}`;

  try {
    const response = await fetch(url, { redirect: 'follow' });

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error('Erro ao buscar playlist:', err.message);
    res.status(500).send('Erro ao buscar a playlist.');
  }
});

// Proxy para segmentos .ts
app.get('/hls/:tsSegment', async (req, res) => {
  const segment = req.params.tsSegment;
  const url = `${IPTV_HOST}/hls/${segment}`;

  try {
    const response = await fetch(url, { redirect: 'follow' });

    const contentType = response.headers.get('content-type') || 'video/MP2T';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Erro ao buscar segmento:', err.message);
    res.status(500).send('Erro ao buscar o segmento TS.');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy IPTV rodando em http://localhost:${PORT}`);
});
