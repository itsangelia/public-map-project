"""Publish only the self-contained drink-maker UI preview, preserving production."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
page = (root / 'drink-maker-preview.html').read_bytes()
version = hashlib.sha256(page).hexdigest()[:16]
files = {
    'preview/drink-maker.html': page,
    f'preview/drink-maker-{version}.html': page,
}
subprocess.run(['git', 'fetch', 'origin', 'gh-pages'], cwd=root, check=True)
fd, index = tempfile.mkstemp(prefix='drink-maker-preview-')
os.close(fd)
os.unlink(index)
environment = dict(os.environ, GIT_INDEX_FILE=index)
def git(*arguments, data=None):
    return subprocess.check_output(['git', *arguments], cwd=root, env=environment, input=data).decode().strip()
try:
    parent = git('rev-parse', 'FETCH_HEAD')
    git('read-tree', parent)
    for name, content in files.items():
        blob = git('hash-object', '-w', '--stdin', data=content)
        git('update-index', '--add', '--cacheinfo', f'100644,{blob},{name}')
    tree = git('write-tree')
    assert git('rev-parse', f'{tree}:index.html') == git('rev-parse', f'{parent}:index.html')
    changed = git('diff-tree', '--no-commit-id', '--name-only', '-r', parent, tree).splitlines()
    assert set(changed) <= set(files), changed
    commit = git('commit-tree', tree, '-p', parent, '-m', 'Preview portrait drink-making interface without changing production map')
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'], cwd=root, check=True)
    print(json.dumps({'version':version, 'commit':commit, 'entry':f'preview/drink-maker-{version}.html', 'production_unchanged':True}))
finally:
    if os.path.exists(index):
        os.unlink(index)
