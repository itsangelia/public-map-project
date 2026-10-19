"""Publish only the isolated wishing-tree test; preserve every production entry."""
import html
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
site = root / 'generated' / 'site'
page = (site / 'index.html').read_text()
release = re.search(r'PUBLIC_MAP_RELEASE="([a-f0-9]+)"', page).group(1)
page = page.replace('<head>', '<head>\n    <base href="../">', 1)
config_script = f'<script src="releases/{release}/firebase-config.js"></script>'
assert config_script in page
page = page.replace(config_script, config_script + '\n<script>window.PUBLIC_MAP_CONFIG.publicBaseUrl="https://itsangelia.github.io/public-map-project/preview/wishing-tree-test.html";</script>')
rules = (root / 'database.rules.json').read_text()
setup = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>许愿树测试设置</title><style>body{max-width:760px;margin:24px auto;padding:16px;font:17px/1.7 Arial;color:#303a68;background:#fff8f1}button,a{display:inline-block;margin:8px 10px 8px 0;padding:12px;background:#303a68;color:white;border:0;border-radius:10px;font:inherit}textarea{width:100%;box-sizing:border-box;height:300px;font:12px/1.5 monospace}#result{min-height:30px}</style><h1>许愿树测试设置</h1><p>只需设置一次。规则保留原来的玩家和聊天权限，追加许愿数据权限。</p><ol><li>点击“复制完整规则”。</li><li>打开 Firebase → Realtime Database → Rules，替换编辑框里的全部内容，再点击 Publish。</li><li>打开测试大屏，用两台手机扫描其中的二维码。走近中央树并点击它，写下愿望后点击 Hang wish。</li></ol><button id="copy">复制完整规则</button><a href="https://console.firebase.google.com/project/public-map-project/database/public-map-project-default-rtdb/rules" target="_blank" rel="noopener">打开 Firebase 规则</a><a href="wishing-tree-test.html?mode=display&amp;room=wish-test">打开测试大屏和二维码</a><p id="result" role="status"></p><textarea id="rules" readonly aria-label="完整 Firebase 规则">''' + html.escape(rules) + '''</textarea><script>document.getElementById('copy').onclick=async()=>{const input=document.getElementById('rules');try{await navigator.clipboard.writeText(input.value);document.getElementById('result').textContent='已复制，去 Firebase 的 Rules 页面粘贴，然后 Publish。'}catch{input.select();document.getElementById('result').textContent='请手动复制下方已选中的规则。'}};</script></html>'''
files = {
    'preview/wishing-tree-test.html': page.encode(),
    'preview/wishing-tree-setup.html': setup.encode(),
    'preview/wishing-tree-rules.json': rules.encode(),
}
for path in (site / 'releases' / release).iterdir():
    if path.is_file():
        files[f'releases/{release}/{path.name}'] = path.read_bytes()
subprocess.run(['git', 'fetch', 'origin', 'gh-pages'], cwd=root, check=True)
fd, index = tempfile.mkstemp(prefix='wish-test-index-')
os.close(fd)
os.unlink(index)
environment = dict(os.environ, GIT_INDEX_FILE=index)
def git(*args, data=None):
    return subprocess.check_output(['git', *args], cwd=root, env=environment, input=data).decode().strip()
try:
    parent = git('rev-parse', 'FETCH_HEAD')
    production = git('rev-parse', f'{parent}:index.html')
    git('read-tree', parent)
    for name, content in files.items():
        blob = git('hash-object', '-w', '--stdin', data=content)
        git('update-index', '--add', '--cacheinfo', f'100644,{blob},{name}')
    tree = git('write-tree')
    assert git('rev-parse', f'{tree}:index.html') == production
    changed = git('diff-tree', '--no-commit-id', '--name-only', '-r', parent, tree).splitlines()
    assert all(name.startswith(('preview/', f'releases/{release}/')) for name in changed), changed
    commit = git('commit-tree', tree, '-p', parent, '-m', 'Publish isolated shared wishing-tree test without changing stable map')
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'], cwd=root, check=True)
    print(json.dumps({'release':release,'commit':commit,'production_index_unchanged':True}))
finally:
    if os.path.exists(index):
        os.unlink(index)
