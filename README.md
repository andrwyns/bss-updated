<div align="center">

# Bee Swarm Simulator Ripoff Edition

## [Game Webpage](https://dddatt.github.io/bss)

An HTML remake of Bee Swarm Simulator, made with WebGL2 and JS. (now with Beesmas)

</div>

## Running it locally

The game is plain static files with no build step. Serve the folder with any static file server and open `index.html`:

```bash
python3 -m http.server 8000
```

Saves are stored in the browser (IndexedDB). Use the Export button of a save to move it to another device.

### Playtest save

`playtest-save.txt` is a save with everything unlocked: a full hive of 50 gifted level 16 bees (one of every type), the best
gear with every other piece owned, stacks of every item, two of every beequip, 100 trillion honey, every zone open and all
badges earned except three that are left to claim. Open it with:

```
http://localhost:8000/index.html?save=playtest-save.txt
```

The file is read again on every visit, so reloading that link starts over from the file. To keep playing where you left
off, pick "playtest-save" from the Play menu instead. Its code can also be pasted into Import Game.

## What's in the game

All 46 bees, 18 fields, the gear, shops, bears and their quests, planters, sprouts, puffshrooms, the Ant, Robo and Stick Bug
challenges, the Wind Shrine, the Blender and Beesmas (active from late October until January 3rd).

The systems below were added on top of that, following the [Bee Swarm Simulator Wiki](https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator_Wiki):

| Feature | Where | Notes |
| --- | --- | --- |
| Badges | Medal button in the UI bar | 23 badges with 5 ranks each. Requirements, ticket rewards and boosts match the wiki. Old saves get credit for what they already did. |
| Memory Match | Pro Shop, next to the Pine Tree Forest (guild members), the top of the mountain (night only), Pepper Patch | Costs, cooldowns, chances, bonus-chance badges and prize weights match the wiki. |
| Wealth Clock | Next to Brown Bear | Hourly tickets and up to +5% honey per pollen. |
| Aphids | Any field except the Stump and Ant fields | Normal, Rage, Armored and Diamond aphids crawl out from under fallen leaves. |
| Commando Chick | Behind the vines next to Brown Bear | Needs Clippers, Scissors or a Scythe. Levels, health and milestone rewards match the wiki. |
| Cave Monsters | Inside the werewolf's cave | Two level 11 monsters guard a Gold Egg. |
| Badge Bearer's Guild | Notice board between the Pumpkin Patch and the Pine Tree Forest | A 7 quest chain through the systems above. |
| Items | Drops, quests, codes, Memory Match | Night Bell, Box-O-Frogs, Marshmallow Bee. |
| Beequips | Drops from challenges, mobs and planters | Thimble, Bandage, Sweatband, Camo Bandana. Beequips now respect their level and color requirements. |
| Battle Points | Defeating mobs | Counted per mob as in the original. Used by the Battle badge. |
| Promo codes | Bottom of the settings page | The codes the wiki lists as valid, with their real rewards. |

Visuals: bees have veined wings that flap, antennae, legs and a stinger, are lit per face, and shimmer gold when gifted.
Tokens are shaded like coins with a moving glint, particles have soft edges, bubbles and auras are drawn like soap bubbles,
mobs and gear get directional light, and the sky has clouds, a sun, stars and a moon. "Ugly Graphics" in the settings turns
the extra effects off.

The player is a classic R6 Roblox avatar with idle, walk, jump, fall and glide animations, holding its tool in the right hand
and swinging it with the arm. Gear sits on the body part it belongs to. Every tool has a detailed model, the field mobs
(ladybugs, rhino beetles, spiders, mantises, scorpions, werewolves, King Beetle, Tunnel Bear) have rounded, detailed bodies whose
legs walk, and each field is ringed with props that match it: sunflowers, mushrooms, bamboo, cacti, pumpkins, pines, palms and
more. Honey conversion, stinger hits, defeated mobs, level ups, gifted bees, hatching and a full backpack each have their own
particle effect.

Where this differs from the original on purpose: there are no stickers, so sticker prizes and the Sticker Stack badge are left out;
the Mountain Top badge boosts all bee gathering instead of only gifted bees; the Wealth Clock keeps its power between sessions
as long as it's wound within 75 minutes of playtime; and the new beequips have approximated stats, because the original's stat
tables aren't public.

## Code layout

| File | What it holds |
| --- | --- |
| `index.js` | The game: rendering, physics, bees, mobs, items, effects, shops, UI and saving. |
| `index.html` | Markup, the inventory and effect icons, and the script list. |
| `badges.js` | Badge definitions, progress and the badge page. |
| `memoryMatch.js` | The Memory Match machines, prize pools and minigame UI. |
| `guildQuests.js`, `dialogue.js` | Quest dialogue. |
| `beequips.js`, `content.js` | Definitions and icons of the beequips, items and buffs that were added later. Icons are drawn once and reused for the inventory, hotbar and token textures. |
| `mapAdditions.js` | Geometry and positions (`window.BSS_WORLD`) of structures added to the map. |
| `mapDetails.js` | Decorations around the fields. Their placements were baked by raycasting the map's collision geometry, so each one stands on flat ground clear of walls, roofs, NPCs and machines. |
| `playerModel.js` | The R6 character: its parts, where each gear slot attaches, and the animations. |
| `toolModels.js`, `mobModels.js` | Detailed tool and mob models, which replace the original meshes of the same name. |
| `codes.js` | Promo codes. |
| `mapMesh.js`, `playerGear.js`, `textures.js`, `GLSLShaders.js`, `MathHelper.js`, `thumbnail.js` | The map, gear, textures, shaders and helpers. |

`index.js` and `index.html` use CRLF line endings. Keep them that way to avoid whole-file diffs.

Calling `window.exposeCheats()` in the browser console exposes the game's internals (`player`, `items`, `objects`, ...) for debugging.
# bss-updated
# bss-updated
