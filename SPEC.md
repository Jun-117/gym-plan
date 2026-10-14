# Gym Plan v2 — build spec

Read this whole file before writing code. Build exactly what it says. If something here is unclear, choose the simplest option and list it in your final summary.

## 0. Context and hard rules

- This repo is a static mobile page (GitHub Pages, `index.html`) that shows one beginner lifter's weekly gym plan in English. She is a beginner (strength training since late September). Her husband is called "Jun" on the page — keep that name, it is already public.
- **The repo is public.** Do not add any other personal name, the gym's name, the city, or workout times. Keep `<meta name="robots" content="noindex, nofollow">`.
- Static only: no build step, no frameworks, no external scripts, no analytics, no web fonts. Plain HTML/CSS/JS that works in iPhone Safari.
- Only the equipment listed in this file exists. Do not suggest kettlebells, a seated (push-forward) chest press, or anything else not listed here.
- Never show photo numbers. Photos are referred to by equipment name only.

## 1. Deliverables

1. `moves.js` — a standalone exercise library + renderer that exposes `window.MOVES` (API in §3). It must hold **every exercise ID in §7**, not only the ones the English page uses. A second page (Korean, not in this repo) will load the same file later, so every text field needs English **and** Korean.
2. `index.html` — rewritten for the new weekly plan in §4. Every exercise row opens a sheet rendered by `MOVES`.
3. `moves-demo.html` — a QA page that lists all IDs from §7 grouped by category, with an EN/KO toggle; tapping one opens the same sheet. Used for review.
4. Commit on a new branch `plan-v2` and push it. **Do not merge or push to `main`** (main is the live site).

## 2. What every exercise sheet shows

For the tapped exercise **and for each of its alternatives**:

1. Name + equipment line.
2. **Motion animation** (§5).
3. **Target muscles** infographic (§6) + a text line: "Main: … · Also: …" (KO: "주로: … · 같이: …").
4. **3 key points** (§8).
5. **Photo(s) from our gym** (§9), when the page has that photo.

Alternatives appear under a heading "If it's busy" (KO "자리 차면 — 대체"). Each alternative is a collapsible card (closed by default) with the same 5 parts plus an optional short note (e.g. "Same sets", "Lever adds weight (guess)"). The glute bridge row instead has a "Next step" card for the glute kickback machine with the note "When 15 reps feel easy".

## 3. `moves.js` API

```js
window.MOVES = {
  ids(),                       // all exercise IDs
  name(id, lang),              // "en" | "ko"
  renderSheet(id, opts),       // returns an HTML string for the sheet body
  animate(rootEl),             // starts every animation inside rootEl, returns a stop() function
};
// opts = {
//   lang: "en" | "ko",
//   photos: { key: { src, w, h } },   // photos this page has (see §9); missing keys are skipped
//   alts: [{ id, note }]              // optional; overrides the library's default alternatives
// }
```

- Inject the library's own CSS once (class prefix `mv-`). Colors come from CSS variables with fallbacks so each page can theme it: `--mv-ink`, `--mv-muted`, `--mv-line`, `--mv-surface`, `--mv-soft`, `--mv-accent`, `--mv-accent-soft`, `--mv-accent2`. Must work in light and dark mode.
- Captions for photos live in the library (EN + KO) keyed by photo key; the page only supplies `src/w/h`.

## 4. The new weekly plan (English page content)

Days follow Nepal time like the current page (after 12:00 the page opens on tomorrow). Saturday = rest (keep the current rest-day content). Day tabs: Mon Upper · Tue Hip · Wed Tone · Thu Upper · Fri Hip · Sat Rest · Sun Tone.

Every training day:
- **Warm up**: Treadmill · speed 5 · incline 2 · 10 min · Busy? Elliptical or spin bike.
- **Finish**: Stair climber level 1 for 1 min → level 2 · you can talk, but not sing · fill the rest with an incline walk (speed 5 · incline 6) · **15 min total** · Busy? Incline walk → both busy: elliptical (easy). Then Stretch 5 min.
- **While Jun finishes (optional)**: rest, stretch, or an easy walk (speed 4.5–5 · incline 0–2). Not an incline — a steep long walk burns more than her food plan allows (guess).
- New exercises (marked NEW): **2 sets for the first 2 weeks, 3 sets from Thu, Oct 29**.

### Tue & Fri — Hip Day ("Your main day")
| Exercise | Detail | Sets | Busy? |
|---|---|---|---|
| Hip Thrust (bench) — Main | Body weight. When you have 7+ reps left twice in a row → empty bar 20 kg + bar pad | 3 × 12 | Hip thrust machine — same sets |
| Romanian Deadlift (RDL) | A 5 kg dumbbell in each hand | 3 × 12 | — |
| Leg Press | 20 kg · feet high and wide on the platform | 3 × 12 | Goblet squat with one 5 kg dumbbell |
| Leg Curl (lying) | 5 kg | 3 × 12 | Dumbbell leg curl 2.5–5 kg (guess) |
| Hip Abduction | Outer thigh · 15 kg | 3 × 15 | Do it later — only 1 machine · or band side walk (guess) |
| Plank | Mat | 3 × 30 sec | — |

### Mon & Thu — Upper Body ("Shoulders, back and arms — the toned look")
| Exercise | Detail | Sets | Busy? |
|---|---|---|---|
| Lat Pulldown | 10 kg | 3 × 12 | Lever pulldown — its lever adds weight (guess) |
| Seated Row | 10 kg | 3 × 12 | Chest-supported row, one arm — lever weight (guess) |
| Chest Press (lie down, pin machine) | 10 kg (guess) · top plate = 5 kg | 3 × 12 | Light dumbbell bench 2.5–5 kg (guess) |
| NEW Dumbbell Shoulder Press (seated) | A 2.5 kg dumbbell in each hand | 2 × 12 | Shoulder press machine — lever weight (guess) |
| NEW Lateral Raise | 2.5 kg dumbbells · can't do 12? do 10 | 2 × 12–15 | Side raise machine (guess) · cable, one arm |
| NEW Cable Pushdown (rope) | Lightest plate (guess) | 2 × 15 | Other side of the cable (it has 2 stacks) · dumbbell skull crusher 2.5 kg (guess) |
| Crunch | Mat | 3 × 15 | — |

### Wed & Sun — Glutes + Tone ("Extra hip work and a full-body touch — no cardio-only day")
| Exercise | Detail | Sets | Busy? / Next step |
|---|---|---|---|
| Glute Bridge | Body weight · mat | 3 × 15 | Next step: glute kickback machine, when 15 reps feel easy |
| Hip Abduction | Outer thigh · 10 kg | 3 × 15 | Do it later — only 1 machine · or band side walk (guess) |
| NEW Goblet Squat | One 5 kg dumbbell at your chest | 2 × 12 | — |
| NEW 45° Back Extension | Body weight | 2 × 10 | Glute bridge on a mat |
| Dead Bug | Mat | 3 × 10 each side | — |
| Side Plank | Mat | 3 × 20 sec each side | — |
| Mountain Climber · optional | Mat | 2 × 10 each side | — |

Row → library ID mapping: treadmill_walk, stair_climber, hip_thrust_bench, rdl_db, leg_press, leg_curl, hip_abduction, plank, lat_pulldown, seated_row, chest_press_pin, db_shoulder_press, lateral_raise_db, cable_pushdown, crunch_mat, glute_bridge, goblet_squat, back_extension, dead_bug, side_plank, mountain_climber. The page passes its own `alts` (from the Busy? column) so they match the table above.

### Dates to know (replace the list)
- **Thu, Oct 15** — new plan starts
- **Oct 11 – 25** — Dashain. The gym was open on Oct 13 & 14. Open → this plan · closed → home workout
- **Sat, Oct 17** — first calorie check (guess)
- **Mon, Oct 19** — your 3 easy weeks are done
- **Thu, Oct 29** — new exercises go to 3 sets

Day notes (yellow box on that date): Oct 15 "New plan starts today. New exercises: 2 sets for now." · Oct 17 "First calorie check (guess) — Jun looks at your first 2 weeks." · Oct 19 "Your 3 easy weeks are done." · Oct 29 "New exercises go to 3 sets from today." · Dashain box on training days Oct 11–25 as above.

### Why this plan (replace the list)
- **Your goal changed to slim and toned**: toned = less fat **and** a bit of muscle that shows. So Mon & Thu now train shoulders, back and arms.
- **Hips stay exactly as before** — same hip exercises, weights and sets. Hip Day moved to Tue & Fri.
- **Your days are the opposite of Jun's**, so you never wait for the same machine (before, you took turns on the lat pulldown, row, leg press and leg curl).
- **No cardio-only day any more.** Cardio is a 10-min warm-up and a 15-min finish. Food is what makes the scale go down; this swap changes calories burned by only ~10 kcal a day (guess).
- **Squats are back, lightly** (goblet squat). Squats grow the front of the thighs more than hip thrusts do (study: Plotkin 2023) — a little front-thigh shape is part of the toned look.
- **New exercises start at 2 sets** — new lifters get very sore and quit; 2 weeks of 2 sets first.
- **You can't burn fat from one spot** (arms, thighs, belly) — fat goes down everywhere with food. **Women don't bulk up** from this: muscle grows by a similar percentage in women and men, but much less in kg (study: 2025 meta-analysis).
- **Weeks 3–4:** your legs may feel a bit bigger. That's water and stored energy in the muscles for a while, not bulk.

### Keep from the current page
Look and CSS (Instagram-settings style), day chips, "Main" badge, "Busy?" line, bottom sheet with "Done", More section: Weight rules (unchanged), Stay safe (unchanged), Tell Jun tonight (unchanged, copy button), Home workout (keep the lists, **delete** the sentence "Jun may swap the squats and lunges…"), Dates to know (new), Why this plan (new). Footer: "Weights from Oct 15." and the Add to Home Screen tip.

## 5. Motion animation

- SVG stick figure in the style of the drawings already in `index.html` (round head, thick round strokes, far-side limbs lighter), side view or front view per exercise (§7).
- Suggested build: an angle-based skeleton (viewBox about 0 0 160 150; torso 40, upper arm 23, forearm 22, thigh 32, shin 32, foot 11, head radius 9). Each exercise has 2–3 keyframes (root position + absolute segment angles). Interpolate **angles**, not x/y, so limbs keep their length. Front view = both arms and both legs.
- Props move with the body: dumbbells at the wrists, a barbell at the hands, a cable line from a fixed pulley to the hand, a pad on the hips, a rope handle, the machine seat/bench/back pad as fixed shapes, a mat on the floor.
- Loop start → end → start, 2.4–3.2 s per cycle, ease-in-out, ~0.3 s pause at each end. Use requestAnimationFrame only while the element is on screen (IntersectionObserver) and stop when the sheet closes.
- `prefers-reduced-motion: reduce` → no motion: show the start and end frames side by side labelled "1 Start → 2 End" (KO "1 시작 → 2 끝").
- It has to look right: knees and elbows bend the correct way, hands stay on the handle/bar, the body sits or lies on the bench/seat, feet stay on the floor/platform. Check every animation in `moves-demo.html` before committing.

## 6. Muscle map

- Two small simplified silhouettes side by side, front and back, made of simple rounded shapes (not an anatomy drawing). Regions use these IDs:

| id | EN | KO |
|---|---|---|
| delts_front | Front shoulders | 앞어깨 |
| delts_side | Side shoulders | 옆어깨 |
| delts_rear | Rear shoulders | 뒤어깨 |
| chest | Chest | 가슴 |
| biceps | Front of arms | 팔 앞(이두) |
| triceps | Back of arms | 팔 뒤(삼두) |
| forearms | Forearms | 전완 |
| abs | Abs | 복근 |
| obliques | Sides of waist | 옆구리 |
| traps | Upper traps | 승모 |
| lats | Lats (back width) | 광배(등 넓이) |
| upper_back | Middle of back | 등 가운데 |
| lower_back | Lower back | 허리 |
| glutes | Glutes | 엉덩이 |
| glute_med | Side glutes | 엉덩이 옆 |
| quads | Front thighs | 앞벅지 |
| hamstrings | Back thighs | 뒷벅지 |
| adductors | Inner thighs | 안쪽 허벅지 |
| calves | Calves | 종아리 |
| hip_flexors | Front of hips | 고관절 앞 |

- Main = `--mv-accent` fill, Also = `--mv-accent-soft`, all other regions neutral. Readable in light and dark.

## 7. Exercise library (all IDs required)

`view`: side or front. Photo keys are in §9. P = main muscles, S = also. Alts = default alternatives (the page may override).

| id | EN name | KO name | view | equipment (EN) | photo | P | S | alts |
|---|---|---|---|---|---|---|---|---|
| treadmill_walk | Treadmill walk | 러닝머신 걷기 | side | Treadmill | tread | quads, glutes | calves, hamstrings | elliptical, spin_bike |
| incline_walk | Incline walk | 경사 걷기 | side | Treadmill on an incline | tread | glutes, calves | quads, hamstrings | elliptical |
| stair_climber | Stair climber | 천국의 계단 | side | Stair climber | tread | glutes, quads | calves, hamstrings | incline_walk, elliptical |
| elliptical | Elliptical | 일립티컬 | side | Elliptical | ellip | quads, glutes | hamstrings, calves | — |
| spin_bike | Spin bike | 스핀바이크 | side | Spin bike | ellip | quads | glutes, calves | — |
| hip_thrust_bench | Hip thrust (bench) | 힙 쓰러스트(벤치) | side | Bench + barbell + bar pad (start with body weight) | smith | glutes | hamstrings, adductors | hip_thrust_machine |
| hip_thrust_machine | Hip thrust machine | 힙쓰러스트 머신 | side | Plate-loaded machine | htm | glutes | hamstrings | — |
| glute_bridge | Glute bridge | 글루트 브릿지 | side | Mat | — | glutes | hamstrings | glute_kickback_machine |
| glute_kickback_machine | Glute kickback machine | 글루트 킥백 머신 | side | Plate-loaded machine (chest pad, knee pad, foot plate) | kickback | glutes | hamstrings | — |
| rdl_db | Romanian deadlift (dumbbells) | RDL(덤벨) | side | Dumbbells | db | hamstrings, glutes | lower_back, forearms | — |
| rdl_barbell | Romanian deadlift (barbell) | RDL(바벨) | side | Barbell | — | hamstrings, glutes | lower_back, forearms | rdl_db |
| leg_press | Leg press | 레그프레스 | side | 45° plate-loaded leg press | legpress | quads, glutes | hamstrings, adductors | goblet_squat, squat_machine |
| leg_curl | Lying leg curl | 레그컬(엎드려서) | side | Plate-loaded machine — first set with no plates | legcurl | hamstrings | calves | db_leg_curl |
| db_leg_curl | Dumbbell leg curl | 덤벨 레그컬 | side | One dumbbell between the feet, lying on a bench | db | hamstrings | calves | — |
| hip_abduction | Hip abduction | 힙 어브덕션 | front | Pin machine (outer/inner thigh) | abduct | glute_med | glutes | band_side_walk |
| band_side_walk | Band side walk | 밴드 옆으로 걷기 | front | Big loop band | — | glute_med | glutes, quads | — |
| goblet_squat | Goblet squat | 고블릿 스쿼트 | side | One dumbbell held at the chest | db | quads, glutes | adductors, abs | — |
| back_extension | 45° back extension | 45° 백익스텐션 | side | 45° back extension bench | backext | lower_back, glutes | hamstrings | glute_bridge |
| back_squat | Barbell back squat | 바벨 스쿼트 | side | Squat rack with safety bars | rack | quads, glutes | adductors, lower_back | smith_squat, squat_machine |
| smith_squat | Smith machine squat | 스미스 스쿼트 | side | Smith machine | smith | quads, glutes | adductors | — |
| squat_machine | Squat machine | 스쿼트 머신 | side | Plate-loaded squat machine (exact type unknown) | squatm | quads, glutes | adductors | — |
| db_lunge | Dumbbell lunge | 덤벨 런지 | side | Dumbbells | db | quads, glutes | hamstrings, adductors | — |
| leg_extension | Leg extension | 레그익스텐션 | side | Pin machine | legext | quads | — | — |
| lat_pulldown | Lat pulldown | 랫풀다운 | side | Pin machine | latpd | lats | biceps, upper_back, delts_rear | lever_pulldown, pull_up |
| lever_pulldown | Lever pulldown | 레버식 풀다운 | side | Plate-loaded, one arm at a time possible | lever1, lever2 | lats | biceps, upper_back | — |
| pull_up | Pull-up | 풀업 | side | Bar on top of the cable tower (full body weight) | cable | lats | biceps, upper_back | — |
| seated_row | Seated cable row | 시티드 로우 | side | Pin machine | srow | upper_back, lats | biceps, delts_rear | chest_supported_row, tbar_row |
| chest_supported_row | Chest-supported row | 가슴 받치는 로우 | side | Plate-loaded, one arm at a time possible | csrow | upper_back, lats | biceps, delts_rear | — |
| tbar_row | Chest-supported T-bar row | 티바로우 | side | Plate-loaded | tbar | upper_back, lats | biceps, delts_rear | — |
| one_arm_db_row | One-arm dumbbell row | 원암 덤벨로우 | side | Dumbbell + bench | db | lats, upper_back | biceps, delts_rear | chest_supported_row |
| face_pull | Face pull | 페이스풀 | side | Cable + rope at face height | cable | delts_rear, upper_back | traps | band_pull_apart, reverse_pec_deck |
| band_pull_apart | Band pull-apart | 밴드 풀어파트 | front | Big loop band | — | delts_rear, upper_back | traps | — |
| reverse_pec_deck | Reverse pec deck | 리버스 펙덱 | front | Pec deck, sitting facing the pad (may not work on this machine — unconfirmed) | pecdeck | delts_rear | upper_back | — |
| db_curl | Dumbbell curl | 덤벨컬 | side | Dumbbells | db | biceps | forearms | preacher_curl, barbell_curl |
| preacher_curl | Preacher curl machine | 프리처 컬 | side | Pin machine | preacher | biceps | forearms | — |
| barbell_curl | Barbell curl | 바벨컬 | side | Fixed-weight barbell from the rack | db | biceps | forearms | — |
| chest_press_pin | Chest press (lie down, pin) | 체스트프레스(누워서·핀) | side | Pin machine with a red bench — top plate 5 kg | cpin | chest | triceps, delts_front | db_bench |
| chest_press_plate | Chest press (lie down, plates) | 체스트프레스(누워서·원판) | side | Plate-loaded — lever adds weight (guess) | cplate | chest | triceps, delts_front | — |
| db_bench | Dumbbell bench press | 덤벨 벤치 | side | Dumbbells + flat bench | db | chest | triceps, delts_front | — |
| bench_press | Barbell bench press | 벤치프레스 | side | Flat bench press rack | bench | chest | triceps, delts_front | smith_bench, chest_press_plate, db_bench |
| smith_bench | Smith machine bench press | 스미스 벤치 | side | Smith machine + flat bench | smith | chest | triceps, delts_front | — |
| incline_bench | Incline barbell bench press | 인클라인 벤치 | side | Incline bench press rack | incline | chest, delts_front | triceps | incline_chest_press, db_incline |
| incline_chest_press | Incline chest press machine | 인클라인 체스트프레스 머신 | side | Plate-loaded | inclcp | chest, delts_front | triceps | — |
| db_incline | Dumbbell incline press | 덤벨 인클라인 | side | Dumbbells + adjustable bench | db | chest, delts_front | triceps | — |
| db_shoulder_press | Dumbbell shoulder press (seated) | 덤벨 숄더프레스(앉아서) | front | Dumbbells + adjustable bench | db | delts_front, delts_side | triceps, traps | shoulder_press_machine, smith_shoulder_press |
| shoulder_press_machine | Shoulder press machine | 숄더프레스 머신 | side | Plate-loaded — lever adds weight (guess) | shpress | delts_front | triceps, delts_side | — |
| smith_shoulder_press | Smith machine shoulder press | 스미스 숄더프레스 | side | Smith machine + adjustable bench | smith | delts_front | triceps, delts_side | — |
| lateral_raise_db | Dumbbell lateral raise | 덤벨 사이드 레이즈 | front | Dumbbells (2.5 → 5 → 7.5 kg; no 3–4 kg) | db | delts_side | traps, delts_front | side_raise_machine, cable_lateral_raise |
| side_raise_machine | Side raise machine (standing) | 서서 하는 사이드 레이즈 머신 | front | Pin machine (likely · not confirmed) | sidem | delts_side | traps | — |
| cable_lateral_raise | Cable lateral raise (one arm) | 케이블 사이드 레이즈(한 팔) | front | Cable + D-handle | cable | delts_side | traps | — |
| cable_pushdown | Cable pushdown | 케이블 푸쉬다운 | side | Cable + rope | cable | triceps | forearms | db_skull_crusher, dips |
| db_skull_crusher | Dumbbell skull crusher | 덤벨 스컬크러셔 | side | Dumbbells + flat bench | db | triceps | — | — |
| dips | Dips | 딥스 | side | Dip handles on the leg-raise station (full body weight) | station | triceps, chest | delts_front | — |
| plank | Plank | 플랭크 | side | Mat | — | abs | obliques, glutes, delts_front | — |
| side_plank | Side plank | 사이드 플랭크 | front | Mat | — | obliques | glute_med, abs | — |
| crunch_mat | Crunch | 크런치(매트) | side | Mat | — | abs | — | — |
| crunch_machine | Seated crunch machine | 크런치 머신 | side | Machine where the seat and back fold toward each other | crunchm | abs | hip_flexors | crunch_mat |
| hanging_knee_raise | Hanging knee raise | 행잉 니레이즈 | side | Leg-raise station | station | abs, hip_flexors | forearms | crunch_machine, crunch_mat |
| dead_bug | Dead bug | 데드버그 | side | Mat | — | abs | hip_flexors | — |
| mountain_climber | Mountain climber | 마운틴 클라이머 | side | Mat | — | abs, hip_flexors | delts_front, quads | — |

## 8. Key points — rules (3 per exercise, EN + KO)

- Exactly 3 per exercise: (1) setup/position, (2) the movement, (3) the most common mistake or a safety cue.
- Use only standard, widely taught cues (the kind every mainstream coaching course teaches). No medical claims, no "burns fat here", no spot reduction, no promises, nothing unusual.
- Beginner words. EN ≤ 70 characters each. KO ≤ 40 characters, plain declarative Korean (e.g. "등은 편 채로 엉덩이를 뒤로 뺀다").
- Calibration examples:
  - hip_thrust_bench — EN: "Bench edge under your shoulder blades, feet flat, shins vertical at the top" · "Push through your heels and squeeze your glutes to lift your hips" · "Keep ribs down and chin tucked — don't arch your lower back at the top" · KO: "날개뼈 아래를 벤치 모서리에, 발바닥은 바닥에" · "뒤꿈치로 밀며 엉덩이를 조여 들어 올린다" · "위에서 허리를 꺾지 말고 갈비뼈를 내린다"
  - lat_pulldown — EN: "Thighs locked under the pad, hands a bit wider than shoulders" · "Pull the bar to your upper chest, elbows down toward your ribs" · "Don't swing back or pull the bar behind your neck" · KO: "허벅지를 패드에 고정, 손은 어깨보다 조금 넓게" · "팔꿈치를 옆구리로 내리며 바를 윗가슴까지" · "몸을 뒤로 젖히거나 목 뒤로 당기지 않는다"

## 9. Photos

Show a photo with a caption (EN in this page; the library also stores KO captions). Keys used by the library and the file each key maps to **in this repo**:

| key | file in this repo | EN caption | KO caption |
|---|---|---|---|
| tread | img/treadmill-stairs.jpg | Treadmill (left) · stair climber (right) | 러닝머신(왼쪽) · 천국의 계단(오른쪽) |
| ellip | img/elliptical-bike.jpg | Ellipticals · spin bike (right) | 일립티컬 · 스핀바이크(오른쪽) |
| legpress | img/leg-press.jpg | 45° leg press (plates) | 45° 레그프레스(원판) |
| legcurl | img/leg-curl.jpg | Lying leg curl (plates) | 엎드려서 하는 레그컬(원판) |
| db | img/dumbbells.jpg | Dumbbell rack · benches | 덤벨 랙 · 벤치 |
| abduct | img/hip-abduction.jpg | Outer / inner thigh machine (pin) | 허벅지 바깥쪽·안쪽 머신(핀) |
| latpd | img/lat-pulldown.jpg | Lat pulldown (pin) | 랫풀다운(핀) |
| lever1 | img/lever-pulldown-1.jpg | Lever pulldown (plates) | 레버식 풀다운(원판) |
| lever2 | img/lever-pulldown-2.jpg | Lever pulldown (plates) | 레버식 풀다운(원판) |
| srow | img/seated-row.jpg | Seated cable row (pin) | 시티드 케이블 로우(핀) |
| csrow | img/chest-supported-row.jpg | Chest-supported row (plates) | 가슴 받치는 로우(원판) |
| htm | img/hip-thrust-machine.jpg | Hip thrust machine (plates) | 힙쓰러스트 머신(원판) |
| smith | img/smith-bar-pad.jpg | Smith machine — the bar pad is the black tube on the floor, bottom left | 스미스 머신 — 바벨 패드 = 왼쪽 아래 바닥의 검은 원통 |
| cpin | img/chest-press.jpg | Chest press — lie down and push (pin · red bench) | 체스트프레스 — 누워서 미는(핀 · 빨간 벤치) |
| cable | img/cable.jpg | Cable tower — rope and handles · pull-up bar on top | 케이블 크로스오버 — 로프·손잡이 · 맨 위 풀업바 |
| shpress | img/shoulder-press-machine.jpg | Shoulder press machine (plates) | 숄더프레스 머신(원판) |
| sidem | img/side-raise-machine.jpg | Standing side raise machine (pin · guess) | 서서 하는 사이드 레이즈 머신(핀 🟡) |
| backext | img/back-extension.jpg | 45° back extension (red) | 45° 백익스텐션(빨간 기구) |
| kickback | img/glute-kickback.jpg | Glute kickback machine (plates) | 글루트 킥백 머신(원판) |

Keys used only by the Korean page (not in this repo — library stores captions; this page simply skips them): incline 인클라인 벤치프레스대 · squatm 스쿼트 머신(원판·종류 🔴) · tbar 티바로우(가슴 받치는·원판) · station 레그레이즈 스테이션(위쪽 = 딥스 손잡이) · crunchm 앉아서 하는 크런치 머신 · legext 레그익스텐션(핀) · preacher 프리처 컬(핀) · inclcp 인클라인 체스트프레스(원판) · cplate 체스트프레스 — 누워서 미는(원판) · bench 플랫 벤치프레스대 · rack 스쿼트 랙(안전바) · pecdeck 펙덱(핀). EN captions: Incline bench press rack · Squat machine (plates · type unknown) · T-bar row (chest-supported · plates) · Leg-raise station (top = dip handles) · Seated crunch machine · Leg extension (pin) · Preacher curl (pin) · Incline chest press (plates) · Chest press — lie down (plates) · Flat bench press rack · Squat rack (safety bars) · Pec deck (pin).

Read each image's real width/height from the file for `w`/`h`.

## 10. QA before you commit

- `node --check moves.js` passes.
- If a headless browser is available (e.g. Playwright/Chromium), open `index.html` and `moves-demo.html` at 390×844 and 1280×800, light and dark: no console errors, no horizontal page scroll, sheets open/close, every animation plays and looks correct, reduced-motion shows two still frames. If no browser is available, say so in the summary.
- Every ID in §7 renders a sheet in both languages with exactly 3 points each.

## 11. Git

Branch `plan-v2` → commit (e.g. "Gym plan v2: new weekly split + motion sheets") → push the branch. Do not touch `main`. Finish with a short summary: files changed, anything you were unsure about, and what you could not test.
