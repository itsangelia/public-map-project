"""Publish the isolated fishing map preview; preserve every production entry."""
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
for asset in ('fishing-lotus-cutout.png', 'fishing-toothy-cutout.png', 'fishing-bigmouth-cutout.png', 'fishing-cat-cutout.png', 'fishing-escaped-cutout.png'):
    if not (site / 'releases' / release / asset).is_file():
        raise SystemExit(f'Preview not published: missing original artwork {asset}')
page = page.replace('<head>', '<head>\n    <base href="../">', 1)
network_script = f'<script src="releases/{release}/multiplayer.js"></script>'
assert network_script in page
# Override the production entry immediately before the QR module starts.
preview_name = f'fishing-map-{release}.html'
preview_url = f'https://itsangelia.github.io/public-map-project/preview/{preview_name}'
page = page.replace(network_script, '<script>window.PUBLIC_MAP_CONFIG.publicBaseUrl=' + json.dumps(preview_url) + ';</script>\n' + network_script)
files = {
    'preview/fishing-map.html': page.encode(),
    f'preview/{preview_name}': page.encode(),
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
    commit = git('commit-tree', tree, '-p', parent, '-m', 'Preview fishing map placement and approved proximity cue')
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'], cwd=root, check=True)
    print(json.dumps({'release':release,'commit':commit,'production_index_unchanged':True}))
finally:
    if os.path.exists(index):
        os.unlink(index)
