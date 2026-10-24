#!/usr/bin/env python3
"""Check reproducible builds, offline assets, navigation and bundled JavaScript syntax."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.scripts = []
        self.ids = []
        self.script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for attr in ('src', 'href'):
            if attrs.get(attr):
                self.references.append((tag, attrs[attr]))
        if tag == 'script':
            self.script = []

    def handle_data(self, data):
        if self.script is not None:
            self.script.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.scripts.append(''.join(self.script))
            self.script = None


def main():
    node = shutil.which('node')
    if not node:
        raise SystemExit('Node.js is required for JavaScript syntax checks (building only needs Python).')
    subprocess.run([sys.executable, str(ROOT / 'scripts' / 'build.py'), '--check'], check=True)
    documents = [ROOT / 'index.html', *sorted((ROOT / 'scenes').glob('*/index.html'))]
    for path in documents:
        doc = Document()
        text = path.read_text(encoding='utf-8')
        doc.feed(text)
        if len(doc.ids) != len(set(doc.ids)):
            raise SystemExit(f'Duplicate HTML IDs in {path.relative_to(ROOT)}')
        for tag, ref in doc.references:
            parts = urlsplit(ref)
            if parts.scheme or parts.netloc:
                if tag != 'a':
                    raise SystemExit(f'External asset in {path.relative_to(ROOT)}: {ref}')
            elif parts.path:
                target = (path.parent / unquote(parts.path)).resolve()
                if not target.is_relative_to(ROOT) or not target.exists():
                    raise SystemExit(f'Broken local reference in {path.relative_to(ROOT)}: {ref}')
            elif parts.fragment and parts.fragment not in doc.ids:
                raise SystemExit(f'Broken anchor in {path.relative_to(ROOT)}: {ref}')
        for index, script in enumerate(doc.scripts, start=1):
            result = subprocess.run([node, '--check'], input=script, text=True, capture_output=True)
            if result.returncode:
                raise SystemExit(f'{path.relative_to(ROOT)}, script {index}:\n{result.stderr}')
        print(f'Checked {path.relative_to(ROOT)}: links, assets and {len(doc.scripts)} scripts')
    print('All checks passed.')


if __name__ == '__main__':
    main()
