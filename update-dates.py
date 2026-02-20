"""
自动更新 CMS 修改的文章的 updated 字段为当前时间。
只处理本次 git pull 中实际变更的 .md 文件（通过 git diff 检测）。
在 Webhook 部署流程中，git pull 后、pnpm build 前运行。
"""
import os
import re
import subprocess
from datetime import datetime, timezone, timedelta

CST = timezone(timedelta(hours=8))
REPO_DIR = "/root/Firefly"
POSTS_DIR = os.path.join(REPO_DIR, "src/content/posts")

# 获取本次 pull 中变更的文件（对比 ORIG_HEAD 和 HEAD）
try:
    result = subprocess.run(
        ["git", "diff", "--name-only", "ORIG_HEAD", "HEAD"],
        capture_output=True, text=True, cwd=REPO_DIR
    )
    changed_files = result.stdout.strip().split("\n") if result.stdout.strip() else []
except Exception:
    changed_files = []

# 只处理 posts 目录下的 .md 文件
changed_posts = [
    os.path.join(REPO_DIR, f) for f in changed_files
    if f.startswith("src/content/posts/") and f.endswith(".md")
]

if not changed_posts:
    print("没有文章被修改，跳过 updated 更新")
else:
    now_str = datetime.now(CST).strftime('%Y-%m-%dT%H:%M:%S+08:00')
    for md_file in changed_posts:
        if not os.path.exists(md_file):
            continue

        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()

        original = content

        # 如果有 updated 行，替换为当前时间
        if re.search(r'^updated:', content, re.MULTILINE):
            content = re.sub(
                r'^updated:.*$',
                f'updated: {now_str}',
                content, count=1, flags=re.MULTILINE
            )
        # 如果没有 updated 但有 published，在 published 后插入 updated
        elif re.search(r'^published:', content, re.MULTILINE):
            content = re.sub(
                r'^(published:.*)$',
                rf'\1\nupdated: {now_str}',
                content, count=1, flags=re.MULTILINE
            )

        if content != original:
            # 同时清理空的 updated（如 updated: '' ）
            content = re.sub(r"^updated:\s*['\"]?['\"]?\s*$", f'updated: {now_str}', content, flags=re.MULTILINE)
            with open(md_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ updated → {now_str}: {os.path.basename(md_file)}")
