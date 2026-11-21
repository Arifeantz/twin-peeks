# Twin Peeks — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Arifeantz/twin-peeks/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Arifeantz/twin-peeks/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Peeks is an original spot-the-difference game that runs entirely offline in a desktop browser. Four scenes are drawn entirely in code on a canvas — The Baker's Morning, Night Train Home, The Old Library and Garden Picnic — each hiding 7 differences (28 in total). Because each pair of panels is drawn by the same function with a difference-key set, the two pictures are near-identical by construction and every difference sits exactly where it is declared.

Click or tap either picture to call out a difference: a golden ring, a tick and a chime mark a find, while a miss costs time and points. There are streak bonuses, a hint system (a pulsing blue ring, at a points cost), three difficulties (Classic, Rush and Relaxed), a level select with progressive unlock, star ratings on the level-complete screen, and a campaign-complete screen. Every sound is synthesised live with WebAudio — the game makes zero network requests and loads zero external files.

## Scenes

The four scenes are played in order, and each hides a different kind of trickery:

1. **The Baker's Morning** — a warm kitchen at sunrise: the morning sun, the clock hands, the cat's tail, a bread loaf, the jam jar's colour, the hanging lamp and the teapot steam. It is the busiest panel in the game, so the changes hide in the clutter: a colour swap on the jam jar, the thin wisp of steam over the teapot, and a cat whose tail has quietly moved.
2. **Night Train Home** — the last train waiting at a moonlit platform: the moon's shape, a train window gone dark, a missing star, the platform number, the red suitcase, the lamp post and the moon reflected in a puddle. A dark scene is its own camouflage — one window going dark blends into the carriage, one missing star hides in a whole starfield, and almost nobody checks the puddle.
3. **The Old Library** — dust, lamplight and a sleeping cat: a book's colour, the globe, the sleeping cat, the clock hands, a leaf on the plant, the lamp shade's colour and the framed picture. The shelves hold rows of near-identical book spines, so a single spine changing colour is easy to scan straight past; the missing leaf and the shade's new colour are just as quiet.
4. **Garden Picnic** — sunshine, a kite and a basket of lunch: the kite's colour, a butterfly, the sun's rays, the basket lid, a flower, the lemonade jug and the bird on the branch. The small things hide in busy grass — one flower among many, a butterfly that may or may not be there — and the sun dares you to count its rays.

## Scoring & difficulties

- **Finding a difference scores 100 points.** Quick finds chain into a streak: each find within 6 seconds of the previous one raises the streak, and from the second quick find onward you earn a bonus of 25 × (streak − 1) points on top.
- **A miss costs you on Classic and Rush:** −5 seconds on the clock and −25 points (your score never drops below zero). On Relaxed a miss is free — you just look closer and try again.
- **A hint costs 50 points.** It draws a pulsing blue ring around one difference you have not found yet, for 4 seconds. If you go 20 seconds without a find, the Hint button starts to pulse gently to remind you it is there.
- **Finishing a level pays a time bonus** of 5 points for every second left on the clock.
- **Stars** rate each finished level: 3 stars for a hint-free finish (dropping to 2 if you scrape home with under 40% of the clock left), 2 stars if you used one hint, 1 star if you used two or more.

The three difficulties change the clock, the hint supply, the price of a miss and even how forgiving the click targets are:

| Difficulty | Clock | Hints | Miss penalty | Click targets |
| --- | --- | --- | --- | --- |
| Relaxed | none | 3 | none | 15% larger |
| Classic | 2:00 | 3 | −5s, −25 points | standard |
| Rush | 1:15 | 2 | −5s, −25 points | 10% smaller |

Levels unlock one by one as you finish them, and your best campaign total is kept in the browser.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 in a desktop browser. (`main.ts` is the competition hand-in program: it packages the game and its screenshots into the output directory deterministically.)

---

<sub>Entered on [make.fun](https://make.fun/?ref=x2bp757s&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
