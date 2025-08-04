const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const IPTV_HOST = 'http://cdnbrux.top';
const USER = '593114288';
const PASS = '948423782';

// Cabeçalhos CORS e anti-cache
const setHeaders = (res, contentType) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': contentType
  });
};

// Proxy da playlist .m3u8
app.get('/live/:streamFile', async (req, res) => {
  const file = req.params.streamFile;
  const url = `${IPTV_HOST}/live/${USER}/${PASS}/${file}`;

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const body = await response.text();

    // Força os caminhos dos TS para passarem pelo proxy
    const playlist = body.replace(/\/hls\/([^\s?"]+\.ts)(\?[^"\s]*)?/g, (_, filename, query) => {
      return `/hls/${filename}${query || ''}`;
    });

    setHeaders(res, 'application/vnd.apple.mpegurl');
    res.status(200).send(playlist);
  } catch (error) {
    console.error('Erro ao buscar playlist:', error.message);
    res.sendStatus(500);
  }
});

// Proxy para os arquivos .ts
app.get('/hls/:segment', async (req, res) => {
  const segment = req.params.segment;
  const query = req.url.split('?')[1] || '';
  const url = `${IPTV_HOST}/hls/${segment}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const buffer = await response.arrayBuffer();
    setHeaders(res, 'video/MP2T');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro ao buscar TS:', error.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
