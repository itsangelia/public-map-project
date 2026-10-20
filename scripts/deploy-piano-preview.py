"""Publish the isolated shared piano preview; preserve every production entry."""
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
# Never publish a result screen referencing artwork that was not supplied/built.
for asset in ('shared-piano.png', 'shared-piano.js', 'piano-audio.js', 'piano-spot.js'):
    if not (site / 'releases' / release / asset).is_file():
        raise SystemExit(f'Preview not published: missing original artwork {asset}')
page = page.replace('<head>', '<head>\n    <base href="../">', 1)
network_script = f'<script src="releases/{release}/multiplayer.js"></script>'
assert network_script in page
# Override the production entry immediately before the QR module starts.
preview_name = f'piano-map-{release}.html'
preview_url = f'https://itsangelia.github.io/public-map-project/preview/{preview_name}'
page = page.replace(network_script, '<script>window.PUBLIC_MAP_CONFIG.publicBaseUrl=' + json.dumps(preview_url) + ';</script>\n' + network_script)
files = {
    'preview/piano-map.html': page.encode(),
    f'preview/{preview_name}': page.encode(),
}
rules = (root / 'database.rules.json').read_text()
files[f'preview/piano-rules-{release}.json'] = rules.encode()
setup = '<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Piano setup</title><style>body{font:17px system-ui;max-width:800px;margin:24px auto;padding:16px;background:#fff8e9;color:#594834}textarea{box-sizing:border-box;width:100%;height:55vh}button,a{font-size:18px;margin:12px 0;padding:12px}button{display:block}</style><h1>共享钢琴：数据库规则</h1><p>先备份 Firebase 控制台当前规则。复制下方完整内容，粘贴到 Realtime Database → Rules，点击 Publish。它保留原有权限，仅新增 pianoSeat 和 pianoNotes。</p><button onclick="navigator.clipboard.writeText(document.querySelector(\'textarea\').value).then(()=>this.textContent=\'已复制\')">复制完整规则</button><textarea readonly aria-label="完整数据库规则">' + html.escape(rules) + '</textarea><p>发布后重新打开测试版，用两台手机扫码。无需修改正式地图入口。</p></html>'
files[f'preview/piano-setup-{release}.html'] = setup.encode()

for path in (site / 'releases' / release).iterdir():
    if path.is_file():
        files[f'releases/{release}/{path.name}'] = path.read_bytes()
subprocess.run(['git', 'fetch', 'origin', 'gh-pages'], cwd=root, check=True)
fd, index = tempfile.mkstemp(prefix='piano-preview-index-')
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
    commit = git('commit-tree', tree, '-p', parent, '-m', 'Preview shared piano on the east stage; preserve production')
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'], cwd=root, check=True)
    print(json.dumps({'release':release,'commit':commit,'production_index_unchanged':True}))
finally:
    if os.path.exists(index):
        os.unlink(index)
