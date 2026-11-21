// Twin Peeks — the hand-in program (Node 22, standard library only).
// It copies the static game and its screenshots from beside this file into
// the output directory and writes dossier.json, the summary the judge reads,
// with the vendored make.fun library. The grader runs this program twice in
// a fresh container with no network; it must write the same bytes both times,
// so it does no work that depends on the clock, the environment or luck.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the game exactly as it is in the repository.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });

// Copy the screenshots, when they are present.
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier, built by the vendored library from the copied files. The caps
// mirror the scorer's own: at most 4 screenshots of 256 KiB, at most 993
// files and 48 MiB under game/, and a dossier text of at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
