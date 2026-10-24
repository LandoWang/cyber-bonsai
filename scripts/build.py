#!/usr/bin/env python3
"""Build the three offline HTML scenes using only the Python standard library."""
import argparse
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SCENES = ('longyin-garden', 'sunset-pyramids', 'snowy-jiangnan')


def render(slug):
    folder = ROOT / 'scenes' / slug
    html = (folder / 'shell.html').read_text(encoding='utf-8')
    library = (ROOT / 'vendor' / 'three-r160.min.js').read_text(encoding='utf-8')
    license_text = (ROOT / 'vendor' / 'THREE-LICENSE.txt').read_text(encoding='utf-8')
    replacements = {
        '<!-- THREE_LIBRARY -->': (
            '<!-- Third-party license: Three.js and Reflector\n'
            + license_text + '\n-->\n<script>\n' + library + '\n</script>'
        ),
        '<!-- SCENE_CODE -->': '<script>\n' + (folder / 'scene.js').read_text(encoding='utf-8') + '\n</script>',
    }
    if '<!-- REFLECTOR_CODE -->' in html:
        reflector = (ROOT / 'vendor' / 'Reflector.js').read_text(encoding='utf-8')
        reflector, replaced = re.subn(
            r"import\s*\{(.*?)\}\s*from 'three';",
            r'const {\1} = THREE;', reflector, flags=re.S,
        )
        if replaced != 1 or 'export { Reflector };' not in reflector:
            raise ValueError('Unsupported Reflector module format; update the bundling transform.')
        reflector = reflector.replace('export { Reflector };', 'window.Reflector = Reflector;')
        replacements['<!-- REFLECTOR_CODE -->'] = '<script>\n(()=>{' + reflector + '})();\n</script>'
    for placeholder, replacement in replacements.items():
        if html.count(placeholder) != 1:
            raise ValueError(f'{slug}: expected exactly one {placeholder}')
        html = html.replace(placeholder, replacement)
    return html


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scene', choices=SCENES, help='Build one scene instead of all three.')
    parser.add_argument('--check', action='store_true', help='Fail if committed HTML differs from the build.')
    args = parser.parse_args()
    stale = []
    for slug in (args.scene,) if args.scene else SCENES:
        output = ROOT / 'scenes' / slug / 'index.html'
        rendered = render(slug).encode('utf-8')
        if args.check:
            if not output.exists() or output.read_bytes() != rendered:
                stale.append(str(output.relative_to(ROOT)))
            else:
                print(f'Up to date: {slug}')
        else:
            output.write_bytes(rendered)
            print(f'Built {output.relative_to(ROOT)} ({len(rendered):,} bytes)')
    if stale:
        parser.exit(1, 'Run python3 scripts/build.py to refresh:\n' + '\n'.join(stale) + '\n')


if __name__ == '__main__':
    main()
