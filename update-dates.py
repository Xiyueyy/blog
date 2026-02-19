"""
自动更新博客文章的 updated 字段为当前时间。
在 Webhook 部署流程中，git pull 后、pnpm build 前运行。
"""
import glob
import os
import re
from datetime import datetime, timezone, timedelta

CST = timezone(timedelta(hours=8))
POSTS_DIR = "/root/Firefly/src/content/posts"

now_str = datetime.now(CST).strftime('%Y-%m-%dT%H:%M:%S+08:00')

for md_file in glob.glob(os.path.join(POSTS_DIR, "*.md")):
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
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated: {os.path.basename(md_file)}")
