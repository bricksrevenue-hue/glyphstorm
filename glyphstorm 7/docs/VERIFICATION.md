# Verification record

## Current build: 1.10.0 · October 29, 2026

`npm run check` passes all JavaScript syntax checks. `npm test` passes 114 tests, including real Socket.io connections. HTML nesting is balanced: 188 unique IDs and 122 fixed app references, with every pre-existing ID retained. Local imports resolve and all ship/asteroid artwork is byte-for-byte unchanged. The review panel is a child of the tray; the score/standings/feed share an upper-left container. These are structural checks, not rendered screenshots.

### Requested cases (a–h)

| Case | Result and evidence | Remaining manual check |
| --- | --- | --- |
| (a) Rearrange and submit | Pass: actual drag-order and two-tap-swap controllers turn XTACY into XCATY. Server accepts selected CAT once and preserves XY. Two live clients agree on score and their private trays. | Desktop native drag/drop and phone taps in a browser. |
| (b) Discard middle | Pass: removing X from CXAT preserves CAT; cooldown and duplicate-network retries cannot discard twice. | Click/long-press × and Backspace/Delete interaction. |
| (c) Full dead tray | Pass: QZXJKQZXJK has no possible words, a Smart discard and highlighted candidates; the non-blocking hint branch is wired. Solvable trays are not falsely labeled dead. | Visual prominence and readability. |
| (d) Recovery vowel | Pass: absent before twenty seconds, delivered at twenty, no second gift before forty-five seconds; progress defers it. Full trays reserve a vowel and receive it once when space opens. Review/reset/disconnection defer automatic delivery. | Gift animation and reserved-vowel text. |
| (e) Invalid Submit | Pass: live full/range validation rejects invalid/reused/stale advice; both Submit controls use validity; server independently rejects invalid payloads. | Gray/disabled appearance and single inline error. |
| (f) Score versus Earth | Structural pass: score moved into the upper-left HUD; review is in the board flow rather than over the arena. | Actual desktop/phone overlap at different camera positions. |
| (g) Two-player room | Pass: two clients join the same room, ready/start, arrange, submit, preserve leftovers, receive scores and retry Shuffle/discard/Smart discard safely. Existing eight-client suites also pass. | Two physical devices on the public host. |
| (h) Mobile layout | Controller/structural pass: tap-swap/range state and compact HUD relocation tests pass; both original sticks remain; board has responsive scroll and landscape placement. | Real phone portrait/landscape, touch targets, safe areas and scrolling. |

### Additional automated checks

- The reported ETANGLEENC inventory has many valid subsets/anagrams in the actual bundled dictionary. ELEGANCE scores 61 base points. Best-word advice never mutates or scores inventory; Shorter word uses server-authorized ordering before normal submission.
- Forged/duplicate/partial/stale reorder inventories fail without changing tiles. Submissions require a real contiguous range and explicit review; unused tiles and unused stars remain. All three new actions use existing phase/role/deadline/rate/retry protections.
- Smart discard ranks words retained and then possible recovery vowels. Weighted frequencies keep J/Q/X/Z/K rare and their existing values. Supply targets the field vowel band, stays local and does not change collected, released or nearby crystal letters during balancing.
- Magnet respects pickup priority, capacity, protection, review, nearest useful selection, torus seams and 42px/second speed; incoming letters are untouched.
- Bounties never combine rivals' private trays. Asteroid rewards preserve normal letter counts except the labeled extra vowel, existing hits and two-second priority. Stars multiply base score by two only once and leave the +20 bounty unchanged. Active word shields bank one recharge without extending the running shield.
- Live tips advance only on matching actions; saved completion suppresses them. Zero-score hints prefer a short available word at forty-five seconds. There is no bot subsystem; human word feed uses deduplicated real events.
- Recording Canvas checks show the Earth impact ring and wave countdown, including static reduced-motion warning. Existing tests cover fatal damage, shielding, EMP, Slow Motion, waves, scoring repair, particle limits, ship rotation, collision ordering, team privacy, invitation rooms, reconnect and rematch.

### Required browser/device playtest

Automatic approval/security review rejected browser observation of the local game in this environment. No alternative browser route was used. No visual, audio, mobile-device or hosted-latency pass is claimed.

1. Run `npm ci`, `npm start`; confirm 1.10.0 on the home screen. Use two independent browser sessions and a phone in one room. Keep existing modes and round settings.
2. Collect at least six letters. Drag, tap-to-swap, Select range in either direction, Use all, Shorter word, and submit. Confirm the preview, score, retained tiles and Earth repair agree. Hit Enter while a tile has focus.
3. Select and discard a middle tile, then use Discard last. Long-press a tile for ×. Shuffle twice rapidly and confirm the three-second cooldown. Fill an unspellable tray and verify guidance; remain without pickups/submits for twenty seconds, then free a slot for its reserved vowel.
4. Open review while incoming letters approach. Check its timer, non-modal position and close action; review stops flight/collection as before, and shield timeout does not pause the round. Invalid words should have gray/disabled Submit with no duplicate toast.
5. Let one incoming pink letter breach: confirm −5, Earth ring flash, Integrity pulse and brief shake. Toggle reduced motion and repeat. Check the near-Earth/offscreen wave countdown and 3/5 progress meter.
6. At 320/375/390px portrait and phone landscape sizes, inspect Earth, corner score, both sticks, ten tiles and all actions. Scroll only the board when needed. Rotate while review is open and make sure it remains usable. Verify original Details, Signals and preferences.
7. Try each labeled asteroid reward, a bounty, teammate collection priority, disruption, Boost, spectators, reconnect, rematch and defense-off rounds. Check no existing feature regressed.

Complete source packaging checks exact file bytes, heredoc round-trips, Bash syntax and ZIP CRC. No public deployment is included.

---

## Previous build: 1.9.0 · October 28, 2026

- `npm run check` passes for all server/client modules; `npm test` passes all 90 tests.
- Eight Socket.io pilots, a spectator and a separate room verify that team letter requests never appear in opponent/spectator/public snapshots. Forged sender/team/scope fields are ignored. Duplicate requests produce one signal, reconnect preserves its cooldown, and spectators cannot signal.
- All nine screens in the room agree on word score events and actual capped rewards. Retried submissions never repair twice; client-supplied reward amounts are ignored.
- Server tests cover five-second cooldown, six-second expiry, invalid presets/letters, classic mode, FFA broadcasts, phase/role restrictions and rematch clearing. Signals leave letters, score and Earth HP unchanged.
- Word energy follows short torus paths, skips old/replayed events, caps active effects at 16 and clears at results. A recording Canvas verifies that reduced motion draws stationary rings without moving letter glyphs. Reward text distinguishes +1 HP at 99, full HP, partial shield growth and a capped shield.
- A DOM fixture verifies that compact panels retain identity and live values, restore desktop order and close on resize/exit. This is a controller test, not a browser layout check.
- Static checks: 173 unique HTML IDs, 110 fixed app DOM references, 32 local browser imports and balanced HTML nesting. The arena, tray and review panel remain inside the game section.
- Complete source and ZIP are checked for exact source equality, Bash syntax, round-trip heredocs and ZIP CRC during packaging.

### Device and first-time-player checks still required

1. Start this version in a fresh extracted folder; join a room from a laptop and phone. Verify the version reads 1.9.0. At 320/375/390px portrait widths and phone landscape sizes, check Earth health, arena, both sticks, all ten slots and Submit. Open Details for power-ups, bounties, meteor timers, standings and preferences. Rotate and close; confirm the controls do not stick.
2. Score a word near Earth and far away, including across the world seam. Observe letter energy and the shield ripple. Compare score and repair text on all screens. At full health/shield, confirm no nonexistent repair is claimed. Enable reduced motion and repeat.
3. With four or eight pilots in teams, request a letter and send Defend Earth. Verify only teammates see the feed and gold minimap marker, requests use the sender's location, and defense points to Earth. Try repeatedly, reconnect, then rematch. In FFA, verify only the shared defense preset appears.
4. Open Details/Signals while moving or holding pulse, including with two fingers on the sticks. The round must continue, controls must stop and resume only after fresh input. Test Escape and keyboard focus. No protection is granted by these dialogs.
5. Give five new players no verbal instructions. Record time to first valid word (target under one minute), whether they can correct an unwanted pickup, and whether they can explain why words repair Earth. Use these observations to adjust the briefing before submission.
6. Test the actual public deployment from separate networks and phones, including joining, reconnecting, the end screen and rematch. This package has not been publicly deployed or verified at a public URL.

The available browser path remains blocked by its security policy; no browser, touch-device or new-player usability pass is claimed.

## Historical verification

Version 1.8.0 guided first-flight update: October 27, 2026. All 84 automated tests pass.

## Guided first-flight checks (1.8)

- All 84 automated tests pass; all JavaScript syntax checks pass.
- 152 unique HTML IDs, 109 fixed JavaScript DOM references and 26 local browser-module imports resolve. Version markers agree on 1.8.0.
- Prefix advice chooses CAT from CATX, CATS from CATS when unused, falls back to an unused shorter prefix and never rearranges CAXT or TAC. Invalid explicit Review selections are not silently replaced; stale advice cannot submit.
- Repeated previews do not score, repair Earth, change a combo or consume tiles. The normal validated submission scores the selected leading word once and preserves its suffix.
- Suggestions use common dictionary words, existing prefixes and eligible letter/crystal supply, remain stable and report missing supply without forcing pickups.
- Blocked pickup notices remain private, expire and respect priority, review, protection and capacity. Existing collision/ordered-collection tests continue to pass.
- Discarding the last letter preserves all earlier tile IDs and order, and respects the shared one-second cooldown.
- The practice model requires a pulse, C then X pickups, explicit X discard, A then T pickups and explicit submission. A new practice run starts with zero points; it has no networking or live-room access.
- Eight Socket.io pilots receive only their own word advice. A spectator sees no private advice. A suggested-prefix submission retains X, ignores forged advice and scores exactly once under request retry. New client modules are available over HTTP.

## First-time-player playtest still required

1. Open a fresh browser profile, enter a pilot name and choose Create or Join. Complete First flight with mouse/keyboard, then separately with both touch sticks. Pulse C, collect C and X, discard X, collect A and T and submit CAT. Confirm live score starts at zero.
2. Try Skip, close, replay from the home screen and returning after completion. Practice must never join a room until Continue/Skip & join is chosen, or pause any existing room.
3. In a match, compare suggestions against cyan NEXT markers. PULSE marks crystals, COLLECT marks released letters. Confirm all physical pickups still occur in contact order, including unwanted letters.
4. Build CATX. Confirm the button explicitly offers CAT and keeps X, on Enter and touch. In Review, choose the whole invalid sequence and confirm submission is disabled with a reason. Check a valid longer word and a reused word.
5. Use Discard last; try it twice within a second. Use Review → Choose a letter to discard and remove a middle mistake. Confirm the remaining letters retain their order.
6. Try collecting with a full board, during review, while temporarily protected and during another pilot's priority. Confirm the explanation is appropriate and disappears when the block ends.
7. Inspect phone portrait/landscape layout, practice controls, button labels, focus, audio and reduced motion. Have five new players try without verbal explanation; record first-word time and whether they can correct a pickup and explain the Earth objective.

The browser path remains blocked by its security policy. These are automated code/network checks, not a claim of browser, touch-device or new-player usability testing.


## Collection board checks (1.7.1)

- All 76 existing automated gameplay/network tests pass after the presentation update; Node syntax checks pass.
- An existing rotation check initially hit a randomly generated asteroid, consuming its test pulse. Its fixture now clears rocks and disables replenishment so heading checks use an unobstructed firing path. Gameplay code was not changed for this test fix.
- All 136 DOM IDs are unique, 96 fixed DOM references resolve, and all 22 local browser imports resolve. Entry and package versions agree on 1.7.1.
- The board reads the local player's authoritative private tray. It does not request or expose another pilot's letters.
- Reviewed empty, partially filled, full, discard and word-review presentation paths. The visible word preserves order; review separates the selected prefix from the retained suffix. No client dictionary validation is implied.
- Newly collected tile IDs receive one brief highlight on a tray change; existing tiles do not flash on snapshots. Reconnect/rematch identity changes suppress spurious pickup highlights. Reduced motion disables animation.
- The board remains outside the arena with responsive grid rows, and spectators retain their existing board-free layout.

Pending browser/device checks: inspect the board at desktop, phone portrait and landscape sizes; collect ten letters in order; check NEXT advances correctly and full-board guidance appears; submit a shorter leading word and verify the retained suffix; discard a tile; verify keyboard focus, screen-reader announcements and reduced motion. Compare two players' screens to ensure each sees only their own letters. The available browser path remains blocked by security policy, so no visual pass is claimed.


## Power-up and neon checks (1.7)

- All 76 tests pass; syntax checks pass. All 130 DOM IDs are unique, 90 fixed DOM references resolve, and all 22 local browser-module imports resolve.
- Every fifth valid word can select each of the three effects. Team counts are shared, free-for-all counts independent. Invalid/reused words reset only that combo; existing scoring and repair still apply once.
- New milestones replace effects, reset duration to eight seconds and never stack. At 30/60/120 FPS the browser mirrors agree on remaining time; 480 frames is a normalized counter, not a rendering-dependent timeout.
- Violet Guard removes a contacting letter once without health loss, red flash timestamp or breach count. Damage resumes at expiry; fatal damage still ends the round once.
- Slow Motion moves incoming letters at 40% speed without modifying their base velocity or affecting ships/pulses. Moving-letter collision paths use the slowed displacement.
- EMP keeps letter identity and position, leaves ordinary pickups untouched and neutralizes fresh incoming waves only while active. It adds no score and makes neutralized pickups immediately available to all.
- Room isolation, defense-off behavior, round finish and rematch resets retain correct power-up state.
- Eight Socket.io clients plus a spectator receive identical effects, combo counts, expiry, letter state and health across all three power-ups. Forged activation actions are rejected; forged power fields are ignored. Retried submissions do not advance milestones, score twice or extend expiry. Reconnect keeps the existing deadline.
- New modules are served over HTTP. Recording Canvas checks verify the moving grid, static reduced-motion grid, shadowBlur 10 with letter color, and the violet shield returning to cyan on expiry. Burst colors are pink/lime/cyan.

## Power-up visual playtest still required

1. Start 1.8.0 in a fresh folder, reload two or more clients, choose teams and leave defense on. Each five combined valid team words should trigger one visible eight-second effect on all screens. Use different words per pilot.
2. Submit an invalid or reused word and verify only that pilot/team combo resets. Opening review and discarding should preserve it. Reach another milestone before expiry and confirm the new effect replaces the old one.
3. Violet Guard: let an incoming pink letter touch the violet shield. The letter should disappear without damage or red flash. Normal cyan shield and damage should return at expiry.
4. EMP: incoming pink letters should stop in place and become safe lime pickups, including waves arriving while the effect is active. Collect in spelling order and confirm there are no duplicates or added points.
5. Slow Motion: compare incoming letter speed before, during and after the effect. Ships, pulses, rocks and the match clock must remain at normal speed.
6. Reconnect and join as a spectator. Confirm matching countdowns and no old activation celebration. Finish/rematch and repeat with defense off.
7. Inspect the neon grid, letter readability, particles, HUD and controls on desktop and phone portrait/landscape. Toggle reduced motion and sound. Check the arena remains usable in an eight-player match.

No browser visual, device, audio or hosted performance pass is claimed. The available browser connection failed and subsequent local observation was blocked by its security policy.

## Mission clarity checks (1.6.1)

- All 65 existing tests pass after the presentation update; Node syntax checks pass.
- All 125 DOM IDs are unique; 89 fixed references and the generated briefing IDs exist; local imports resolve.
- Inspected descriptions for free-for-all/teams with defense enabled and disabled. They state the correct shared survival condition, score winner, round duration and classic-mode behavior.
- The same mission description supplies the lobby briefing, permanent HUD, help and countdown. Both pilots and spectators receive the normal game view containing the HUD.
- Copy-paste source block and ZIP were regenerated from the current project and checked for exact source contents.

Pending visual checks: confirm the briefing is easy to read before readying up; toggle defense/team settings and compare both screens; join late as a spectator and open Mission & rules; verify portrait/landscape controls remain usable with the mission strip visible. Gameplay continues while help is open.

## Defense and new arcade checks completed

- Per-room initialization, exact initial health/shield values, host-only lobby toggle and browser snapshot mirrors.
- Swept boundary/inside/tangent/fast-crossing contacts. Incoming letters are removed before damage; an impact cannot apply twice.
- Moving-letter physical order, collection before impact, rejection of rescue after impact, full trays and review restrictions. Ordinary released letters remain harmless.
- Existing pulse interception with pickup priority and no points; too-late interception cannot undo damage; nearer asteroids still block pulses.
- Invalid/reused words do not repair. Valid words preserve unused suffixes, retain existing score calculation, grow by half their length and cap health/thickness correctly.
- Fatal damage finishes once, preserves score history, rejects new actions, returns no winners and resets for rematch. Timed survival preserves the original score/tie rules.
- Wave schedule, no catch-up avalanche, disabled defense and bounded letter/particle state.
- Ten cyan particles expire at 300 ms; ordinary weapon/word bursts contain hot pink, laser lime and neon cyan with greater initial velocity; reduced motion skips particle spawning.
- Earth renderer uses the authoritative radius/thickness, shadowBlur 15 and shadowColor #00f3ff. Canvas checks use a recording context, not pixel screenshots.
- Boost normalization, speed, cooldown, cancellation, roles, protected states and ordered pickups through wrapped seams.
- Meteor timing, four-hit/six-letter release, vowel guarantee and released-letter lifetime; bounty validation, single global award, expiry, word-history restriction and team scoring.
- Eight real Socket.io clients synchronize all defense fields, boosted ships, simultaneous bounty submissions, repairs, meteor state and early results. Retried submission IDs cannot repair twice or exceed caps. Separate room unaffected; reconnect restores the fatal result.
- HTTP delivery of every new module and asteroid PNG; fixed DOM IDs and local imports resolve.

## Defense playtest still required

1. Start 1.8.0 and join from two tabs or devices. Leave Planetary defense on, ready up and launch. Compare 100/100 HP and shield 5/25.
2. Find Earth using its minimap circle or cyan direction marker. Confirm the planet stays in a shared world position while cameras follow each ship.
3. After 12 seconds, follow a pink letter. Let one breach: both screens should lose exactly 5 HP, see a cyan ripple and brief red tint. Collect another in order and intercept a third with a pulse; neither should damage Earth.
4. Submit a valid word: both screens should gain 2 HP up to 100 and half the word length in shield thickness up to 25. Invalid or repeated words must do neither.
5. Leave incoming letters uncollected until zero health. Confirm both screens enter the same failure result, preserve points and allow a host rematch with fresh defense state.
6. Repeat with defense off, teams, spectators, temporary reconnect, full trays, word review, muted sound and reduced motion.
7. Boost toward a letter, watch the 30-second meteor wave and race the first word bounty. Ensure the defense HUD remains readable on phone portrait and landscape with both touch sticks.



## Completed in the development environment

- Node syntax checks for the server and client JavaScript, including the asteroid renderer, match feedback, aiming controller, fleet catalog and texture loader.
- Three asteroid hits release four unique, spaced tiles with at least one vowel; hits do not award points.
- Final-pulse priority is shared with teammates, expires after two seconds and survives simultaneous competing pulses without duplicate releases.
- Asteroid letters follow physical contact order and respect tray capacity, world limits and round deadlines. Asteroids gently nudge ships without resetting them.
- Nearest-body pulse collision works across a wrapped edge; asteroids wrap, replenish and reset on rematch.
- Eight Socket.io clients agree on each charge step and the same four released tiles after actual pulse input. The asteroid frontend module is served over HTTP with cache revalidation.
- Score targets and lead changes for free-for-all and teams, including ties, spectators and retained departure points.
- Word celebrations occur once regardless of acknowledgement/snapshot order; reconnect history suppresses old words and a new match clears the history.
- Stale presentation events are ignored; repeated timer updates do not repeat the same second's cue and joining late does not replay missed countdown cues.
- Particle effects stay bounded and expire; reduced motion clears trails/particles while keeping score text. These use code-level checks, not visual screenshots or performance measurements.
- Full clockwise/counterclockwise keyboard turns at 30/60/120 FPS; release holds heading and simultaneous Q/E stops turning.
- Mouse and touch angle calculation sampled around the full circle, including diagonal directions, dead zones and a stationary pointer with a moving ship origin.
- All eight hulls exercise the Canvas rotation call path with local and remote headings, including 359-to-1-degree wrap. This test uses a recording Canvas context, not a browser or pixel screenshot.
- Server pulse direction and published heading match arbitrary input angles through the 0/360-degree seam.
- All eight hulls retain the same movement and physical collection reach; ordered pickups and near misses remain correct.
- Eight Socket.io clients agree on the complete selected fleet; spectators see it and reconnects/rematches preserve it.
- Invalid hull IDs, attempts to select for another player, spectator selection, and mid-round changes are handled by the server. Retry acknowledgements do not clear readiness again.
- All eight PNGs are available over HTTP with the correct content type and PNG signature. Sprites retain the original transparent pixels.
- Frontend module imports resolve, entry files are versioned, and all fixed DOM references exist without duplicate IDs.
- 76 automated tests passed, including real Socket.io connections from eight independent clients and two isolated rooms.
- Contested pickup uniqueness, 10-letter capacity, 2-second priority, and teammate collection.
- Swept physical-contact collection and pulse collisions across the arena seam.
- Collection follows contact order rather than letter spawn order; near misses remain uncollected.
- Contested letters go to the first contacting ship, with deterministic resolution of exact ties.
- Submissions reject rearranging and skipping, consume only a leading prefix, and preserve trailing letters.
- Review prevents collection even when its shield is on cooldown.
- Valid, invalid, reused, fabricated, and repeated-letter word submissions; submission requires word review; the direct Enter action enters review before submitting.
- No duplicate scoring when a submission acknowledgement is retried.
- Shield timing, cooldown, movement/pulse/collection restrictions.
- Optional disruption, friendly-fire exclusion, protected ships, letter drops, and reset protection.
- Server deadline rejection and shared wins on tied scores.
- Late spectators, readiness, balanced-team enforcement, host migration, and retained departure scores.
- Reconnection with a private token, recovery after all clients briefly disconnect, spectator action rejection, and rematch clearing.
- HTTP responses for the landing page, health endpoint, dictionary metadata, and Socket.io client script.
- Static validation that all referenced fixed DOM element IDs exist and are unique.

The user reported the preceding game working in a local playtest, but lacking excitement. This arcade power-up update still requires a browser playtest; automated checks did not exercise the visual picker, rendering or audio in a browser. The recording Canvas check now includes an asteroid alongside each rotating ship.

These are test results for code and network behavior, not a claim that eight people have played the game on real devices.

## Not yet verified

- Browser visual rendering and interactions. A browser tool was available, but opening the local preview first failed to connect and subsequent observation was blocked by browser security policy. No browser visual pass is claimed.
- Real phone and laptop usability and simultaneous touch gestures.
- Mobile Safari and Chrome behavior, audio permissions, keyboard focus, reduced motion, and screen-reader usability.
- Frame rate, latency, and bandwidth on actual hosted hardware.
- Public HTTPS/WSS deployment and anonymous access.
- Docker image build.

## Asteroid playtest

1. Start version 1.8.0, reload two player tabs and create a fresh room. Follow gold minimap dots to a larger amber asteroid marked 4 LETTERS.
2. Hit it once and twice. Confirm its charge lights match on both screens and no letters release early.
3. Land the third pulse. Confirm four separate letters appear and at least one is a vowel. Fly a deliberate route through selected letters; confirm their tray order follows that route.
4. Let another pilot land the final hit after you land the first two. Confirm they get collection priority; repeat with teams and test teammate access.
5. Verify the burst and optional sounds, then repeat muted and with reduced motion. Ensure asteroid hits themselves do not change the score.
6. Test near the arena's wrapped edge, with a full tray and near another crystal. Confirm letters remain reachable and other players see the same pickups.
7. Try phone portrait/landscape and a full eight-player round. Check labels, charge lights, frame rate and how quickly players can find asteroids.

## Arcade playtest

1. Start version 1.8.0 in a fresh folder and reload two player tabs. Enable Sound on one tab and keep the other muted.
2. Move and pulse in every direction. Look for short ship trails, pulse streaks and crystal sparkles. Collect letters and check that floating labels match the tray order.
3. Submit a word. Confirm one celebration and one scoring melody, the correct points on both screens, and a score target consistent with the scoreboard.
4. Overtake, tie and lose the lead. Repeat in teams and check that alerts refer to the team rather than just one pilot.
5. Briefly reconnect after scoring. Old celebrations should not replay. Finish and rematch; scoring the same word in the new round should celebrate again.
6. Watch the last 30 seconds and final ten seconds. Confirm notices, warm border and one tick per countdown second when sound is on. Check the final result still agrees on both screens.
7. Enable reduced motion: trails/particles and banner arrival animation should stop, while points and letters remain readable. Mute Sound and confirm all audio stops.
8. Test phone portrait and landscape with both touch sticks. Confirm banners do not obscure important letters or score information and frame rate remains usable during an eight-player round.

## Fleet playtest

1. Start version 1.8.0, reload the browsers, and create a new room.
2. In two separate browser tabs or devices, choose different ships and confirm the crew roster agrees on both screens.
3. Choose the same hull on both pilots and confirm names and pilot markers still identify them.
4. Ready up, change one ship, and verify that pilot must ready up again before launch.
5. Launch. Hold E for two seconds, then Q for two seconds: confirm a full turn in each direction on both players’ screens. Release to keep the heading, then move the mouse around the ship through every quadrant. Confirm the right phone stick also turns through the full circle.
   Move while holding the pointer still and verify the nose keeps pointing toward the cursor. Confirm pulses follow the nose and spelling-order pickups still work.
6. Test teams: the hull paint stays with the design, while rings, labels and minimap markers identify the team.
7. Briefly disconnect/reconnect one pilot, finish the round and return to the lobby. Confirm the choices persist.
8. Repeat on a phone, including tapping all ship cards and using the two sticks. Check small-screen ship readability and frame rate.

## Release playtest

1. Open the public URL while signed out. Create and join a room without any player account.
2. Use separate devices and networks, including a phone and a laptop.
3. Test both modes, all match durations, and disruption on/off.
4. Verify letter readability, accurate aiming, wrapped edges, collection priority, full trays, discards, direct Enter submission, and choosing the final tile of a shorter leading word in review.
5. Verify shield expiry, cooldown, invalid words, resets, and no friendly fire.
6. Compare every screen's score and final result.
7. Temporarily disconnect one device, reconnect within 30 seconds, then try after the reservation expires.
8. Leave as host and verify control transfer. Join mid-round and verify spectator-only access.
9. Play repeated rounds in the same room; verify previous scores and word histories are cleared.
10. Run a full 8-player round and record devices, browsers, network conditions, visible issues, and fixes.

Complete these checks before calling the game competition-ready.
