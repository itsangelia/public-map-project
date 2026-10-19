"""Publish a built site without replacing source files or deleting older releases."""
import os
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
site = root / 'generated' / 'site'
if not (site / 'index.html').is_file():
    raise SystemExit('Run npm run build before deployment.')
subprocess.run(['git', 'fetch', 'origin', 'gh-pages'], cwd=root, check=True)
fd, index = tempfile.mkstemp(prefix='public-map-deployment-')
os.close(fd)
os.unlink(index)
environment = dict(os.environ, GIT_INDEX_FILE=index)
def git(*arguments):
    return subprocess.check_output(['git', *arguments], cwd=root, env=environment).decode().strip()
try:
    parent = git('rev-parse', 'FETCH_HEAD')
    git('read-tree', parent)
    for path in sorted(site.rglob('*')):
        if path.is_file():
            blob = git('hash-object', '-w', str(path))
            name = path.relative_to(site).as_posix()
            git('update-index', '--add', '--cacheinfo', f'100644,{blob},{name}')
    tree = git('write-tree')
    commit = git('commit-tree', tree, '-p', parent, '-m', 'Publish tested versioned map release')
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'], cwd=root, check=True)
finally:
    if os.path.exists(index):
        os.unlink(index)
