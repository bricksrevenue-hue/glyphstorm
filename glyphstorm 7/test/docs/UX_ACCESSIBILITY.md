# Glyphstorm — First Flight and Smart Tray update

This is a frontend update to the existing Glyphstorm 1.10.0 game, based on GitHub commit `1291e63bc65787b0de07bd8f5699abde73b865f8`. The browser asset revision is `1.10.0-ux1`. No backend, Socket.io event, scoring formula, world dimension, multiplayer collision rule, dependency, or Render setting was changed.

The accompanying `Glyphstorm_UX_Update.zip` contains complete updated versions of the changed files, under the existing `glyphstorm 7/` directory. It is an update package: retain all other files in your working repository, including `package.json`, `package-lock.json`, `server/`, and `public/assets/`. `Glyphstorm_UX_Updated_Files.md` contains the same complete changed source files in labeled code blocks.

## 1. CSS updates and functional colors

**Files:** `public/style.css`, `public/neon.js`, `public/arena.js`, `public/asteroids.js`, `public/planet.js`, `public/ship-sprites.js`, `public/word-energy.js`, and the HUD styling in `public/app.js`.

`NEON` is the shared canvas palette. The final CSS theme block exposes matching `--safe`, `--danger`, and `--objective` variables:

| Meaning | Color | Application |
| --- | --- | --- |
| Active pilot / available / valid | `#00FF66` | Local ship tint and marker, available letter pickups, validated tray tiles, Auto-Best |
| Incoming threat / rival pulse / warning | `#FF3366` | Incoming letters and their exclamation marks, rival pulses, Earth damage and critical warnings |
| Resource / objective / signal | `#FFCC00` | Crystals, asteroid outlines and reward labels, resource and other-pilot map markers, team signals |

The active pilot and incoming threats keep their green/pink identities on the minimap. Reserved letters use a neutral ring and the word **WAIT**, rather than looking available. Useful pickups have double outlines; low-usefulness pickups have dashed outlines. Incoming letters remain pink even if their letters would help a word. A short legend is included in Mission & rules.

`pulseColor(pulse, viewer, mode)` distinguishes your pulses, friendly team pulses, and rival pulses using existing owner/team data. It does not modify that data. Pilot names, YOU/RIVAL labels, and team names maintain identification without depending solely on color.

`ShipSprites.load()` caches a green-tinted copy of each selected hull once. `ShipSprites.draw(..., active)` uses that copy only for the local ship. The original eight PNGs and ship-selection thumbnails are unchanged. The cyan Earth shield and violet invulnerability effect remain distinct, as in the existing game.

## 2. Init / onboarding state logic

**Files:** `public/app.js`, `public/practice.js`, `public/index.html`, `public/style.css`.

The existing isolated `PracticeRun` / `PracticeLesson` system now drives the three-phase lesson. `isTutorialMode` is initialized using `needsFirstFlight()` and `glyphstorm.first-flight.v2` in localStorage. A first visit, or no saved pilot name, enables the lesson. Storage access failures are caught by the existing storage wrapper.

| Phase | Controls and progression |
| --- | --- |
| 1 · Fly | Only movement is enabled. Move within 100 practice pixels of the highlighted crystal. |
| 2 · Pulse & collect | Movement and aiming/pulsing unlock. The first hit releases exactly C, A, T. Pulsing then locks; fly into those three letters. |
| 3 · Spell & repair | Movement and pulsing lock. The practice tray arranges CAT. Enter or Submit awards practice points, repairs the practice Earth from 98 to 100 HP, and grows its shield from 5 to 6.5. |

**Necessary adjustment:** collection happens within Phase 2, before the movement lock. Otherwise a new player could reach Phase 3 with letters still out of reach. Pickup order is unrestricted; this one lesson arranges CAT automatically and explains that Auto-Best does this in a live round.

The centered native dialog has three numbered SVG instruction frames. Only the current phase animates. Both the browser's reduced-motion preference and the game's Reduce motion option stop the animation. Keyboard focus, pointer cancellation, blur/visibility changes, and disabled mobile sticks are handled.

Completion immediately sets `isTutorialMode` to false and persists completion, shows the repair for 1.6 seconds, and continues. When the lesson was opened during Create/Join, the saved continuation resumes that operation. If it opened before a name was entered, it returns to the normal home/join form; it does not invent a name or create a room. Replay is available from home and lobby. Skip continues; closing the dialog dismisses the current attempt. A resumed live room is restored before offering any tutorial. If a lobby round starts during a replay, practice closes and live controls resume.

This tutorial has **no Socket.io calls** and never changes live score, inventory, Earth health, rooms, or other players. Its old correction exercise is replaced by the requested three phases; live-game discard, shuffle, drag, and tap-to-swap remain available.

## 3. HUD rendering and Auto-Best

**Files:** new `public/smart-tray.js`, plus `public/app.js`, `public/index.html`, and `public/style.css`.

`localWordOffer()` checks a small bundled subset of the actual dictionary. It counts repeated letters, excludes already-used words, and handles star tiles without mutating the tray. `SmartTrayPreview.read()` caches by round, tray contents, used-word history, and server advice. It does not run a dictionary scan each animation frame.

The existing private `wordGuide.longest` takes precedence when it matches the current tray. This preserves the full dictionary, not just the small preview vocabulary. While advice is stale, a local preview may appear with “Checking against the full dictionary…”; Auto-Best stays disabled until the matching server advice arrives.

`renderSmartTray()` updates `#ghostWord` above the letter tiles, with a dashed, translucent preview style and a readable text hint. The preview is not a submitted or silently accepted word. Text changes are checked before updating the live region to avoid repeated announcements on every snapshot.

`autoBest()` is shared by the prominent `#autoBestButton` and the existing `#backspaceButton` (“Shorter word / Auto-Best”). It uses `arrangeTiles()` to send the existing authenticated `arrange` action, places the word's owned tile IDs first, and selects that range. Leftovers remain available. The arrangement waits for the server acknowledgement; no client score or inventory is invented. Round/player guards prevent a late reply from selecting an old word after a transition.

The user still presses Submit/Enter to score. Auto-Best finds the **longest** available word; the existing Best word hint still shows the **highest-scoring** word, which can be different.

The preview and Auto-Best share a compact bar directly above the tiles. It remains sticky within the scrollable tray. Mobile keeps the existing 5-by-2 tray, dual sticks, compact Details panel, and three original tray actions. Existing review, range, swap, shuffle, and discard controls remain in place.

## 4. Vector drawing loops and proximity flares

**Files:** new `public/threat-cues.js`, plus `public/arena.js`, `public/app.js`, `public/index.html`, and `public/style.css`.

`Arena.draw()` calls `drawThreatVectors()` during rendering. For off-screen incoming letters it calculates the shortest wrapped direction to Earth's shield, clips that segment to the viewport, and draws a faint dashed pink line with an inward arrow. It stops at the shield boundary. Directions are grouped into sectors with at most six vectors to limit clutter and drawing cost.

**Camera adjustment:** Earth remains in its existing world position. The vector points toward the actual Earth/shield image on the wrapped map, rather than falsely targeting the center of a camera following a distant ship. Paths entirely outside the viewport are omitted; the existing Earth direction marker remains available.

`defenseAlert()` activates when Earth is below 30% HP, or when an incoming letter is within 90 world pixels of the shield's collision boundary, including the letter radius. It uses torus distance, ignores ordinary safe pickups, and is disabled outside live Planetary Defense rounds.

The full-screen `#earthThreatVignette` is a pointer-transparent edge effect. Its slow 1.8-second pulse leaves the center clear; Reduce motion makes it steady. A textual warning in the arena communicates the reason. Existing damage shake, damage numbers, Earth wave countdown, and shield effects remain active.

## Verification

- **122 automated tests passed**, including existing two-player and eight-player Socket.io regression tests, collision/physics, ship rotation, scoring, defense, power-ups, inventory privacy, and reconnection.
- New tests cover First Flight locks, three-letter spawning, collection in any order, one-time practice repair, first-visit persistence rules, dictionary subset validity, repeated letters/stars, preview cache invalidation, team-relative colors, torus proximity, clipped vectors, and bounded drawing.
- Existing rendering assertions were updated only for the requested new colors; the tutorial test was updated for its intentional three-phase replacement.
- All browser JavaScript files passed syntax checks; all relative imports resolve. All 188 previous HTML IDs remain, with 196 total IDs and 143 fixed JavaScript ID references resolved.
- Backend source, rules/scoring, dependency manifests, Render configuration, and all ship/asteroid PNG bytes were checked against the baseline and are unchanged.
- Actual browser layout, screen-reader behavior, and physical phone touch playtesting remain pending. These automated checks do not constitute a full accessibility conformance audit.

### Quick playtest after deployment

1. Open the public URL in a private browser window. First Flight should appear. Holding pulse in Phase 1 must do nothing. Fly to the crystal, pulse it, collect C/A/T, and submit. Watch Earth repair and the dialog close.
2. Join normally with a pilot name. On the next visit with that name and completed tutorial, the lesson should not reopen. Test Replay and Skip. Check that an existing room resume is not interrupted.
3. Create a room on a computer and join from a phone. With scrambled letters, confirm the preview updates and Auto-Best arranges a selectable word without scoring. Submit it and verify synchronized score/Earth changes. Any unused tiles should remain.
4. Confirm invalid/no-word trays disable Auto-Best as appropriate and still support manual arrangement/discard. Test a star tile and an already-used word.
5. Let pink waves approach Earth. Off-screen approach lines should point toward its shield. Confirm a warning near the shield and at 29 HP, then its removal after threats clear and health recovers to at least 30.
6. Turn on Reduce motion. Confirm instruction animations and warning pulses stop. Check portrait and landscape phone layouts, access to Auto-Best/Submit, two sticks, and review-shield timer.

## Install on your existing GitHub / Render deployment

1. Unzip `Glyphstorm_UX_Update.zip`. It contains one folder named exactly `glyphstorm 7`.
2. In the Glyphstorm GitHub repository, select `main` and stay at the repository root.
3. Use Add file → Upload files and drag that **whole folder** into the upload area. The updated paths must include `glyphstorm 7/public/app.js`, `glyphstorm 7/public/smart-tray.js`, and `glyphstorm 7/public/threat-cues.js`. Do not nest an extra `glyphstorm 7` folder. Keep all existing files not included in the update.
4. Commit the update, then use your existing Render service's Manual Deploy → Deploy latest commit (or wait for its configured automatic deployment).
5. Keep Root Directory `glyphstorm 7`, Build Command `npm ci --omit=dev`, and Start Command `npm start`.
6. After Live, refresh the existing public URL. The game does not need a new Render service or a new URL.

These files have been prepared and tested locally. They have **not** been pushed to GitHub or deployed to Render.

## Short changelog

- Replaced the old seven-step practice exercise with a three-phase, action-locked First Flight lesson and animated SVG instruction frames.
- Added consistent green/pink/gold gameplay accents, visible labels, reserved-pickup WAIT markers, and a cached local-ship tint.
- Added a cached word preview and prominent Auto-Best using the existing server arrangement action.
- Added bounded off-screen threat vectors, a proximity/low-integrity edge warning, and reduced-motion alternatives.
- Preserved multiplayer simulation, scoring, room flow, settings, ships, weapons, collisions, defenses, timers, and existing tray controls.
