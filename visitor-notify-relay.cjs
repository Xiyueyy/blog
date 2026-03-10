
const BARK_URL = 'https://bark.ruawd.top/wiamJRL3HgLUYTqy6GmtxL';
const BARK_ICON = 'https://sls.ruawd.de/uploads/20260210/b32c85255d9b8fed7099e4935d15436f.png';
const PORT = 3456; // Go back to 3456
const ALLOWED_ORIGINS = ['*'];

const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    // CORS
    const origin = req.headers.origin || '*';
    const allowOrigin = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : '');
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (req.method !== 'POST' || !req.url.startsWith('/notify')) { res.writeHead(404); res.end('Not Found'); return; }

    // DEBUG: Log headers
    console.log('[Headers]', JSON.stringify(req.headers));

    // Get Visitor IP
    const visitorIp = req.headers['cf-connecting-ip']
        || req.headers['x-real-ip']
        || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || req.socket.remoteAddress
        || 'unknown';
    
    console.log('[Visitor IP]', visitorIp);

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        let data = {};
        try { data = JSON.parse(body); } catch (e) { }
        const page = data.page || '';
        const time = data.time || new Date().toLocaleString('zh-CN');
        const referrer = data.referrer || '';

        // IP Lookup
        http.get(`http://ip-api.com/json/${visitorIp}?lang=zh-CN&fields=status,country,regionName,city,isp,query`, (ipRes) => {
            let ipData = '';
            ipRes.on('data', d => { ipData += d; });
            ipRes.on('end', () => {
                let ipInfo = {};
                try { ipInfo = JSON.parse(ipData); } catch (e) { }
                const ip = ipInfo.query || visitorIp;
                const location = ipInfo.status === 'success' ? ((ipInfo.country||'')+' '+(ipInfo.regionName||'')+' '+(ipInfo.city||'')).trim() : '未知位置';
                const isp = ipInfo.isp || '未知';
                
                sendBark(ip, location, isp, page, time, referrer);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            });
        }).on('error', () => {
            sendBark(visitorIp, '查询失败', '', page, time, referrer);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        });
    });
});

function sendBark(ip, location, isp, page, time, referrer) {
    const title = encodeURIComponent('📍 博客访客');
    const bodyParts = ['🌐 IP: ' + ip, '📍 位置: ' + location];
    if (isp && isp !== '未知') bodyParts.push('🏢 运营商: ' + isp);
    bodyParts.push('📄 页面: ' + page);
    bodyParts.push('🕐 时间: ' + time);
    if (referrer) bodyParts.push('🔗 来源: ' + referrer);
    const pushBody = encodeURIComponent(bodyParts.join('\n'));
    let barkFullUrl = BARK_URL.replace(/\/$/, '') + '/' + title + '/' + pushBody;
    if (BARK_ICON) barkFullUrl += '?icon=' + encodeURIComponent(BARK_ICON);
    
    const parsed = new URL(barkFullUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const barkReq = client.get(barkFullUrl, (barkRes) => {
        barkRes.on('data', () => {});
        barkRes.on('end', () => { console.log(`[Sent] ${ip} | ${location}`); });
    });
    barkReq.on('error', (err) => {});
    barkReq.end();
}

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Relay running on ${PORT}`);
});
