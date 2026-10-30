# Glyphstorm 1.10 — Flexible words, clearer recovery

A real-time word arena for 2–8 friends. Open crystals and realistic asteroids with light pulses, collect letters by touch, arrange their tiles, and score words while protecting a shared Earth.

## New in 1.10

- **Flexible tray:** drag to reorder on desktop or tap two tiles to swap on any device. Select range uses start/end tiles; otherwise the entire tray is the word. Unused tiles on either side remain. Delete any chosen tile with Backspace/Delete or its ×; long-press exposes × on touch. With no selected tile, Backspace removes the last tile. Existing discard controls remain. Shuffle / R is free, with a server-enforced three-second cooldown.
- **Actionable spelling help:** live dictionary feedback and disabled invalid submission; one inline error; Shorter word arranges and selects the longest available word; Use all clears the range; Best word reports the highest normal score including a star. Reused words are excluded. A full tray with available words names a suggestion; a dead tray shows the discard/Shuffle hint and low-utility tile markers. Smart discard preserves the most possible words, then favors a useful vowel replacement.
- **Recovery:** after twenty seconds without a pickup or valid submission, offer one vowel, at most once per forty-five seconds. A full tray reserves the vowel until a discard or submission makes space, retaining the ten-slot cap. Automatic delivery waits through review, reset, spawn protection or disconnection. A zero-score pilot gets a short-word nudge after forty-five seconds.
- **Letter supply:** weighted Scrabble-like frequencies target 35–40% vowels across the field. Nearby generation responds to tray vowels. A bounded local supply adds up to two released letters every two seconds toward four within 600px of each pilot. Only these extra local letters disappear when left far behind; distant base density is unchanged. A gentle 72px magnet pulls the nearest useful eligible ordinary tile at 42px/second; incoming threats keep their existing paths. Double bright, normal and dim dashed outlines distinguish useful/neutral/no-immediate-word letters without depending on color alone.
- **Achievable rewards:** bounties prefer common three-to-five-letter words available from the field plus a pilot's own tray; rival inventories are not pooled. The bounty stays +20. Asteroids usually release their normal letters; some add a vowel, a single-use ★ tile doubling that word's base score, or a personal word-shield recharge. Labels show the reward. Multiple stars do not stack or double the bounty.
- **Clearer flight deck:** score and recent human word feed sit in the upper-left corner. Review is a compact non-modal panel inside the board above its tiles, with an explicit shield timer; the board scrolls on compact screens. A visible meter shows progress toward five words. Earth breaches add a brief shake, red ring flash, actual damage number and Integrity pulse; incoming-wave time is drawn near Earth or its offscreen indicator. Reduced motion keeps static warnings.
- **Onboarding:** the lobby brief is four essentials: fly, collect, arrange, submit. Dismissible live tips advance on those actions and remember completion/dismissal in localStorage. Existing solo practice remains available.

All 114 automated tests pass, including two-player tray actions, retry-safe assists and the existing eight-client synchronization, reconnect, ship and room checks. Static markup/layout checks pass; real-browser layout, drag and physical-phone touch checks remain pending. See docs/VERIFICATION.md for the eight requested cases. This is an update to the existing Node/Express/Socket.io game; existing modes, settings, ships, controls, timing and base scoring remain in place. No public deployment is included.

### Small compatibility decisions

Removing a tile cannot create an anagram when any subset is selectable. Smart discard therefore maximizes retained words, then space for a vowel; the UI explains this. Shuffle changes order but cannot create missing letters. A full-board recovery vowel is reserved rather than silently replacing a tile or creating an eleventh slot. Dim letters mean no immediate new spelling opportunity, not that they invalidate a selectable word. Earth damage feedback uses the existing incoming pink-letter breach path; physical asteroid/meteor rocks retain their original behavior. The game has human opponents, so the new feed uses actual scoring events and no bot system was added.

## Retained from 1.9

- **Word energy:** every valid word sends its letters toward Earth's shield along the wrapped arena's shortest route. A cyan ripple marks arrival. The score banner reports the actual repair and shield growth after caps: at 99 HP it says +1 HP, and at maximum it says Earth full / Shield at max. This is visual feedback; the server commits the reward once at submission. Reduced motion replaces travel with a stationary shield highlight. Classic rounds retain scoring without an Earth effect.
- **Quick signals:** tap Signal → choose a letter → Request letter, or tap Defend Earth. Teams see only their own team's calls. Free-for-all pilots can send shared Earth-defense calls; letter requests remain team-only. Signals mark the sender's location or Earth with a gold minimap square and arena marker, last six seconds, and share a server-enforced five-second cooldown. They neither transfer letters nor award points. Spectators cannot send or see team signals.
- **Compact flight deck:** screens up to 900px wide or 600px tall keep Earth health, boost, your score, the minimap, numbered letters and Submit in the main view. Details opens the existing live bounty, meteor, power-up and standings panels plus sound/motion preferences. Phone landscape layouts at least 600px wide and at most 500px high place the collection board beside the arena. On unusually small screens, the board can scroll rather than cover the flight controls.
- **Live overlays:** Details and Signals stop held controls while open; the round continues and ships remain vulnerable. Close the overlay to resume flying. Resizing or leaving a round restores the same live panels and preference buttons to their desktop positions.

The 1.9 signal and reward checks remain in the current regression suite.

## Introduced in 1.8 (historical; tray ordering superseded by 1.10)

- **First flight:** a skippable, isolated solo lesson before a new pilot's first join, also available from the home screen. Pulse a C crystal, collect C then a deliberately unwanted X, discard X, collect A and T, and explicitly submit CAT. Practice never joins a room, adds live points or changes the shared world. Completion is remembered on this browser; skipping is remembered for this page session.
- **Suggested targets:** the server chooses a common, unused word compatible with your current letter order and available released letters/crystals. The board names the target and next letter; up to four nearby matching sources get cyan NEXT markers labeled PULSE or COLLECT. Suggestions are optional goals. Pickup behavior is unchanged. A chosen target stays stable; if another player takes its letters, the board tells you to find more by opening rocks.
- **Smart submission:** outside Review, Submit and Enter use the longest valid, unused leading word shown on the button. CATX offers “Submit CAT · keep X”; CATS offers CATS when valid and unused. It never rearranges, skips or automatically submits letters. Review allows an explicit shorter selection; choosing an invalid selection never silently submits a different word.
- **Feedback before mistakes:** each pilot receives dictionary/word-history feedback for their own tray. Unrecognized, reused or short words are explained before submission. Normal controls disable invalid submissions; the server still independently validates every attempt, deadlines and retry IDs. Previewing letters never changes scores, repairs, shield timing or combos.
- **Quick correction:** Discard last removes the latest pickup with one action. Review → Choose a letter to discard retains individual tile removal. Both use the existing one-second server cooldown and preserve the remaining order.
- **Pickup explanations:** the board explains full capacity, review, temporary protection and another pilot/team's pickup priority. Protected priority expires normally; no extra pickup rights are granted.

Browser/phone visual, touch and first-time-player playtests remain outstanding. See docs/VERIFICATION.md.

## Collection board introduced in 1.7.1

The always-visible **LETTER COLLECTION** board now shows ten large numbered slots, your collected word, a cyan NEXT slot and the current count. A brief highlight identifies new pickups; reduced motion suppresses it. The board gives explicit minimum-length and full-capacity instructions. In review, the preview separates the word being submitted from trailing letters kept for later. The Submit, Review / shorter word and Discard controls stay beside or below the tiles. Phones use two rows of five tiles; wider screens use one row of ten. Slot order always remains 01–10.

Screen readers receive a short collection announcement; interactive review tiles retain keyboard focus. This is a presentation update: ordered pickups, capacity, private trays, scoring and multiplayer authority retain their existing rules. Browser and device layout checks remain outstanding.

## Power-ups introduced in 1.7

- Every fifth consecutive valid word triggers a random eight-second power-up. Teammates share a combo; free-for-all pilots build separate combos. Invalid dictionary words or previously scored words reset that combo. Opening review, discarding and ship resets do not reset it.
- **Violet Guard / INVULNERABILITY:** incoming letters disappear on contact without damaging Earth. The shield becomes thicker and glows violet. Individual ships retain their existing protection rules.
- **EMP Blast / EMP_BLAST:** all incoming letters stop and become safe pickups for everyone. This also neutralizes new waves during the eight seconds. Letters keep their IDs and positions; EMP gives no points.
- **Slow Motion / SLOW_MOTION:** incoming letters travel at 40% of normal speed. Ships, pulses, rocks, scoring and the match clock keep normal timing. Original letter speed resumes on expiry without compounded scaling.
- Earth is shared, so power-ups benefit everyone, including opponents. A new milestone replaces the current effect and starts a fresh eight seconds. Effects do not stack. Classic defense-off rounds have no Earth power-ups.
- The server owns activation, combo counts and expiry independently for each room. The requested `currentPowerUp` and `powerUpTimer` exports mirror this state in the browser's main loop. The timer starts at 480 equivalent 60 Hz frames and derives from the server deadline: the duration remains eight real seconds at 30, 60 or 120 FPS.
- A visible arcade panel shows the combo, active power-up and countdown for pilots and spectators. Mission briefing and help explain how to earn and use them.
- Deep-purple space (`#0a0813`), a moving neon perspective grid, glowing letters and hot-pink / laser-lime / cyan particle bursts give the arena a synthwave palette. Incoming threats are pink; available ordinary pickups are lime. Reduced motion freezes the grid and disables burst particles and letter glow.

90 automated tests pass, including eight real Socket.io clients receiving matching power-ups, retry-safe milestones and reconnects preserving expiry. Browser/phone visual playtesting remains necessary. No public deployment was made.

## Mission briefing

Every pilot sees a lobby briefing with three numbered steps: stop pink incoming letters, collect and arrange tiles, and submit valid words to repair Earth. The shared survival goal, individual/team winner and zero-health failure condition are explicit.

A persistent mission strip stays above the arena for pilots and spectators, including late arrivals. Its Rules button reopens the current briefing. Launch countdowns repeat the objective; word review explains the repair reward; results label Earth saved or mission failed. All briefing text adapts to the host's team, duration and defense settings. Classic mode explicitly says defense is off. Personal word-review protection is distinguished from Earth's shield.

## Planetary defense and arcade features

- Planetary defense is enabled by default and can be switched off by the host in the lobby. All players share one Earth, including opposing teams.
- Earth is fixed at the arena core (1200, 800). The ship-following camera stays intact; a cyan direction marker and minimap ring help pilots find Earth.
- Earth starts at 100 HP. Every incoming pink letter that touches the shield is removed and costs 5 HP unless Violet Guard is active. At zero, the existing results sequence ends the round for everybody, preserves scores and declares no winner. Survive until the timer ends to decide winners by the original word scores.
- Each valid, previously unused word adds word.length × 0.5 to shield thickness, capped at 25, and repairs 2 HP up to 100. Thickness starts at 5. An unprotected breach costs 5 HP; thickness is visual progression, not extra damage absorption.
- Incoming letters arrive after 12 seconds, then every 8 seconds: one per wave with 2 players, two with 3–5, three with 6–8. Speed rises from 38 to a maximum 75 world units/second. No missed-wave catch-up avalanche; at most 16 incoming letters.
- Collect incoming letters in order, or intercept one with an existing light pulse to stop its descent. A stopped letter becomes an ordinary pickup with the usual two-second owner/team priority. Pulses and interceptions grant no points.
- Ordinary crystal, asteroid and ship-drop letters retain their existing stationary behavior. Ships and pulses pass over Earth. Its appearance adds no ship collision or damage rule.
- Cyan ten-particle shield ripples last 300 ms; weapon/word bursts alternate hot pink, laser lime and neon cyan. A brief red impact tint honors reduced motion. All particles share the existing cap of 320.
- Realistic cratered asteroid artwork, rechargeable boost, meteor showers and word bounties from the in-progress 1.5 upgrade are included. Shift/tap BOOST gives a 550 ms burst with a six-second recharge. Showers add four faster, larger rocks for 14 seconds every minute starting at 30 seconds; four hits release six letters. Bounties start at 15 seconds, recur every 45 seconds and award the first valid submission within 30 seconds a 20-point word bonus.

90 automated tests pass, including eight real Socket.io clients, isolated rooms, authoritative damage, retry-safe repairs, power-ups and synchronized early results. Browser/phone visual playtesting remains necessary; the preview browser blocked access during this build. No public deployment was made.

## Complete source in one block

The accompanying Glyphstorm_Complete_Source.md contains all first-party HTML, CSS, JavaScript/Node modules, tests and pinned package manifests in one copy-pasteable Bash block. Run it only from this extracted glyphstorm directory: it preserves the PNG assets and dependency notices supplied in this ZIP. The separate server/client files are essential to multiplayer authority; opening index.html directly is not a game server.

## Arcade feedback introduced in 1.3

- Engine trails, pulse streaks, crystal sparkles and floating letter pickups make actions easier to notice.
- Scoring a word produces a larger celebration; six-letter and eight-letter words get special recognition using the existing score.
- A live score target shows the points needed to take the lead, shared leads, or the current winning margin. Team mode uses combined team scores.
- Lead-change banners and a warmer final-30-second border make close rounds more visible. The final ten seconds have optional countdown sounds.
- Enable Sound in the top bar for pickup notes, scoring melodies and countdown cues. Reduced motion removes particle and trail animations while retaining readable feedback.

This update changes presentation, not gameplay or scoring. Spelling-order collection, the eight ships and full-circle controls remain. The automated checks pass; a browser and phone playtest is still needed to judge readability, performance and how the changes feel.

## Full-circle controls introduced in 1.2.1

Hold Q to rotate counterclockwise or E to rotate clockwise. A full turn takes two seconds at normal frame rates. Release the key to keep that heading. Move the mouse to resume cursor aiming in any direction; the heading now tracks the cursor continuously as the ship/camera moves. The right touch stick aims around the full circle and keeps the last angle when centered or released. WASD/arrows still control movement independently.

## Fleet introduced in 1.2

Eight playable ship designs are now included: Dart, Manta, Comet, Orbit, Kite, Scout, Prism and Aurora. Choose your ship in the lobby, then ready up. The crew roster previews everyone’s choice and the same hull appears on every screen during play. Your ship survives reconnects, resets and rematches. Changing it in the lobby clears your ready status.

All designs have identical movement, stability and letter collection reach. Multiple pilots may choose the same ship. A ring, name and minimap marker identify the pilot in free-for-all or the team in team mode, independently of the hull paint. Spectators choose after claiming a pilot seat in a lobby. Ship changes are locked during a round.

This builds on Version 1.1’s spelling-order collection. Physical pickups and word submissions follow the same existing rules. See docs/CHANGELOG.md.

## Updating an existing local copy

1. Stop the running server with Control+C and extract this ZIP into a fresh folder.
2. In the new glyphstorm folder, run npm ci and npm start.
3. Open http://localhost:3000 and reload all player tabs. The startup banner and /health identify version 1.10.0; the home screen shows GLYPHSTORM / 1.10.0.
4. Create a fresh room, invite another pilot, select ships under Choose your ship, then ready up and launch.


## Run locally

Requires Node.js 22 or newer.

~~~sh
npm ci
npm start
~~~

Open http://localhost:3000. Open a second browser tab to join the same room with another name. The private session token is stored per tab, so separate tabs can represent separate players. For a phone on your local network, use the computer's LAN address and port 3000, subject to your firewall. The production deployment uses HTTPS.

Development with automatic server restarts: npm run dev. Restarts end in-memory rooms.

## Verify

~~~sh
npm run check
npm test
~~~

The tests cover gameplay invariants and real Socket.io connections from eight independent clients. They do not substitute for phone, laptop, visual, or usability testing. Read docs/VERIFICATION.md for completed checks and the remaining release checklist.

## Rules

- 2–8 active players; free-for-all or two equal teams.
- Host-selectable 3/5/7-minute rounds, with 5 minutes the default.
- Ten-letter inventory. Physical contact appends each pickup; rearrange the tray afterward by drag or tap-to-swap.
- Submit the full tray or explicitly select one contiguous range. Shorter word arranges and selects the longest valid unused word; unused tiles on both sides remain.
- Discard any unwanted tile, at most once per second. Shuffle has a three-second cooldown and does not change the inventory.
- English words of 3–10 letters. A word scores once per player per round.
- Base score = the tiles' values plus 2 × (length − 3)². A used star doubles that base once; multiple stars do not stack. An active, unclaimed matching word bounty adds 20 points once globally, after the multiplier.
- Crystal letters have 2 seconds of pickup priority for their opener and teammates.
- Asteroids take three pulse hits and release four letters, with at least one vowel. Labels identify occasional extra vowel, double-score tile or shield recharge rewards. The final pulse's pilot and teammates get the same 2-second priority. Asteroids award no points directly.
- Word review stops the ship and gives up to 8 seconds of protection. Submitting, canceling, or reaching the time limit ends the shield and starts a 15-second cooldown.
- Optional opponent disruption; no friendly fire. Three unprotected pulse contacts cause a 3-second reset and up to 3 dropped letters. Earned points remain.
- Late arrivals spectate. Players return to the same lobby between rounds.
- Shared wins for tied final scores when Earth survives, or when defense is disabled. Zero Earth health ends a defense round with no winner.

Desktop: WASD/arrows to move, Q/E to rotate continuously through 360 degrees, mouse to aim freely, hold left mouse button to pulse, Shift to boost, Enter to submit the full tray or selected range, Space to open shielded word review, Escape to resume flying. Drag tiles to reorder, or tap two to swap. Select range chooses start/end tiles; Use all clears the range. Shorter word arranges the longest possible unused word. Backspace/Delete removes the selected or last tile; R shuffles. On touchscreens: the left stick moves and the right stick aims/pulses. Tap two tiles to swap; long-press reveals ×. Controls retain their existing names.

## Deployment

The application serves its frontend and Socket.io backend from one Express HTTP server. It listens on 0.0.0.0 and the host-provided PORT (default 3000). /health returns service status.

Render is a proposed host, not an already-created deployment. A publisher account and source repository or Docker image are needed. Players need no hosting account. See docs/DEPLOYMENT.md.

The render.yaml configuration uses the Free instance type for development/staging. Render's Free services sleep after inactivity; choose and approve an always-on service before relying on an instant-open competition link. No paid service is provisioned by this source package.

The Dockerfile is included as another deployment option; it has not been built in this workspace.

## Architecture

- server/game.mjs: authoritative room state and gameplay simulation.
- server/index.mjs: Express, Socket.io, sessions, limits, snapshots, and lifecycle.
- server/word-guide.mjs: private full/range validation, anagram advice, common-word suggestions and pickup explanations.
- server/word-index.mjs: cached multiset dictionary index, tile mapping and star-aware word offers.
- server/letter-supply.mjs: weighted letters, vowel balance and bounded nearby supply.
- public/tray-controls.js: drag/swap ordering, range selection and action-guided tip state.
- public/word-guide.js: stale-advice guards and explicit selection presentation.
- public/practice.js: isolated first-flight lesson model and mouse/keyboard/touch controller.
- server/dictionary.mjs: locally loaded dictionary and name filtering.
- public/app.js: lobby, HUD, word builder, controls, reconnect, and results.
- public/aim.js: full-circle keyboard, mouse and touch aiming with stable heading handoff.
- public/match-feedback.js: score-gap display, deduplicated word celebrations, lead alerts and countdown cues.
- public/arena.js: Canvas drawing, camera, interpolation/prediction, effects, minimap.
- public/asteroids.js: cached cratered rock texture, procedural fallback, charge lights and letter-count labels.
- public/defense.js: named browser state mirrors, room-state factory, constants and swept-contact geometry.
- public/planet.js: original cached Earth illustration and power-up-aware shield drawing.
- public/power-ups.js: power-up enum, constants, room state factory, browser mirrors and HUD presentation.
- public/neon.js: shared synthwave palette, moving grid and letter glow.
- public/objectives.js: shared mission briefing plus bounty and meteor timer presentation.
- public/assets/asteroids/rock-v15.png: generated rocky asteroid sprite; prompt/provenance in docs/ASTEROID_ART.md.
- public/rules.js: shared public constants and score values.
- public/fleet.js: shared ship IDs, names, and asset paths.
- public/ship-sprites.js: preloaded, cached Canvas textures with a vector fallback.
- public/assets/ships/: eight original transparent PNG ship sprites.
- test/: rules and eight-client network tests.

The server validates actions and resolves pickups, word consumption, scores, Earth damage/repairs, combo milestones, power-ups and round deadlines. Browser-level earthHealth, barrierThickness and maxBarrierThickness mirror snapshots only; every room owns an independent authoritative defense object. Clients send intentions, not trusted positions or points. Critical actions carry unique IDs for safe retries; movement uses volatile input packets. Rooms are separate.

## Current limits

- One Node.js instance with in-memory rooms. Do not scale to multiple instances without adding shared state and coordinating room ownership.
- Active matches do not survive a server restart or redeployment.
- A temporary client disconnect reserves the player's seat for 30 seconds; the world continues, and disconnection grants no immunity.
- A departed player's earned points remain in the current round's final standings.
- The initial room cap is 60 as a safety bound, not a demonstrated capacity claim. Each room allows 8 active players and 8 spectators.
- The dictionary has 192,308 filtered 3–10-letter entries in this pinned version. It includes uncommon words. Filtering is imperfect.
- The game is implemented and automated tests pass, but it is not yet publicly deployed or verified on real phones and laptops.

## Competition

The contest's official cutoff is October 30, 2026, at 11:59 p.m. Pacific (October 31, 2:59 a.m. in New York). Prepare the final URL, title, cover image, and description and submit personally through the designated Handshake mission. A source ZIP alone is not a completed public-game submission.

The nonviolent visual direction follows the user's decision. Neither source creation nor automated testing constitutes organizer approval or an eligibility guarantee.

See THIRD_PARTY_NOTICES.txt for dependency and dictionary licenses.
