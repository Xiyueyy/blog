/**
 * Astro 集成插件 - 访客通知脚本注入
 *
 * 使用 astro:build:done 钩子，在构建完成后自动将通知脚本
 * 注入到所有 HTML 页面的 </head> 前。
 *
 * 优点：
 * - 不需要修改任何 Firefly 源文件
 * - 不需要修改构建命令（不需要 sed）
 * - 不需要 public/js/ 外部文件
 * - 100% 可靠（直接操作生成的 HTML）
 *
 * 用法：在 astro.config.mjs 中：
 *   import visitorNotify from './src/integrations/visitor-notify.mjs';
 *   integrations: [ ..., visitorNotify() ]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 内联脚本：不依赖外部 JS 文件
const SCRIPT = `<script>
(function(){
  if(sessionStorage.getItem("_visitor_notified"))return;
  sessionStorage.setItem("_visitor_notified","1");
  fetch("/api/notify",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      page:document.title||window.location.pathname,
      time:new Date().toLocaleString("zh-CN"),
      referrer:document.referrer||""
    })
  }).catch(function(){});
})();
</script>`;

/**
 * 递归查找所有 HTML 文件
 */
function findHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            findHtmlFiles(fullPath, files);
        } else if (item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

export default function visitorNotify() {
    return {
        name: 'visitor-notify',
        hooks: {
            'astro:build:done': ({ dir }) => {
                const distDir = fileURLToPath(dir);
                const htmlFiles = findHtmlFiles(distDir);
                let count = 0;
                for (const file of htmlFiles) {
                    let content = fs.readFileSync(file, 'utf-8');
                    if (content.includes('</head>') && !content.includes('_visitor_notified')) {
                        content = content.replace('</head>', SCRIPT + '</head>');
                        fs.writeFileSync(file, content, 'utf-8');
                        count++;
                    }
                }
                console.log(`[visitor-notify] ✅ 已注入 ${count} 个 HTML 文件`);
            }
        }
    };
}
