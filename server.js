const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const IPTV_HOST = 'http://cdnbrux.top';
const USER = '593114288';
const PASS = '948423782';

// Função para setar headers CORS e anti-cache
const setHeaders = (res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
};

// Proxy para playlist M3U8
app.get('/live/:streamFile', async (req, res) => {
  const file = req.params.streamFile;
  const url = `${IPTV_HOST}/live/${USER}/${PASS}/${file}`;

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const body = await response.text();
    setHeaders(res);
    res.status(response.status).send(body);
  } catch (error) {
    console.error('Erro ao buscar playlist:', error.message);
    res.sendStatus(500);
  }
});

// Proxy para segmentos TS
app.get('/hls/:segment', async (req, res) => {
  const segment = req.params.segment;
  const query = req.url.split('?')[1] || '';
  const url = `${IPTV_HOST}/hls/${segment}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const buffer = await response.arrayBuffer();
    setHeaders(res);
    res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro ao buscar TS:', error.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
