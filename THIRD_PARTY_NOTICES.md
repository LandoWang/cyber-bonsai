# Third-party notices

This repository includes Three.js 0.160.1 and its Reflector example, distributed under the MIT License.

- `vendor/three-r160.min.js`: official UMD build from <https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js>.
- `vendor/Reflector.js`: official source from <https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/objects/Reflector.js>.
- `vendor/THREE-LICENSE.txt`: complete upstream license from <https://cdn.jsdelivr.net/npm/three@0.160.1/LICENSE>.

Copyright © 2010-2023 three.js authors.

The build wraps Reflector for use with the embedded `THREE` global and replaces its module import/export declarations. The resulting standalone HTML files embed the complete Three.js MIT license. Scene rendering, weather, lighting, controls, interface templates and gallery are project-specific code; the upstream license notice applies to the bundled third-party code.

## Pinned source checksums (SHA-256)

```text
170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa  vendor/three-r160.min.js
012ecf98f5fc9bd262871e33d79392a25c04c2573ed68852eb3b8d2d39f9808b  vendor/Reflector.js
```
