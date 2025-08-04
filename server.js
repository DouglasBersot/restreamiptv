const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

const IPTV_HOST = 'http://cdnbrux.top';
const USER = '593114288';
const PASS = '948423782';

// Proxy para playlist .m3u8
app.use('/live/:streamFile', createProxyMiddleware({
  target: IPTV_HOST,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const file = req.params.streamFile;
    return `/live/${USER}/${PASS}/${file}`;
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    // Desabilita cache para forçar atualização da playlist
    proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    proxyRes.headers['Pragma'] = 'no-cache';
    proxyRes.headers['Expires'] = '0';
  }
}));

// Proxy para segmentos .ts
app.use('/hls/:tsSegment', createProxyMiddleware({
  target: IPTV_HOST,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    return `/hls/${req.params.tsSegment}`;
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    // Também prevenir cache agressivo para .ts (evitar stale chunks)
    proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    proxyRes.headers['Pragma'] = 'no-cache';
    proxyRes.headers['Expires'] = '0';
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy IPTV rodando em http://localhost:${PORT}`);
});
