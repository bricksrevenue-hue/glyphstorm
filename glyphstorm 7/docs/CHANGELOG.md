# Glyphstorm 1.10 — Flexible word tray and recovery

October 29, 2026.

- Replace the leading-prefix submission restriction with full-tray or selected-contiguous-range submission; retain physical pickup order and server ownership validation. Add desktop drag, tap-to-swap, any-tile deletion, free three-second Shuffle, live validation, longest-word selection and highest-score hints.
- Add cached multiset dictionary analysis, useful-letter outlines, dead-tray guidance, Smart discard, rate-limited recovery vowels and a forty-five-second zero-score nudge. A reserved vowel waits for a full tray to make room; removing tiles cannot create anagrams, so Smart discard preserves words and chooses useful recovery space.
- Weight letter generation, target 35–40% field vowels, bias local supply to tray needs, add bounded nearby pickups and a small eligibility-aware magnet. Keep far-field base density, rare-letter values and incoming threat trajectories.
- Make bounty choices achievable from the field plus an individual pilot's tray. Preserve +20 and once-only claims. Add labeled asteroid bonus vowels, star tiles and personal word-shield recharges; stars double the base word score once without multiplying the bounty.
- Move score/feed to the upper-left corner and review into the tray flow. Add a visible combo meter, shield timer, Earth damage ring/number/shake/Integrity pulse and world-space wave countdown, with reduced-motion alternatives.
- Simplify the lobby flight brief and add dismissible, action-guided live tips saved in localStorage. Preserve solo practice, rooms/invites, all ships, modes, settings, controls, match timing, physics, weapons, defense, disruption, waves, minimap, Boost and existing power-ups.
- Extend the existing authenticated, retry-safe action handler for arrange, shuffle and Smart discard. Add 24 automated cases (114 total) and update earlier tests whose ordered-prefix or always-STAR bounty assumptions were intentionally superseded.

Verification: all 114 tests and JavaScript syntax checks pass. Static HTML/import checks preserve every existing DOM ID and all artwork. Browser visual and physical-phone playtesting remains pending because browser observation was blocked by security policy. This update does not deploy a public service.

---

# Glyphstorm 1.9 — Competition polish

October 28, 2026.

- Add bounded word-to-Earth letter energy and a shield ripple, with a stationary reduced-motion alternative. Report actual capped HP and shield growth in authoritative scoring events/history and the existing score celebration.
- Add preset letter requests for teammates and Earth-defense calls. Derive sender, team, scope and position on the server. Enforce a five-second cooldown, six-second lifetime, spectator restrictions and per-recipient snapshots. Reuse action retry IDs; preserve cooldown on reconnect and clear signals at rematch.
- Move secondary live panels into Details on compact screens, keep essential flight/collection controls visible and use a side board in short landscape layouts. Restore the same DOM nodes on resize and exit; preserve sound/motion access.
- Gate keyboard, mouse and touch input while live dialogs are open. Explain that the round continues. Repair a stray closing tag in the existing game markup.
- Preserve ordered physical pickups, spelling, ship physics, weapons, asteroids, power-ups and word-only scoring.

90 automated tests pass. New checks cover cap-accurate feedback, signal validation/privacy/expiry, reconnect and retry safety with eight Socket.io pilots, torus effect geometry, bounded/reduced motion rendering and responsive panel relocation. An older rendering test creates its arena without the constructor; its fixture now initializes the new effect module. Browser/phone and newcomer playtests remain outstanding; no public deployment was made.

---

# Glyphstorm 1.8 — Guided first flight

October 27, 2026.

- Add optional solo practice before a first join and a replay button on the home screen. Teach pulsing, ordered collection, discarding a mistake and explicit scoring without changing live rooms or scores.
- Add private server dictionary previews and common-word suggestions with cyan PULSE/COLLECT markers. Preserve physical pickups and collection order.
- Label Submit with the longest valid unused leading word and retained letters. Preserve explicit Review selection; never submit automatically or silently substitute for an invalid reviewed word.
- Explain short, unknown and reused words before a normal submission. Retain server validation and existing score, repair, combo and retry behavior.
- Add Discard last and retain individual discard inside Review, using the existing shared cooldown.
- Explain blocked pickup from capacity, review, temporary protection and another pilot's priority. Keep private notices out of public player snapshots.
- Update mission/help copy, cache versions and the complete-source package.

New automated checks cover prefix choice, stale advice, scoring/repair invariants, suggestions, blocked pickup, correction, the isolated lesson and private advice to eight clients plus a spectator. Browser/device visual and onboarding playtests remain outstanding.

---

# Glyphstorm 1.7.1 — Clear letter collection board

October 27, 2026.

- Replace the understated tray presentation with a prominent LETTER COLLECTION board, a live word preview and ten large numbered slots.
- Mark the next available slot in cyan, highlight newly collected tiles briefly and clearly warn when all ten slots are full. Reduced motion suppresses the pickup animation.
- Keep Submit, Review / shorter word and Discard visible. During review, show the selected leading word separately from letters that will be kept.
- Use two rows of five tiles on portrait phones and one row on wider displays, outside the arena's touch controls.
- Add collection announcements for screen readers and preserve focus when review tiles refresh. Server-authoritative private inventories and all gameplay rules stay intact.

Existing gameplay tests, source syntax and static DOM checks are recorded in VERIFICATION.md. Browser and real-device visual playtesting remains necessary.

---

# Glyphstorm 1.7 — Neon arcade power-ups

October 27, 2026.

- Add three modular, server-authoritative power-ups: Violet Guard, EMP Blast and Slow Motion. Every five consecutive valid words triggers a random effect for eight real seconds, represented as 480 equivalent frames.
- Share combo counts within each team; keep separate counts in free-for-all. Invalid/reused words reset only their owning combo. New milestones replace the active effect without stacking. Critical-action retries cannot count a word or activate a power twice.
- Violet Guard consumes incoming letters without Earth damage or red damage feedback and gives the shield a thick violet glow. Ships keep their original protection rules.
- EMP preserves incoming letter identities and positions, converting them into ordinary safe pickups. It continues neutralizing new arrivals for eight seconds and awards no points.
- Slow Motion applies a 0.4 displacement multiplier without mutating base velocity. Server collision paths and client interpolation use the same multiplier. Ship and pulse physics stay unchanged.
- Reset power-ups on finish and rematch, preserve their original expiry on reconnect, and keep rooms isolated. Defense-off mode retains classic scoring without power-ups.
- Add combo/effect/countdown HUD, shared activation announcements, optional sound and explicit rules in the mission briefing/help for players and spectators.
- Add deep-purple space, a moving neon perspective grid, ten-pixel letter glow and high-velocity pink/lime/cyan bursts. Pink letters identify incoming threats. Reduced motion freezes the grid and suppresses letter glow and particles.
- Preserve generated fleet/asteroid art, ordered physical collection, weapons, defense repairs, bounties, boosts and meteor showers.

76 automated tests pass. New checks cover all three random branches, milestones, team scope, reset/replacement/expiry, multiple frame rates, safe EMP pickups, shared snapshots, retry safety and reconnects. Canvas checks use a recording context. Browser and real-device visual/audio playtesting remains outstanding; no public deployment was made.

---

# Glyphstorm 1.6.1 — Make the mission visible

October 27, 2026.

- Add a prominent lobby briefing for every pilot, showing the three actions, shared Earth, word-only scoring and explicit win/fail conditions.
- Keep a mission ribbon and Mission & rules button visible for pilots and spectators throughout play.
- Adapt one shared description to defense on/off, free-for-all/teams and the selected round duration. Use it in lobby, help, launch countdown and HUD.
- Explain personal word-review protection separately from Earth's barrier, show the Earth repair reward during word review, and label Earth saved/mission failed on results.
- Put mission guidance outside the flight/touch surface with responsive layout rules.

65 existing automated tests pass. Fixed/dynamic briefing DOM IDs and module imports resolve; all four defense/team descriptions were inspected. Browser security previously blocked visual testing; a real browser/phone playtest remains required. No gameplay or server mechanics changed.

---

# Glyphstorm 1.6 — Shared planetary defense

October 27, 2026.

- Add 100-HP shared Earth at a fixed world position, a neon shield starting at thickness 5, capped at 25, and a lobby toggle (default on).
- Incoming orange letters join the existing bounded letter array. Waves scale from one to three letters with player count; existing crystal, asteroid and ship-drop spawns stay intact.
- Use swept relative motion for moving-letter pickups, pulse interceptions and shield breaches. Collect before impact to save a tile; a later collection or pulse cannot reverse an earlier breach. Exact simultaneous pickup/breach ties favor the barrier. Nearest solid targets still block pulses.
- Remove a breached incoming tile immediately, deduct 5 HP once, and call the existing finish flow at zero. Preserve scores, distinguish Earth loss from a timed finish, and reset defense on rematch.
- Validated unique words repair 2 HP and grow the shield by half their length with hard caps. Existing critical-action IDs prevent repeated scoring or repairing on retries.
- Add cached Canvas Earth artwork, off-screen direction marker, minimap objective, health meter, shield level and wave status. Keep the camera, ship physics and existing full-circle controls.
- Add 300-ms cyan particle rings, green/orange high-velocity action bursts and a brief red impact tint; retain particle bounds and reduced-motion preferences.
- Include the completed 1.5 arcade upgrade: generated realistic asteroid texture, 550-ms boost/6s recharge, timed meteor showers and globally first-claimed +20-point word bounties.
- Test servers can disable the wall-clock interval while advancing their injected clock explicitly, eliminating duplicate simulated ticks in network fixtures. Production retains its 30-Hz interval.

65 automated tests pass. Eight connected clients agree on boosts, bounty claims, repairs, meteor rocks and fatal defense results. Reconnect restores the final defense state, and other rooms remain unaffected. Visual browser and real-device testing remains outstanding; browser policy prevented the preview. No public hosting changes.

---

# Glyphstorm 1.4 — Letter asteroids

October 20, 2026.

- Add eight drifting, replenishing asteroids alongside the existing 44 crystals.
- Three light-pulse hits release four distinct collectible tiles with at least one vowel. Release positions spread out and seek clearance from nearby solid bodies.
- The final pulse's pilot/team receives two seconds of pickup priority. Existing tray capacity, physical spelling order, letter expiry and word-only scoring remain.
- Resolve the nearest crystal or asteroid along a pulse path, including wrapped edges. Consume each pulse once and release each asteroid's letters once under simultaneous hits.
- Add original Canvas rock/crater artwork with glowing seams, three charge lights, a four-letter label and gold minimap dots.
- Add charge tones, an opening melody, a burst of light and an opener announcement; honor sound and reduced-motion preferences.
- Synchronize asteroid position and remaining hits through server snapshots. Clear asteroids in the lobby and start each round fresh.
- Update the home page, flight manual and launch hint with the new rules.

44 automated tests passed. Tests cover simultaneous hits, final-pulse priority, teammates, four distinct letters and a vowel, physical pickup order, tray/world limits, wrapped collision, harmless nudging, deadlines and rematches. Eight real Socket.io clients agree on progress and the released tiles after actual client pulse input. Canvas call paths run in a recording context; browser/phone visual testing remains outstanding. This is a source download, not a hosted deployment.

---

# Glyphstorm 1.3 — Arcade feedback

October 20, 2026.

- Add short engine trails and light-pulse streaks, bounded crystal/word particles, and floating collected letters.
- Celebrate valid words with their actual points, plus special recognition for longer words. Scores and gameplay rules are unchanged.
- Show a live score target: points needed to take the lead, current lead margin or a shared lead. Team mode combines team scores, including retained departure points.
- Announce lead changes and ties. Emphasize the final 30 seconds with a warm border, notices and optional final-ten-second audio.
- Add optional pickup notes, scoring melodies and lead sounds with rate limits. Sound remains off by default; reduced motion removes trails, particles and arrival animation.
- Timestamp server presentation events so old effects do not replay after a delay. Deduplicate acknowledgement/snapshot word celebrations and preserve reconnect history.
- Cap particles at 320 and each ship trail at 14 samples; avoid rebuilding the scoreboard on every unchanged snapshot.

36 automated tests passed, including all prior gameplay and eight-client network tests. New checks cover score gaps, teams, ties, retained scores, reconnect/deduplication, countdown cues and bounded/reduced-motion effects. Browser, phone and audio playtesting remains necessary. This source package does not update a hosted site.

---

# Glyphstorm 1.2.1 — Full-circle rotation controls

October 20, 2026.

- Added continuous Q/E turning: Q counterclockwise, E clockwise. WASD/arrows remain independent movement controls.
- Releasing the turn keys keeps the current heading; a stationary old mouse position cannot snap it back. Moving the mouse resumes free aiming.
- Recompute cursor aiming each frame as the ship and camera move. Listen across the arena wrapper and capture an active mouse press so dragging beyond the canvas does not lose aim input.
- Retain the prior heading at the cursor center and joystick dead zone. Joystick direction covers all quadrants without up/down snapping.
- Restore the authoritative heading on reconnect and clear held aiming input on blur, help, and word review.
- Add rotation instructions to the flight manual and desktop arena HUD. Refresh entry versions to 1.2.1.

29 automated tests passed. New regression checks cover full rotations at 30/60/120 FPS, pointer/touch vectors throughout the circle, moving-origin aiming, every hull's actual Canvas rotation call path (using a recording context), and server pulse headings across the 0/360 boundary. These are automated code checks, not a visual browser/device playtest.

---

# Glyphstorm 1.2 — Explorer fleet

October 20, 2026.

- Added all eight generated ship sprites to the local game.
- Added an accessible lobby picker with names, previews, selected state, and keyboard/touch buttons.
- Show each pilot’s hull and ship name in the crew roster.
- Server validates hull IDs, limits selection to seated lobby pilots, and resets readiness on a changed choice. Changes during countdown, play or results are rejected.
- Broadcast the selected hull with player snapshots; reconnects, resets and rematches preserve it.
- Cosmetic hulls have the same movement, stability, collection radius, scoring, and disruption rules. The original spelling-order gameplay is retained.
- Pilot/team identity uses a ring, name and minimap marker independent of hull paint. New pilots receive an unused identification color where available.
- Decode graphics once and cache 256px Canvas textures. The original vector craft remains playable if a sprite has not loaded or fails to load.
- Revalidate scripts/styles on reload and version the entry files so the update does not keep the previous renderer in browser cache.
- Correct the health endpoint version and update the startup/home version labels.

25 automated tests passed, including eight independent Socket.io clients agreeing on hull choices, invalid-choice rejection, reconnect/rematch persistence, equal physical collection reach across all hulls, and successful HTTP delivery of every PNG. Visual browser and phone testing still needs a local playtest. This update is a source download; no public deployment was made.

---

# Glyphstorm 1.1 — Steer to spell

Requested after the first local playtest, October 16, 2026.

## Playing

- Open crystals with light pulses as before.
- Touch released letters in the order your word needs them: C → A → T produces CAT.
- Steer around letters you do not want. There is no automatic selection of needed letters.
- Numbered tray slots show the collected sequence. Typing letters or clicking out of order cannot rearrange it.
- Enter, or the Submit word button, submits the collected sequence directly.
- Space, or Review / shield, stops the ship and opens the existing temporary shield. Review shows the word already collected.
- In review, tap the last tile of a shorter word to use the first N letters. Unused trailing letters stay. For CATS, selecting position 3 submits CAT and keeps S.
- Discard a letter removes one mistake, subject to the existing one-second limit. The rest retain their relative order.
- Physical pickups use first contact along the movement path, with wrapped-edge support. A nearby letter outside the contact area is not collected.
- No letters are collected during word review, including after shield expiry.

## Update your local copy

1. End the current test round and stop the old server with Control+C in Terminal.
2. Extract this updated ZIP into a new folder, keeping it separate from the old copy.
3. In Terminal, change into the new glyphstorm folder containing package.json.
4. Run npm ci, then npm start. The startup banner identifies version 1.1.
5. Reload every player browser tab. Create a fresh room and join with at least two pilots.
6. Collect letters in an intentional spelling order, avoid a nearby unwanted tile, and press Enter to score. Test a shorter leading word in review and check that trailing letters remain.
7. Compare the score on the second player screen. Send screenshots and the exact steps for any issue.

23 automated tests passed. The updated browser layout and physical feel still need local device playtesting. This source package does not deploy a public service.
