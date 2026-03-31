/**
 * GitHub Webhook 自动部署监听器
 * 接收 GitHub 推送事件，自动拉取代码并重新构建博客
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { exec } = require('child_process');

// 配置
const PORT = 9000;
const SECRET = 'firefly-webhook-secret-2026';
const REPO_DIR = '/root/Firefly';
// 部署流程：拉取 → 更新 updated → 同步回 GitHub → 构建 → 部署
const SYNC_CMD = `git add -A && git diff --cached --quiet || git commit -m "Bot: auto-update dates" && git push backup master:main --force`;
const DEPLOY_CMD = `cd ${REPO_DIR} && git pull backup main --no-rebase && python3 ${REPO_DIR}/update-dates.py && ${SYNC_CMD} && pnpm build && rsync -av --delete dist/ /var/www/blog/`;

// Bark 推送配置
const BARK_URL = 'https://bark.ruawd.top/wiamJRL3HgLUYTqy6GmtxL';
const BARK_ICON = 'https://sls.ruawd.de/uploads/20260210/b32c85255d9b8fed7099e4935d15436f.png';

// 日志函数
function log(msg) {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${time}] ${msg}`);
}

// Bark 推送通知
function sendBark(title, body) {
    const url = BARK_URL.replace(/\/$/, '') + '/' +
        encodeURIComponent(title) + '/' +
        encodeURIComponent(body) +
        '?icon=' + encodeURIComponent(BARK_ICON) +
        '&group=blog-deploy';

    https.get(url, (res) => {
        res.on('data', () => { });
        res.on('end', () => log('📱 Bark 通知已发送'));
    }).on('error', (err) => {
        log(`📱 Bark 通知失败: ${err.message}`);
    });
}

// 验证 GitHub Webhook 签名
function verifySignature(payload, signature) {
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const digest = 'sha256=' + hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// 是否正在部署中（防止重复触发）
let isDeploying = false;
// 当前部署的提交信息
let currentCommitMsg = '';

// 执行部署
function deploy(commitMsg) {
    if (isDeploying) {
        log('⏳ 已有部署任务在执行，跳过');
        return;
    }

    isDeploying = true;
    currentCommitMsg = commitMsg || '';
    log('🚀 开始自动部署...');

    exec(DEPLOY_CMD, { timeout: 300000 }, (error, stdout, stderr) => {
        isDeploying = false;
        if (error) {
            log(`❌ 部署失败: ${error.message}`);
            if (stderr) log(`STDERR: ${stderr.slice(0, 500)}`);
            sendBark('❌ 博客部署失败', `${currentCommitMsg}\n${error.message.slice(0, 100)}`);
        } else {
            log('✅ 部署成功！');
            if (stdout) log(stdout.slice(-200));
            sendBark('✅ 博客已自动更新', currentCommitMsg || '部署成功');
        }
    });
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 健康检查
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    // 只处理 POST /webhook
    if (req.method !== 'POST' || req.url !== '/webhook') {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        // 验证签名
        const signature = req.headers['x-hub-signature-256'];
        if (!verifySignature(body, signature)) {
            log('⚠️ Webhook 签名验证失败');
            res.writeHead(401);
            res.end('Unauthorized');
            return;
        }

        // 解析事件
        const event = req.headers['x-github-event'];
        log(`📨 收到 GitHub 事件: ${event}`);

        if (event === 'push') {
            try {
                const payload = JSON.parse(body);
                const branch = payload.ref?.replace('refs/heads/', '');
                log(`📌 推送到分支: ${branch}`);

                if (branch === 'main') {
                    const committer = payload.head_commit?.committer?.name || 'unknown';
                    const message = payload.head_commit?.message || '';
                    log(`📝 提交: ${message} (by ${committer})`);

                    // Bot 直接在 VPS 操作后 push 的提交，不需要重新拉取构建
                    if (message.startsWith('Bot:')) {
                        log('⏭️ Bot 提交，跳过自动部署（VPS 已是最新）');
                    } else {
                        deploy(message);
                    }
                } else {
                    log(`⏭️ 跳过非 main 分支的推送`);
                }
            } catch (e) {
                log(`❌ 解析 payload 失败: ${e.message}`);
            }
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    });
});

server.listen(PORT, () => {
    log(`🎯 Webhook 监听器已启动，端口: ${PORT}`);
    log(`📎 Webhook URL: http://your-server:${PORT}/webhook`);
    log(`🔑 Secret: ${SECRET}`);
});
