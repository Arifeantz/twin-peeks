# Twin Peeks — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Arifeantz/twin-peeks/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Arifeantz/twin-peeks/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Peeks is an original spot-the-difference game that runs entirely offline in a desktop browser. Four scenes are drawn entirely in code on a canvas — The Baker's Morning, Night Train Home, The Old Library and Garden Picnic — each hiding 7 differences (28 in total). Because each pair of panels is drawn by the same function with a difference-key set, the two pictures are near-identical by construction and every difference sits exactly where it is declared.

Click or tap either picture to call out a difference: a golden ring, a tick and a chime mark a find, while a miss costs time and points. There are streak bonuses, a hint system (a pulsing blue ring, at a points cost), three difficulties (Classic, Rush and Relaxed), a level select with progressive unlock, star ratings on the level-complete screen, and a campaign-complete screen. Every sound is synthesised live with WebAudio — the game makes zero network requests and loads zero external files.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 in a desktop browser. (`main.ts` is the competition hand-in program: it packages the game and its screenshots into the output directory deterministically.)

---

<sub>Entered on [make.fun](https://make.fun/?ref=x2bp757s&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
