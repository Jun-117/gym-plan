/* moves.js — exercise library + sheet renderer for the gym plan pages.
   Plain ES5, no dependencies. Exposes window.MOVES:
     ids()                  all exercise IDs
     name(id, lang)         "en" | "ko"
     renderSheet(id, opts)  HTML string for a sheet body
     animate(rootEl)        starts every animation inside rootEl, returns stop()
   opts = { lang, photos: { key: { src, w, h } }, alts: [{ id, note }], busy }
     alts  — optional; replaces the library's default alternatives ([] = none)
     note  — string or { en, ko }
     busy  — optional extra line under the alternatives heading (string or { en, ko })
   Extras for the QA page: cats(), cat(id), catName(key, lang). */
(function () {
  "use strict";

  // ======================================================================
  // 1. Text tables
  // ======================================================================

  var UI = {
    en: {
      main: "Main", also: "Also", busy: "If it’s busy", next: "Next step",
      moves: "How it moves", muscles: "Muscles", points: "Key points", gym: "At our gym",
      start: "1 Start", end: "2 End", front: "Front", back: "Back",
      anim: "animation", still: "start and end"
    },
    ko: {
      main: "주로", also: "같이", busy: "자리 차면 — 대체", next: "다음 단계",
      moves: "동작", muscles: "쓰는 근육", points: "핵심 포인트", gym: "우리 헬스장",
      start: "1 시작", end: "2 끝", front: "앞", back: "뒤",
      anim: "애니메이션", still: "시작과 끝"
    }
  };

  var MUS = {
    delts_front: ["Front shoulders", "앞어깨"],
    delts_side: ["Side shoulders", "옆어깨"],
    delts_rear: ["Rear shoulders", "뒤어깨"],
    chest: ["Chest", "가슴"],
    biceps: ["Front of arms", "팔 앞(이두)"],
    triceps: ["Back of arms", "팔 뒤(삼두)"],
    forearms: ["Forearms", "전완"],
    abs: ["Abs", "복근"],
    obliques: ["Sides of waist", "옆구리"],
    traps: ["Upper traps", "승모"],
    lats: ["Lats (back width)", "광배(등 넓이)"],
    upper_back: ["Middle of back", "등 가운데"],
    lower_back: ["Lower back", "허리"],
    glutes: ["Glutes", "엉덩이"],
    glute_med: ["Side glutes", "엉덩이 옆"],
    quads: ["Front thighs", "앞벅지"],
    hamstrings: ["Back thighs", "뒷벅지"],
    adductors: ["Inner thighs", "안쪽 허벅지"],
    calves: ["Calves", "종아리"],
    hip_flexors: ["Front of hips", "고관절 앞"]
  };

  // Photo captions by photo key. The page supplies src/w/h for the keys it has.
  var CAPS = {
    tread: ["Treadmill (left) · stair climber (right)", "러닝머신(왼쪽) · 천국의 계단(오른쪽)"],
    ellip: ["Ellipticals · spin bike (right)", "일립티컬 · 스핀바이크(오른쪽)"],
    legpress: ["45° leg press (plates)", "45° 레그프레스(원판)"],
    legcurl: ["Lying leg curl (plates)", "엎드려서 하는 레그컬(원판)"],
    db: ["Dumbbell rack · benches", "덤벨 랙 · 벤치"],
    abduct: ["Outer / inner thigh machine (pin)", "허벅지 바깥쪽·안쪽 머신(핀)"],
    latpd: ["Lat pulldown (pin)", "랫풀다운(핀)"],
    lever1: ["Lever pulldown (plates)", "레버식 풀다운(원판)"],
    lever2: ["Lever pulldown (plates)", "레버식 풀다운(원판)"],
    srow: ["Seated cable row (pin)", "시티드 케이블 로우(핀)"],
    csrow: ["Chest-supported row (plates)", "가슴 받치는 로우(원판)"],
    htm: ["Hip thrust machine (plates)", "힙쓰러스트 머신(원판)"],
    smith: ["Smith machine — the bar pad is the black tube on the floor, bottom left", "스미스 머신 — 바벨 패드 = 왼쪽 아래 바닥의 검은 원통"],
    cpin: ["Chest press — lie down and push (pin · red bench)", "체스트프레스 — 누워서 미는(핀 · 빨간 벤치)"],
    cable: ["Cable tower — rope and handles · pull-up bar on top", "케이블 크로스오버 — 로프·손잡이 · 맨 위 풀업바"],
    shpress: ["Shoulder press machine (plates)", "숄더프레스 머신(원판)"],
    sidem: ["Standing side raise machine (pin · guess)", "서서 하는 사이드 레이즈 머신(핀 🟡)"],
    backext: ["45° back extension (red)", "45° 백익스텐션(빨간 기구)"],
    kickback: ["Glute kickback machine (plates)", "글루트 킥백 머신(원판)"],
    incline: ["Incline bench press rack", "인클라인 벤치프레스대"],
    squatm: ["Squat machine (plates · type unknown)", "스쿼트 머신(원판·종류 🔴)"],
    tbar: ["T-bar row (chest-supported · plates)", "티바로우(가슴 받치는·원판)"],
    station: ["Leg-raise station (top = dip handles)", "레그레이즈 스테이션(위쪽 = 딥스 손잡이)"],
    crunchm: ["Seated crunch machine", "앉아서 하는 크런치 머신"],
    legext: ["Leg extension (pin)", "레그익스텐션(핀)"],
    preacher: ["Preacher curl (pin)", "프리처 컬(핀)"],
    inclcp: ["Incline chest press (plates)", "인클라인 체스트프레스(원판)"],
    cplate: ["Chest press — lie down (plates)", "체스트프레스 — 누워서 미는(원판)"],
    bench: ["Flat bench press rack", "플랫 벤치프레스대"],
    rack: ["Squat rack (safety bars)", "스쿼트 랙(안전바)"],
    pecdeck: ["Pec deck (pin)", "펙덱(핀)"]
  };

  var CATS = [
    ["cardio", "Cardio", "유산소"],
    ["glutes", "Glutes & hips", "엉덩이·고관절"],
    ["legs", "Legs", "하체"],
    ["back", "Back", "등"],
    ["chest", "Chest", "가슴"],
    ["shoulders", "Shoulders", "어깨"],
    ["arms", "Arms", "팔"],
    ["core", "Core", "코어"]
  ];

  // ======================================================================
  // 2. Exercise data
  //    X(id, cat, view, nameEn, nameKo, equipEn, equipKo, photos, P, S, alts, pointsEn, pointsKo)
  //    photos / P / S / alts are space-separated lists ("" = none).
  // ======================================================================

  var EX = {}, ORDER = [];
  function list(s) { return s ? s.split(" ") : []; }
  function X(id, cat, view, en, ko, eqEn, eqKo, photos, P, S, alts, pe, pk) {
    EX[id] = {
      id: id, cat: cat, view: view, name: [en, ko], eq: [eqEn, eqKo],
      photos: list(photos), P: list(P), S: list(S),
      alts: list(alts).map(function (a) { return { id: a }; }), pts: [pe, pk]
    };
    ORDER.push(id);
  }

  // ---- cardio ----
  X("treadmill_walk", "cardio", "side", "Treadmill walk", "러닝머신 걷기", "Treadmill", "러닝머신", "tread",
    "quads glutes", "calves hamstrings", "elliptical spin_bike",
    ["Stand tall in the middle of the belt, eyes forward",
     "Walk with natural steps, heel first, arms swinging",
     "Don't hold the rails tight or lean on them"],
    ["벨트 가운데에 바르게 서고 앞을 본다",
     "뒤꿈치부터 딛고 팔을 자연스럽게 흔든다",
     "손잡이를 꽉 잡거나 기대지 않는다"]);
  X("incline_walk", "cardio", "side", "Incline walk", "경사 걷기", "Treadmill on an incline", "경사를 올린 러닝머신", "tread",
    "glutes calves", "quads hamstrings", "elliptical",
    ["Set the incline first, then start at a slow speed",
     "Lean slightly forward from the ankles, short steps",
     "Don't hang on the rails — it takes the work away from your legs"],
    ["경사를 먼저 맞추고 느린 속도로 시작한다",
     "발목부터 살짝 앞으로 기울이고 보폭은 짧게",
     "손잡이에 매달리지 않는다 — 다리 운동이 준다"]);
  X("stair_climber", "cardio", "side", "Stair climber", "천국의 계단", "Stair climber", "천국의 계단", "tread",
    "glutes quads", "calves hamstrings", "incline_walk elliptical",
    ["Stand tall, hands resting lightly on the rails",
     "Step with your whole foot and push through the heel",
     "Don't lean on the rails or bend over the console"],
    ["바르게 서고 손잡이는 가볍게 잡는다",
     "발 전체로 딛고 뒤꿈치로 밀어 올라간다",
     "손잡이에 기대거나 몸을 숙이지 않는다"]);
  X("elliptical", "cardio", "side", "Elliptical", "일립티컬", "Elliptical", "일립티컬", "ellip",
    "quads glutes", "hamstrings calves", "",
    ["Feet flat on the pedals, hands on the moving handles",
     "Push and pull the handles in a smooth, steady rhythm",
     "Stand tall — don't lean on the handles or the console"],
    ["발바닥을 페달에 붙이고 움직이는 손잡이를 잡는다",
     "일정한 리듬으로 손잡이를 밀고 당긴다",
     "허리를 펴고 손잡이나 화면에 기대지 않는다"]);
  X("spin_bike", "cardio", "side", "Spin bike", "스핀바이크", "Spin bike", "스핀바이크", "ellip",
    "quads", "glutes calves", "",
    ["Seat at hip height: knee slightly bent at the bottom",
     "Pedal in smooth circles, light grip on the handlebar",
     "Add a little resistance so you don't bounce on the seat"],
    ["안장은 골반 높이, 아래에서 무릎이 살짝 굽게",
     "부드럽게 원을 그리며 페달을 밟는다",
     "저항을 조금 걸어 엉덩이가 튀지 않게 한다"]);

  // ---- glutes & hips ----
  X("hip_thrust_bench", "glutes", "side", "Hip thrust (bench)", "힙 쓰러스트(벤치)",
    "Bench + barbell + bar pad (start with body weight)", "벤치 + 바벨 + 바 패드(맨몸으로 시작)", "smith",
    "glutes", "hamstrings adductors", "hip_thrust_machine",
    ["Bench edge under your shoulder blades, feet flat, shins vertical at the top",
     "Push through your heels and squeeze your glutes to lift your hips",
     "Keep ribs down and chin tucked — don't arch your lower back at the top"],
    ["날개뼈 아래를 벤치 모서리에, 발바닥은 바닥에",
     "뒤꿈치로 밀며 엉덩이를 조여 들어 올린다",
     "위에서 허리를 꺾지 말고 갈비뼈를 내린다"]);
  X("hip_thrust_machine", "glutes", "side", "Hip thrust machine", "힙쓰러스트 머신", "Plate-loaded machine", "원판 머신", "htm",
    "glutes", "hamstrings", "",
    ["Upper back on the back pad, hip pad across your hips, feet flat",
     "Push through your heels and squeeze your glutes to lift",
     "Stop at a straight line — don't arch your lower back at the top"],
    ["등 위쪽은 등 패드에, 골반 패드는 골반 위에",
     "뒤꿈치로 밀며 엉덩이를 조여 들어 올린다",
     "위에서 허리를 꺾지 말고 일직선에서 멈춘다"]);
  X("glute_bridge", "glutes", "side", "Glute bridge", "글루트 브릿지", "Mat", "매트", "",
    "glutes", "hamstrings", "glute_kickback_machine",
    ["Lie on your back, knees bent, feet flat near your hips",
     "Push through your heels until shoulders, hips and knees line up",
     "Squeeze your glutes at the top — don't arch your lower back"],
    ["누워서 무릎을 세우고 발은 엉덩이 가까이",
     "뒤꿈치로 밀어 어깨·골반·무릎을 일직선으로",
     "위에서 엉덩이를 조이고 허리는 꺾지 않는다"]);
  EX.glute_bridge.next = true;
  EX.glute_bridge.alts = [{ id: "glute_kickback_machine", note: { en: "When 15 reps feel easy", ko: "15회가 쉬워지면" } }];
  X("glute_kickback_machine", "glutes", "side", "Glute kickback machine", "글루트 킥백 머신",
    "Plate-loaded machine (chest pad, knee pad, foot plate)", "원판 머신(가슴 패드·무릎 패드·발판)", "kickback",
    "glutes", "hamstrings", "",
    ["Chest on the pad, one knee on the knee pad, other foot on the plate",
     "Push the plate back with your heel and squeeze your glute",
     "Move only at the hip — don't twist or arch your lower back"],
    ["가슴은 패드에, 한 무릎은 무릎 패드에, 발은 발판에",
     "뒤꿈치로 발판을 뒤로 밀며 엉덩이를 조인다",
     "골반만 움직이고 허리를 비틀거나 꺾지 않는다"]);
  X("hip_abduction", "glutes", "front", "Hip abduction", "힙 어브덕션", "Pin machine (outer/inner thigh)", "핀 머신(허벅지 바깥·안쪽)", "abduct",
    "glute_med", "glutes", "band_side_walk",
    ["Sit back against the pad, pads on the outside of your knees",
     "Push your knees out, pause, then let them come back slowly",
     "Don't let the weights slam — control the way back in"],
    ["등을 패드에 붙이고 패드는 무릎 바깥쪽에",
     "무릎을 바깥으로 밀고 잠깐 멈춘 뒤 천천히 모은다",
     "돌아올 때 무게가 쾅 부딪히지 않게 한다"]);
  X("band_side_walk", "glutes", "front", "Band side walk", "밴드 옆으로 걷기", "Big loop band", "큰 루프 밴드", "",
    "glute_med", "glutes quads", "",
    ["Band above your knees, feet hip-width, knees slightly bent",
     "Step sideways, then bring the other foot in — keep the band tight",
     "Keep your toes forward and don't let your knees cave in"],
    ["밴드는 무릎 위, 발은 골반 너비, 무릎은 살짝 굽힌다",
     "옆으로 한 발, 다른 발을 붙여도 밴드는 팽팽하게",
     "발끝은 앞으로, 무릎이 안으로 모이지 않게"]);
  X("back_extension", "glutes", "side", "45° back extension", "45° 백익스텐션", "45° back extension bench", "45° 백익스텐션 벤치", "backext",
    "lower_back glutes", "hamstrings", "glute_bridge",
    ["Hip bones just above the pad, heels under the foot pad",
     "Lower your upper body, then lift it with your glutes",
     "Stop when your body is in a straight line — don't over-arch"],
    ["골반뼈는 패드 바로 위, 뒤꿈치는 발 패드 밑에",
     "상체를 내렸다가 엉덩이 힘으로 올린다",
     "몸이 일직선이면 멈추고 허리를 더 젖히지 않는다"]);

  // ---- legs ----
  X("rdl_db", "legs", "side", "Romanian deadlift (dumbbells)", "RDL(덤벨)", "Dumbbells", "덤벨", "db",
    "hamstrings glutes", "lower_back forearms", "",
    ["Stand tall, dumbbells in front of your thighs, knees soft",
     "Push your hips back and slide the weights down your legs",
     "Keep your back flat — stop when the back of your thighs stretch"],
    ["바르게 서서 덤벨은 허벅지 앞, 무릎은 살짝 굽힌다",
     "등은 편 채로 엉덩이를 뒤로 뺀다",
     "등이 굽기 전, 뒷벅지가 당기면 멈춘다"]);
  X("rdl_barbell", "legs", "side", "Romanian deadlift (barbell)", "RDL(바벨)", "Barbell", "바벨", "",
    "hamstrings glutes", "lower_back forearms", "rdl_db",
    ["Hold the bar at hip height, hands just outside your legs",
     "Push your hips back and keep the bar close to your legs",
     "Keep your back flat — don't round it to reach lower"],
    ["바를 골반 높이에서 잡고 손은 다리 바로 바깥",
     "엉덩이를 뒤로 빼며 바를 다리에 붙여 내린다",
     "더 내리려고 등을 둥글게 말지 않는다"]);
  X("leg_press", "legs", "side", "Leg press", "레그프레스", "45° plate-loaded leg press", "45° 원판 레그프레스", "legpress",
    "quads glutes", "hamstrings adductors", "goblet_squat squat_machine",
    ["Back and hips flat on the pad, whole foot on the platform",
     "Lower until your knees bend to about 90°, then push through your heels",
     "Don't lock your knees at the top or let your hips lift off"],
    ["등과 엉덩이를 패드에 붙이고 발 전체를 발판에",
     "무릎이 90° 정도 굽을 때까지 내리고 뒤꿈치로 민다",
     "위에서 무릎을 잠그거나 엉덩이를 들지 않는다"]);
  X("leg_curl", "legs", "side", "Lying leg curl", "레그컬(엎드려서)",
    "Plate-loaded machine — first set with no plates", "원판 머신 — 첫 세트는 원판 없이", "legcurl",
    "hamstrings", "calves", "db_leg_curl",
    ["Lie face down, knees just off the bench, pad above your heels",
     "Curl your heels toward your glutes, then lower slowly",
     "Keep your hips pressed down — don't lift them to help"],
    ["엎드려서 무릎은 벤치 끝, 패드는 뒤꿈치 위에",
     "뒤꿈치를 엉덩이 쪽으로 당기고 천천히 내린다",
     "엉덩이를 들지 말고 벤치에 붙인다"]);
  X("db_leg_curl", "legs", "side", "Dumbbell leg curl", "덤벨 레그컬",
    "One dumbbell between the feet, lying on a bench", "벤치에 엎드려 두 발 사이에 덤벨 하나", "db",
    "hamstrings", "calves", "",
    ["Lie face down on a bench, one dumbbell held between your feet",
     "Curl your heels up toward your glutes, then lower slowly",
     "Use a light weight and squeeze it tight so it can't slip"],
    ["벤치에 엎드려 덤벨을 두 발 사이에 끼운다",
     "뒤꿈치를 엉덩이 쪽으로 올리고 천천히 내린다",
     "가벼운 무게로, 빠지지 않게 발로 꽉 잡는다"]);
  X("goblet_squat", "legs", "side", "Goblet squat", "고블릿 스쿼트", "One dumbbell held at the chest", "가슴에 덤벨 하나", "db",
    "quads glutes", "adductors abs", "",
    ["Hold one dumbbell at your chest, feet a bit wider than hips",
     "Sit down between your heels, then stand up by pushing the floor away",
     "Keep your chest up and your knees pointing over your toes"],
    ["덤벨 하나를 가슴에, 발은 골반보다 조금 넓게",
     "뒤꿈치 사이로 앉았다가 바닥을 밀며 일어난다",
     "가슴을 세우고 무릎은 발끝 방향으로"]);
  X("back_squat", "legs", "side", "Barbell back squat", "바벨 스쿼트", "Squat rack with safety bars", "안전바 있는 스쿼트 랙", "rack",
    "quads glutes", "adductors lower_back", "smith_squat squat_machine",
    ["Bar on your upper back, safety bars set just below your lowest point",
     "Push your hips back and down, then stand up through your whole foot",
     "Keep your chest up — knees follow your toes, heels stay down"],
    ["바는 등 위쪽에, 안전바는 앉은 높이 바로 아래",
     "엉덩이를 뒤로 빼며 앉았다가 발로 밀어 선다",
     "가슴을 세우고 무릎은 발끝 방향, 뒤꿈치는 붙인다"]);
  X("smith_squat", "legs", "side", "Smith machine squat", "스미스 스쿼트", "Smith machine", "스미스 머신", "smith",
    "quads glutes", "adductors", "",
    ["Bar on your upper back, feet slightly in front of the bar",
     "Sit down until your thighs are near parallel, then stand up",
     "Set the safety stops, and twist the bar to lock it when done"],
    ["바는 등 위쪽에, 발은 바보다 조금 앞에",
     "허벅지가 바닥과 비슷해질 때까지 앉았다 선다",
     "안전 고리를 맞추고 끝나면 바를 돌려 건다"]);
  X("squat_machine", "legs", "side", "Squat machine", "스쿼트 머신",
    "Plate-loaded squat machine (exact type unknown)", "원판 스쿼트 머신(정확한 종류 모름)", "squatm",
    "quads glutes", "adductors", "",
    ["Back on the pad, shoulders under the pads, feet flat on the plate",
     "Bend your knees and sit down, then push the plate away",
     "Don't lock your knees at the top — keep your heels down"],
    ["등은 패드에, 어깨는 패드 밑에, 발은 발판에",
     "무릎을 굽혀 앉았다가 발판을 밀어 일어난다",
     "위에서 무릎을 잠그지 말고 뒤꿈치를 붙인다"]);
  X("db_lunge", "legs", "side", "Dumbbell lunge", "덤벨 런지", "Dumbbells", "덤벨", "db",
    "quads glutes", "hamstrings adductors", "",
    ["Dumbbells at your sides, one foot forward, one foot back",
     "Lower your back knee toward the floor, then push back up",
     "Front knee points over the toes — don't let it fall inward"],
    ["덤벨은 양옆에, 한 발은 앞, 한 발은 뒤",
     "뒷무릎을 바닥 쪽으로 내렸다가 밀어 올라온다",
     "앞무릎은 발끝 방향, 안쪽으로 무너지지 않게"]);
  X("leg_extension", "legs", "side", "Leg extension", "레그익스텐션", "Pin machine", "핀 머신", "legext",
    "quads", "", "",
    ["Knees in line with the machine's pivot, pad on your lower shins",
     "Straighten your legs, pause, then lower slowly",
     "Hold the handles and keep your hips on the seat"],
    ["무릎을 기계 축에 맞추고 패드는 정강이 아래쪽",
     "다리를 펴고 잠깐 멈춘 뒤 천천히 내린다",
     "손잡이를 잡고 엉덩이를 의자에 붙인다"]);

  // ---- back ----
  X("lat_pulldown", "back", "side", "Lat pulldown", "랫풀다운", "Pin machine", "핀 머신", "latpd",
    "lats", "biceps upper_back delts_rear", "lever_pulldown pull_up",
    ["Thighs locked under the pad, hands a bit wider than shoulders",
     "Pull the bar to your upper chest, elbows down toward your ribs",
     "Don't swing back or pull the bar behind your neck"],
    ["허벅지를 패드에 고정, 손은 어깨보다 조금 넓게",
     "팔꿈치를 옆구리로 내리며 바를 윗가슴까지",
     "몸을 뒤로 젖히거나 목 뒤로 당기지 않는다"]);
  X("lever_pulldown", "back", "side", "Lever pulldown", "레버식 풀다운",
    "Plate-loaded, one arm at a time possible", "원판식, 한 팔씩도 가능", "lever1 lever2",
    "lats", "biceps upper_back", "",
    ["Thighs under the pad, grip the handles above your head",
     "Pull the handles down to your shoulders, elbows to your sides",
     "Don't jerk or lean far back — control the way up"],
    ["허벅지를 패드 밑에, 머리 위 손잡이를 잡는다",
     "팔꿈치를 옆구리로 내리며 어깨까지 당긴다",
     "반동이나 크게 젖히기 없이 천천히 올린다"]);
  X("pull_up", "back", "side", "Pull-up", "풀업",
    "Bar on top of the cable tower (full body weight)", "케이블 타워 맨 위 바(체중 전부)", "cable",
    "lats", "biceps upper_back", "",
    ["Hang from the bar, hands a bit wider than shoulders",
     "Pull your chest up toward the bar, elbows down to your sides",
     "No swinging — lower all the way down slowly"],
    ["바에 매달려 손은 어깨보다 조금 넓게",
     "팔꿈치를 옆구리로 당기며 가슴을 바 쪽으로",
     "몸을 흔들지 말고 끝까지 천천히 내려온다"]);
  X("seated_row", "back", "side", "Seated cable row", "시티드 로우", "Pin machine", "핀 머신", "srow",
    "upper_back lats", "biceps delts_rear", "chest_supported_row tbar_row",
    ["Sit tall, feet on the foot plate, knees slightly bent",
     "Pull the handle to your belly and squeeze your shoulder blades",
     "Don't rock back and forth — your body stays still"],
    ["허리를 펴고 앉아 발은 발판에, 무릎은 살짝 굽힌다",
     "손잡이를 배로 당기며 날개뼈를 모은다",
     "몸을 앞뒤로 흔들지 않는다"]);
  X("chest_supported_row", "back", "side", "Chest-supported row", "가슴 받치는 로우",
    "Plate-loaded, one arm at a time possible", "원판식, 한 팔씩도 가능", "csrow",
    "upper_back lats", "biceps delts_rear", "",
    ["Chest against the pad, reach forward to the handles",
     "Pull your elbows back and squeeze your shoulder blades",
     "Keep your chest on the pad — don't lift it to swing"],
    ["가슴을 패드에 대고 손잡이를 잡는다",
     "팔꿈치를 뒤로 당기며 날개뼈를 모은다",
     "반동 주려고 가슴을 패드에서 떼지 않는다"]);
  X("tbar_row", "back", "side", "Chest-supported T-bar row", "티바로우", "Plate-loaded", "원판식", "tbar",
    "upper_back lats", "biceps delts_rear", "",
    ["Feet on the plate, chest on the pad, grip the handles",
     "Pull the handles toward your chest and squeeze your back",
     "Keep your chest on the pad and lower slowly"],
    ["발은 발판에, 가슴은 패드에, 손잡이를 잡는다",
     "손잡이를 가슴 쪽으로 당기며 등을 조인다",
     "가슴을 패드에 붙이고 천천히 내린다"]);
  X("one_arm_db_row", "back", "side", "One-arm dumbbell row", "원암 덤벨로우", "Dumbbell + bench", "덤벨 + 벤치", "db",
    "lats upper_back", "biceps delts_rear", "chest_supported_row",
    ["One knee and hand on the bench, back flat, other foot down",
     "Pull the dumbbell up to your hip, elbow close to your body",
     "Don't twist your body to lift — keep your shoulders level"],
    ["한 무릎과 손은 벤치에, 등은 편다",
     "덤벨을 골반 쪽으로 당기고 팔꿈치는 몸에 붙인다",
     "몸을 비틀어 들지 말고 어깨를 수평으로"]);
  X("face_pull", "back", "side", "Face pull", "페이스풀", "Cable + rope at face height", "케이블 + 얼굴 높이 로프", "cable",
    "delts_rear upper_back", "traps", "band_pull_apart reverse_pec_deck",
    ["Rope at face height, step back until your arms are straight",
     "Pull the rope toward your face, hands apart, elbows high",
     "Stand tall — don't lean back to pull"],
    ["로프는 얼굴 높이, 팔이 펴질 만큼 뒤로 선다",
     "손을 벌리며 로프를 얼굴로, 팔꿈치는 높게",
     "몸을 뒤로 젖혀 당기지 않는다"]);
  X("band_pull_apart", "back", "front", "Band pull-apart", "밴드 풀어파트", "Big loop band", "큰 루프 밴드", "",
    "delts_rear upper_back", "traps", "",
    ["Hold the band at chest height, arms straight in front",
     "Pull the band apart until it touches your chest",
     "Keep your shoulders down — don't shrug"],
    ["밴드를 가슴 높이에서 잡고 팔은 앞으로 편다",
     "밴드가 가슴에 닿을 때까지 양옆으로 벌린다",
     "어깨를 으쓱 올리지 않는다"]);
  X("reverse_pec_deck", "back", "front", "Reverse pec deck", "리버스 펙덱",
    "Pec deck, sitting facing the pad (may not work on this machine — unconfirmed)",
    "펙덱, 패드를 보고 앉기(이 기계로 되는지 미확인)", "pecdeck",
    "delts_rear", "upper_back", "",
    ["Sit facing the pad, chest on it, handles at shoulder height",
     "Open your arms out to the sides and squeeze your upper back",
     "Keep a small bend in your elbows and come back slowly"],
    ["패드를 보고 앉아 가슴을 대고, 손잡이는 어깨 높이",
     "팔을 양옆으로 벌리며 등 위쪽을 조인다",
     "팔꿈치를 살짝 굽힌 채 천천히 돌아온다"]);

  // ---- arms ----
  X("db_curl", "arms", "side", "Dumbbell curl", "덤벨컬", "Dumbbells", "덤벨", "db",
    "biceps", "forearms", "preacher_curl barbell_curl",
    ["Stand tall, dumbbells at your sides, palms forward",
     "Curl the weights up, elbows staying at your sides",
     "Don't swing your body — lower the weights slowly"],
    ["바르게 서서 덤벨은 양옆, 손바닥은 앞으로",
     "팔꿈치를 옆구리에 붙인 채 들어 올린다",
     "몸을 흔들지 말고 천천히 내린다"]);
  X("preacher_curl", "arms", "side", "Preacher curl machine", "프리처 컬", "Pin machine", "핀 머신", "preacher",
    "biceps", "forearms", "",
    ["Set the seat so your upper arms lie flat on the pad",
     "Curl the handle up, then lower until your arms are nearly straight",
     "Lower slowly — don't let the weight drop at the bottom"],
    ["위팔이 패드에 딱 붙도록 의자 높이를 맞춘다",
     "손잡이를 올렸다가 팔이 거의 펴질 때까지 내린다",
     "아래에서 무게를 툭 떨어뜨리지 않는다"]);
  X("barbell_curl", "arms", "side", "Barbell curl", "바벨컬", "Fixed-weight barbell from the rack", "랙에 있는 고정 무게 바벨", "db",
    "biceps", "forearms", "",
    ["Stand tall, hold the bar shoulder-width, palms up",
     "Curl the bar up, elbows staying at your sides",
     "Don't lean back or swing the bar up"],
    ["바르게 서서 바를 어깨 너비로, 손바닥은 위로",
     "팔꿈치를 옆구리에 붙인 채 바를 올린다",
     "몸을 뒤로 젖히거나 반동으로 올리지 않는다"]);
  X("cable_pushdown", "arms", "side", "Cable pushdown", "케이블 푸쉬다운", "Cable + rope", "케이블 + 로프", "cable",
    "triceps", "forearms", "db_skull_crusher dips",
    ["Rope on a high pulley, elbows tucked in at your sides",
     "Push the rope down until your arms are straight",
     "Keep your elbows still — don't lean over the rope"],
    ["로프는 위 도르래에, 팔꿈치는 옆구리에 붙인다",
     "팔이 펴질 때까지 로프를 아래로 민다",
     "팔꿈치를 고정하고 몸을 숙여 누르지 않는다"]);
  X("db_skull_crusher", "arms", "side", "Dumbbell skull crusher", "덤벨 스컬크러셔", "Dumbbells + flat bench", "덤벨 + 평벤치", "db",
    "triceps", "", "",
    ["Lie on a bench, dumbbells over your shoulders, arms straight",
     "Bend only your elbows to lower the weights beside your head",
     "Use a light weight and keep your upper arms still"],
    ["벤치에 누워 덤벨을 어깨 위로 편다",
     "팔꿈치만 굽혀 덤벨을 머리 옆으로 내린다",
     "가벼운 무게로, 위팔은 움직이지 않는다"]);
  X("dips", "arms", "side", "Dips", "딥스",
    "Dip handles on the leg-raise station (full body weight)", "레그레이즈 스테이션의 딥스 손잡이(체중 전부)", "station",
    "triceps chest", "delts_front", "",
    ["Hands on the handles, arms straight, shoulders down",
     "Bend your elbows to lower, then push back up",
     "Go only as low as feels OK for your shoulders"],
    ["손잡이를 잡고 팔을 펴고 어깨는 내린다",
     "팔꿈치를 굽혀 내려갔다가 밀어 올라온다",
     "어깨가 편한 깊이까지만 내려간다"]);

  // ---- chest ----
  X("chest_press_pin", "chest", "side", "Chest press (lie down, pin)", "체스트프레스(누워서·핀)",
    "Pin machine with a red bench — top plate 5 kg", "빨간 벤치 핀 머신 — 맨 위 판 5 kg", "cpin",
    "chest", "triceps delts_front", "db_bench",
    ["Lie on the bench with the handles in line with your chest",
     "Push the handles up until your arms are straight, then lower",
     "Keep your back and feet down — don't lock your elbows hard"],
    ["벤치에 누워 손잡이를 가슴 선에 맞춘다",
     "팔이 펴질 때까지 밀었다가 천천히 내린다",
     "등과 발은 붙이고 팔꿈치를 세게 잠그지 않는다"]);
  X("chest_press_plate", "chest", "side", "Chest press (lie down, plates)", "체스트프레스(누워서·원판)",
    "Plate-loaded — lever adds weight (guess)", "원판식 — 레버 자체 무게 있음(추정)", "cplate",
    "chest", "triceps delts_front", "",
    ["Lie on the bench with the handles in line with your chest",
     "Push up until your arms are straight, then lower slowly",
     "Try it with no plates first — the lever may be heavy on its own"],
    ["벤치에 누워 손잡이를 가슴 선에 맞춘다",
     "팔이 펴질 때까지 밀고 천천히 내린다",
     "원판 없이 먼저 — 레버만으로 무거울 수 있다"]);
  X("db_bench", "chest", "side", "Dumbbell bench press", "덤벨 벤치", "Dumbbells + flat bench", "덤벨 + 평벤치", "db",
    "chest", "triceps delts_front", "",
    ["Lie on the bench, dumbbells over your chest, feet flat",
     "Lower the weights to chest level, then press them up",
     "Keep your elbows a bit below shoulder line — not straight out"],
    ["벤치에 누워 덤벨은 가슴 위, 발은 바닥에",
     "덤벨을 가슴 높이까지 내렸다가 밀어 올린다",
     "팔꿈치를 어깨와 일직선으로 벌리지 않는다"]);
  X("bench_press", "chest", "side", "Barbell bench press", "벤치프레스", "Flat bench press rack", "플랫 벤치프레스대", "bench",
    "chest", "triceps delts_front", "smith_bench chest_press_plate db_bench",
    ["Eyes under the bar, feet flat, shoulder blades pulled back",
     "Lower the bar to your mid chest, then press it up",
     "Use a spotter or safety bars — never bounce the bar off your chest"],
    ["눈은 바 아래, 발은 바닥, 날개뼈는 모은다",
     "바를 가슴 가운데로 내렸다가 밀어 올린다",
     "보조나 안전바를 쓰고 가슴에 튕기지 않는다"]);
  X("smith_bench", "chest", "side", "Smith machine bench press", "스미스 벤치", "Smith machine + flat bench", "스미스 머신 + 평벤치", "smith",
    "chest", "triceps delts_front", "",
    ["Place the bench so the bar comes down to your mid chest",
     "Unhook the bar, lower it to your chest, then press up",
     "Set the safety stops — twist the bar to lock it when done"],
    ["바가 가슴 가운데로 내려오게 벤치를 놓는다",
     "바를 풀고 가슴까지 내렸다가 밀어 올린다",
     "안전 고리를 맞추고 끝나면 바를 돌려 건다"]);
  X("incline_bench", "chest", "side", "Incline barbell bench press", "인클라인 벤치", "Incline bench press rack", "인클라인 벤치프레스대", "incline",
    "chest delts_front", "triceps", "incline_chest_press db_incline",
    ["Back on the incline bench, eyes under the bar, feet flat",
     "Lower the bar to your upper chest, then press it up",
     "Use a spotter or safety bars — don't bounce the bar"],
    ["경사 벤치에 등을 대고 눈은 바 아래, 발은 바닥",
     "바를 윗가슴으로 내렸다가 밀어 올린다",
     "보조나 안전바를 쓰고 바를 튕기지 않는다"]);
  X("incline_chest_press", "chest", "side", "Incline chest press machine", "인클라인 체스트프레스 머신", "Plate-loaded", "원판식", "inclcp",
    "chest delts_front", "triceps", "",
    ["Sit back on the pad, handles in line with your upper chest",
     "Push the handles up until your arms are straight",
     "Keep your back on the pad and lower slowly"],
    ["등을 패드에 대고 손잡이는 윗가슴 선에",
     "팔이 펴질 때까지 손잡이를 밀어 올린다",
     "등을 패드에 붙이고 천천히 내린다"]);
  X("db_incline", "chest", "side", "Dumbbell incline press", "덤벨 인클라인", "Dumbbells + adjustable bench", "덤벨 + 각도 조절 벤치", "db",
    "chest delts_front", "triceps", "",
    ["Bench at a low incline, dumbbells over your upper chest",
     "Lower the weights to chest level, then press them up",
     "Keep your feet flat and lower the weights under control"],
    ["낮은 경사 벤치, 덤벨은 윗가슴 위",
     "덤벨을 가슴 높이까지 내렸다가 밀어 올린다",
     "발은 바닥에, 덤벨은 천천히 내린다"]);

  // ---- shoulders ----
  X("db_shoulder_press", "shoulders", "front", "Dumbbell shoulder press (seated)", "덤벨 숄더프레스(앉아서)",
    "Dumbbells + adjustable bench", "덤벨 + 각도 조절 벤치", "db",
    "delts_front delts_side", "triceps traps", "shoulder_press_machine smith_shoulder_press",
    ["Sit with your back on the bench, dumbbells at shoulder height",
     "Press the weights up until your arms are straight",
     "Keep your ribs down — don't arch your lower back"],
    ["등을 벤치에 대고 덤벨은 어깨 높이",
     "팔이 펴질 때까지 덤벨을 밀어 올린다",
     "갈비뼈를 내리고 허리를 꺾지 않는다"]);
  X("shoulder_press_machine", "shoulders", "side", "Shoulder press machine", "숄더프레스 머신",
    "Plate-loaded — lever adds weight (guess)", "원판식 — 레버 자체 무게 있음(추정)", "shpress",
    "delts_front", "triceps delts_side", "",
    ["Set the seat so the handles start at shoulder height",
     "Press up until your arms are straight, then lower slowly",
     "Keep your back on the pad — try it with no plates first"],
    ["손잡이가 어깨 높이에서 시작하게 의자를 맞춘다",
     "팔이 펴질 때까지 밀고 천천히 내린다",
     "등은 패드에, 원판 없이 먼저 해 본다"]);
  X("smith_shoulder_press", "shoulders", "side", "Smith machine shoulder press", "스미스 숄더프레스",
    "Smith machine + adjustable bench", "스미스 머신 + 각도 조절 벤치", "smith",
    "delts_front", "triceps delts_side", "",
    ["Bench upright, bar just in front of your face",
     "Press the bar up until your arms are straight, then lower to your chin",
     "Set the safety stops and keep your back on the bench"],
    ["벤치를 세우고 바는 얼굴 바로 앞에",
     "팔이 펴질 때까지 밀고 턱 높이까지 내린다",
     "안전 고리를 맞추고 등은 벤치에 붙인다"]);
  X("lateral_raise_db", "shoulders", "front", "Dumbbell lateral raise", "덤벨 사이드 레이즈",
    "Dumbbells (2.5 → 5 → 7.5 kg; no 3–4 kg)", "덤벨(2.5 → 5 → 7.5 kg, 3–4 kg 없음)", "db",
    "delts_side", "traps delts_front", "side_raise_machine cable_lateral_raise",
    ["Stand tall, dumbbells at your sides, elbows slightly bent",
     "Raise your arms out to the sides, up to shoulder height",
     "Don't swing or shrug — lower the weights slowly"],
    ["바르게 서서 덤벨은 양옆, 팔꿈치는 살짝 굽힌다",
     "팔을 옆으로 어깨 높이까지 올린다",
     "반동이나 어깨 으쓱 없이 천천히 내린다"]);
  X("side_raise_machine", "shoulders", "front", "Side raise machine (standing)", "서서 하는 사이드 레이즈 머신",
    "Pin machine (likely · not confirmed)", "핀 머신(추정 · 미확인)", "sidem",
    "delts_side", "traps", "",
    ["Shoulders in line with the machine's pivots, pads on your arms",
     "Lift your arms out to the sides, up to shoulder height",
     "Don't shrug — lower slowly under control"],
    ["어깨를 기계 축에 맞추고 패드는 팔 바깥에",
     "팔을 옆으로 어깨 높이까지 올린다",
     "어깨를 으쓱하지 말고 천천히 내린다"]);
  X("cable_lateral_raise", "shoulders", "front", "Cable lateral raise (one arm)", "케이블 사이드 레이즈(한 팔)",
    "Cable + D-handle", "케이블 + D 손잡이", "cable",
    "delts_side", "traps", "",
    ["Stand side-on to a low pulley, handle in your far hand",
     "Raise your arm out to the side, up to shoulder height",
     "Keep your body still — don't lean away to lift"],
    ["낮은 도르래 옆에 서서 먼 쪽 손으로 잡는다",
     "팔을 옆으로 어깨 높이까지 올린다",
     "몸을 옆으로 기울여 들지 않는다"]);

  // ---- core ----
  X("plank", "core", "side", "Plank", "플랭크", "Mat", "매트", "",
    "abs", "obliques glutes delts_front", "",
    ["Elbows under your shoulders, forearms on the mat",
     "Lift your knees and hold a straight line from head to heels",
     "Don't let your hips sag or stick up — keep breathing"],
    ["팔꿈치는 어깨 밑, 팔뚝은 매트에",
     "무릎을 들고 머리부터 뒤꿈치까지 일직선",
     "엉덩이가 처지거나 솟지 않게, 숨은 쉰다"]);
  X("side_plank", "core", "front", "Side plank", "사이드 플랭크", "Mat", "매트", "",
    "obliques", "glute_med abs", "",
    ["Lie on your side, elbow under your shoulder, legs stacked",
     "Lift your hips until your body is a straight line",
     "Don't let your hips drop — bend your knees to make it easier"],
    ["옆으로 누워 팔꿈치는 어깨 밑, 다리는 포갠다",
     "몸이 일직선이 될 때까지 골반을 든다",
     "골반이 처지지 않게, 힘들면 무릎을 굽힌다"]);
  X("crunch_mat", "core", "side", "Crunch", "크런치(매트)", "Mat", "매트", "",
    "abs", "", "",
    ["Lie on your back, knees bent, arms crossed on your chest",
     "Curl your shoulders off the mat, then lower slowly",
     "Don't pull your head — keep a fist of space under your chin"],
    ["누워서 무릎을 세우고 팔은 가슴에 모은다",
     "어깨를 매트에서 말아 올렸다가 천천히 내린다",
     "머리를 당기지 말고 턱 밑에 주먹 하나 공간"]);
  X("crunch_machine", "core", "side", "Seated crunch machine", "크런치 머신",
    "Machine where the seat and back fold toward each other", "의자와 등받이가 서로 접히는 머신", "crunchm",
    "abs", "hip_flexors", "crunch_mat",
    ["Sit with your back on the pad, feet under the foot pads",
     "Curl your chest toward your hips, then return slowly",
     "Use your abs, not your arms — start with a light weight"],
    ["등을 패드에 대고 발은 발 패드 밑에",
     "가슴을 골반 쪽으로 말았다가 천천히 돌아온다",
     "팔 말고 배 힘으로, 가벼운 무게부터"]);
  X("hanging_knee_raise", "core", "side", "Hanging knee raise", "행잉 니레이즈", "Leg-raise station", "레그레이즈 스테이션", "station",
    "abs hip_flexors", "forearms", "crunch_machine crunch_mat",
    ["Back on the pad, forearms on the arm pads, legs hanging",
     "Lift your knees up to hip height, then lower slowly",
     "Don't swing your legs — control the way down"],
    ["등은 패드에, 팔뚝은 팔 패드에, 다리는 늘어뜨린다",
     "무릎을 골반 높이까지 올렸다가 천천히 내린다",
     "다리를 흔들지 말고 내릴 때도 천천히"]);
  X("dead_bug", "core", "side", "Dead bug", "데드버그", "Mat", "매트", "",
    "abs", "hip_flexors", "",
    ["Lie on your back, arms up, knees bent over your hips",
     "Lower one arm and the opposite leg, then switch sides",
     "Keep your lower back pressed to the mat the whole time"],
    ["누워서 팔은 위로, 무릎은 골반 위로 굽힌다",
     "한 팔과 반대쪽 다리를 내렸다가 바꾼다",
     "허리는 처음부터 끝까지 매트에 붙인다"]);
  X("mountain_climber", "core", "side", "Mountain climber", "마운틴 클라이머", "Mat", "매트", "",
    "abs hip_flexors", "delts_front quads", "",
    ["Hands under your shoulders, body in a straight line",
     "Drive one knee toward your chest, then switch legs",
     "Keep your hips low — go slow and steady at first"],
    ["손은 어깨 밑, 몸은 일직선",
     "한 무릎을 가슴 쪽으로 당기고 다리를 바꾼다",
     "엉덩이를 들지 말고 처음엔 천천히"]);

  // ======================================================================
  // 3. Stick-figure rig
  //    viewBox 0 0 160 150 · ground y = 140 · y grows downward.
  //    Angles in degrees: 0 = right, 90 = down, -90 = up. Side view faces right.
  //    Pose: { x, y = hip (side) or pelvis centre (front), t = torso angle (hip → shoulder),
  //            hd = head tilt, h = [hand, hand], f = [foot, foot], ft = foot angles }
  //    Side view: index 0 = near (dark), 1 = far (light); one entry → both the same.
  //    Front view: index 0 = viewer's left, 1 = viewer's right; one entry = right side, mirrored.
  //    Limb spec — the end point of a 2-bone limb, solved with IK each frame so limbs keep
  //    their length; or angles:
  //      P(x, y)  fixed point          S(dx, dy) offset from that side's shoulder
  //      R(dx, dy) offset from the hip / pelvis centre
  //      T(a, b)  shoulder + a along the torso + b to the front of the body
  //      A(u, l)  absolute angles of upper and lower segment
  //    o.k = [scale1, scale2] (foreshortening), o.b = bend side (+1 / -1).
  // ======================================================================

  var LEN = { torso: 40, ua: 23, fa: 22, th: 32, sh: 32, foot: 11, neck: 15, headR: 9 };
  var D2R = Math.PI / 180;
  function dir(a) { return [Math.cos(a * D2R), Math.sin(a * D2R)]; }
  function add(p, q, s) { if (s == null) s = 1; return [p[0] + q[0] * s, p[1] + q[1] * s]; }
  function mix(a, b, f) { return a + (b - a) * f; }
  function lerpP(a, b, f) { return [mix(a[0], b[0], f), mix(a[1], b[1], f)]; }
  function r1(n) { return Math.round(n * 10) / 10; }
  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  function L(m, v, o) { o = o || {}; return { m: m, v: v, k: o.k || null, b: o.b == null ? null : o.b }; }
  function P(x, y, o) { return L("p", [x, y], o); }
  function S(x, y, o) { return L("s", [x, y], o); }
  function R(x, y, o) { return L("r", [x, y], o); }
  function T(a, b, o) { return L("T", [a, b], o); }
  function A(u, l, o) { return L("a", [u, l], o); }

  function ik(A0, B, l1, l2, s) {
    var dx = B[0] - A0[0], dy = B[1] - A0[1], d = Math.sqrt(dx * dx + dy * dy);
    var base = Math.atan2(dy, dx);
    var mx = l1 + l2 - 0.01, mn = Math.abs(l1 - l2) + 0.01;
    if (d > mx) d = mx;
    if (d < mn) d = mn;
    var c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    if (c > 1) c = 1;
    if (c < -1) c = -1;
    var a = base + s * Math.acos(c);
    var J = [A0[0] + l1 * Math.cos(a), A0[1] + l1 * Math.sin(a)];
    var E = [A0[0] + d * Math.cos(base), A0[1] + d * Math.sin(base)];
    return [J, E];
  }

  function mirrorSpec(sp, cx) {
    var v = sp.v, nv;
    if (sp.m === "p") nv = [2 * cx - v[0], v[1]];
    else if (sp.m === "a") nv = [180 - v[0], 180 - v[1]];
    else if (sp.m === "T") nv = [v[0], -v[1]];
    else nv = [-v[0], v[1]];
    return { m: sp.m, v: nv, k: sp.k, b: sp.b == null ? null : -sp.b };
  }

  // Fill in defaults so every pose has both limbs, foot angles and a head tilt.
  function normPose(sc, p) {
    var front = sc.v === "front";
    function pair(arr, name) {
      if (!arr) throw new Error("pose missing " + name);
      if (arr.length === 2) return arr;
      return front ? [mirrorSpec(arr[0], p.x), arr[0]] : [arr[0], arr[0]];
    }
    var ft = p.ft == null ? (front ? [110, 70] : [8, 8]) : (typeof p.ft === "number" ? (front ? [180 - p.ft, p.ft] : [p.ft, p.ft]) : p.ft);
    return { x: p.x, y: p.y, t: p.t, hd: p.hd || 0, h: pair(p.h, "h"), f: pair(p.f, "f"), ft: ft };
  }

  function blendSpec(a, b, f) {
    var ka = a.k || [1, 1], kb = b.k || [1, 1];
    return { m: a.m, v: [mix(a.v[0], b.v[0], f), mix(a.v[1], b.v[1], f)], k: [mix(ka[0], kb[0], f), mix(ka[1], kb[1], f)], b: a.b };
  }
  function blend(a, b, f) {
    return {
      x: mix(a.x, b.x, f), y: mix(a.y, b.y, f), t: mix(a.t, b.t, f), hd: mix(a.hd, b.hd, f),
      h: [blendSpec(a.h[0], b.h[0], f), blendSpec(a.h[1], b.h[1], f)],
      f: [blendSpec(a.f[0], b.f[0], f), blendSpec(a.f[1], b.f[1], f)],
      ft: [mix(a.ft[0], b.ft[0], f), mix(a.ft[1], b.ft[1], f)]
    };
  }

  function limb(base, sp, l1, l2, bend, ctx, i) {
    var k = sp.k || [1, 1], L1 = l1 * k[0], L2 = l2 * k[1];
    var s = sp.b == null ? bend : sp.b;
    if (sp.m === "a") {
      var j = add(base, dir(sp.v[0]), L1);
      return [j, add(j, dir(sp.v[1]), L2)];
    }
    var tg;
    if (sp.m === "p") tg = sp.v;
    else if (sp.m === "s") tg = add(ctx.sh[i], sp.v);
    else if (sp.m === "r") tg = add(ctx.root, sp.v);
    else tg = add(add(ctx.sh[i], ctx.u, sp.v[0]), ctx.w, sp.v[1]);
    return ik(base, tg, L1, L2, s);
  }

  function solve(sc, p) {
    var J = { t: p.t, front: sc.v === "front" };
    var root = [p.x, p.y], u = dir(p.t), w = dir(p.t + 90);
    J.root = root; J.u = u; J.w = w;
    var eb = sc.eb == null ? (J.front ? -1 : 1) : sc.eb;
    var kb = sc.kb == null ? -1 : sc.kb;
    if (J.front) {
      var top = add(root, u, LEN.torso);
      J.top = top;
      J.sh = [add(top, w, -12), add(top, w, 12)];
      J.hp = [add(root, w, -7), add(root, w, 7)];
      J.head = add(top, dir(p.t + p.hd), 14);
    } else {
      var sh = add(root, u, LEN.torso);
      J.sh = [sh, sh];
      J.hp = [root, root];
      J.head = add(sh, dir(p.t + p.hd), LEN.neck);
    }
    J.e = []; J.wr = []; J.k = []; J.a = []; J.o = [];
    for (var i = 0; i < 2; i++) {
      var sgn = J.front && i === 0 ? -1 : 1;
      var arm = limb(J.sh[i], p.h[i], LEN.ua, LEN.fa, eb * sgn, J, i);
      var leg = limb(J.hp[i], p.f[i], LEN.th, LEN.sh, kb * sgn, J, i);
      J.e[i] = arm[0]; J.wr[i] = arm[1];
      J.k[i] = leg[0]; J.a[i] = leg[1];
      J.o[i] = add(leg[1], dir(p.ft[i]), J.front ? 6 : LEN.foot);
    }
    return J;
  }

  // ---- SVG helpers ----
  function pt(p) { return r1(p[0]) + "," + r1(p[1]); }
  function poly(pts, cls) { return '<polyline class="' + cls + '" points="' + pts.map(pt).join(" ") + '"/>'; }
  function ln(a, b, cls) { return '<line class="' + cls + '" x1="' + r1(a[0]) + '" y1="' + r1(a[1]) + '" x2="' + r1(b[0]) + '" y2="' + r1(b[1]) + '"/>'; }
  function circ(c, r, cls) { return '<circle class="' + cls + '" cx="' + r1(c[0]) + '" cy="' + r1(c[1]) + '" r="' + r + '"/>'; }
  function rect(x, y, w, h, cls, rx) { return '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 2 : rx) + '"/>'; }
  function rr(c, w, h, ang, cls, rx) {
    return '<rect class="' + cls + '" x="' + r1(-w / 2) + '" y="' + r1(-h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? Math.min(3, h / 2) : rx) +
      '" transform="translate(' + r1(c[0]) + " " + r1(c[1]) + ") rotate(" + r1(ang) + ')"/>';
  }
  function angOf(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R; }
  function unit(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1; return [dx / d, dy / d]; }

  // props
  var GROUND = ln([4, 140], [156, 140], "mv-gr");
  function mat(x1, x2) { return rect(x1, 137, x2 - x1, 3, "mv-mat", 1.5); }
  function m(x, y, w, h, rx) { return rect(x, y, w, h, "mv-m", rx); }
  function ml(a, b) { return ln(a, b, "mv-ml"); }
  function db(p) { return circ(p, 6, "mv-pl") + circ(p, 1.8, "mv-eqf"); }
  function dbAx(p, ang) { var d = dir(ang), a = add(p, d, -7), b = add(p, d, 7); return ln(a, b, "mv-eq") + circ(a, 4.2, "mv-pl") + circ(b, 4.2, "mv-pl"); }
  function bar(p, r) { return circ(p, r, "mv-pl") + circ(p, 2, "mv-eqf"); }
  function cable(a, b) { return ln(a, b, "mv-cb"); }
  function pulley(p) { return circ(p, 3, "mv-m"); }
  function rope(p, ang) { if (ang == null) ang = 90; return ln(p, add(p, dir(ang - 22), 8), "mv-rp") + ln(p, add(p, dir(ang + 22), 8), "mv-rp") + circ(p, 2, "mv-eqf"); }
  function grip(p, ang) { var d = dir(ang); return ln(add(p, d, -5), add(p, d, 5), "mv-eq"); }
  function lever(pivot, p, plateAt, r) {
    var s = ln(pivot, p, "mv-lv") + circ(pivot, 2.5, "mv-eqf");
    if (plateAt != null) s += bar(lerpP(pivot, p, plateAt), r || 10);
    return s;
  }
  function shinDir(J, i) { return angOf(J.k[i], J.a[i]); }

  // ======================================================================
  // 4. Scenes — one per exercise
  //    k: keyframes · loop: "cycle" for continuous cardio motion · bg/fg: static SVG
  //    pr(J): { b: behind the body, m: between torso and arms (front view), f: in front }
  // ======================================================================

  var SC = {};

  // ---- cardio ----
  function walkScene(incl) {
    // ankle height above the belt at x (the incline belt rises 0.14 per px toward the front)
    function fy(x) { return incl ? 137 - 0.14 * (x - 16) : 137; }
    var hy = incl ? 69 : 74, hy2 = incl ? 67 : 72, t = incl ? -82 : -86;
    var back = A(108, 84), fwd = A(70, 40), mid = A(90, 76);
    var lift = incl ? 8 : 9;
    var bg = incl
      ? '<polygon class="mv-m" points="16,140 144,122.1 144,127 16,145"/>' + ml([138, 127], [138, 140]) + ml([136, 123], [126, 52]) + m(112, 45, 24, 8) + ml([126, 70], [100, 74])
      : m(16, 137, 128, 5, 2.5) + ml([136, 138], [126, 62]) + m(112, 55, 24, 8) + ml([126, 80], [100, 82]);
    return {
      v: "side", loop: "cycle", T: 2.4, ground: true, bg: bg,
      k: [
        { x: 78, y: hy, t: t, f: [P(97, fy(97) + 1), P(61, fy(61) - 2)], ft: [-5 - (incl ? 8 : 0), 35], h: [back, fwd] },
        { x: 78, y: hy2, t: t, f: [P(80, fy(80)), P(79, fy(79) - lift)], ft: [8 - (incl ? 8 : 0), 45], h: [mid, mid] },
        { x: 78, y: hy, t: t, f: [P(61, fy(61) - 2), P(97, fy(97) + 1)], ft: [35, -5 - (incl ? 8 : 0)], h: [fwd, back] },
        { x: 78, y: hy2, t: t, f: [P(79, fy(79) - lift), P(80, fy(80))], ft: [45, 8 - (incl ? 8 : 0)], h: [mid, mid] }
      ]
    };
  }
  SC.treadmill_walk = walkScene(false);
  SC.incline_walk = walkScene(true);

  SC.stair_climber = {
    v: "side", loop: "cycle", T: 2.4,
    bg: m(46, 132, 40, 8, 1) + m(82, 116, 34, 24, 1) + m(112, 100, 30, 40, 1) + ml([92, 66], [134, 60]) + ml([134, 60], [140, 100]),
    k: [
      { x: 72, y: 70, t: -82, f: [P(98, 113), P(68, 129)], ft: [0, 0], h: [P(104, 64)] },
      { x: 72, y: 72, t: -82, f: [P(84, 121), P(90, 104)], ft: [0, 25], h: [P(104, 64)] },
      { x: 72, y: 70, t: -82, f: [P(68, 129), P(98, 113)], ft: [0, 0], h: [P(104, 64)] },
      { x: 72, y: 72, t: -82, f: [P(90, 104), P(84, 121)], ft: [25, 0], h: [P(104, 64)] }
    ]
  };

  SC.elliptical = {
    v: "side", loop: "cycle", T: 2.6,
    bg: ml([22, 138], [130, 138]) + circ([30, 122], 12, "mv-m") + ml([124, 138], [116, 48]) + m(104, 40, 22, 8),
    pr: function (J) {
      function pole(i) { var h = J.wr[i], pv = [116, 96], d = unit(h, pv); return ln(h, add(pv, d, 26), "mv-lv"); }
      function pedal(i) { var a = J.a[i]; return ln([30, 122], [a[0], a[1] + 4], "mv-lv") + ln([a[0] - 6, a[1] + 4], [a[0] + 10, a[1] + 4], "mv-eq"); }
      return { b: '<g opacity=".45">' + pole(1) + pedal(1) + "</g>", f: pedal(0) + pole(0) };
    },
    k: [
      { x: 76, y: 67, t: -88, f: [P(94, 122), P(62, 122)], ft: 2, h: [P(92, 56), P(104, 52)] },
      { x: 76, y: 66, t: -88, f: [P(78, 127), P(78, 117)], ft: 2, h: [P(98, 54), P(98, 54)] },
      { x: 76, y: 67, t: -88, f: [P(62, 122), P(94, 122)], ft: 2, h: [P(104, 52), P(92, 56)] },
      { x: 76, y: 66, t: -88, f: [P(78, 117), P(78, 127)], ft: 2, h: [P(98, 54), P(98, 54)] }
    ]
  };

  SC.spin_bike = (function () {
    var C = [92, 120], r = 13, k = [];
    for (var i = 0; i < 8; i++) {
      var a = i * 45, n = add(C, dir(a), r), f = add(C, dir(a + 180), r);
      k.push({ x: 68, y: 79, t: -55, hd: -25, f: [P(n[0], n[1]), P(f[0], f[1])], ft: 10, h: [P(120, 63)] });
    }
    return {
      v: "side", loop: "cycle", T: 2.4, k: k,
      bg: ml([56, 138], [132, 138]) + ml([72, 86], [84, 120]) + ml([84, 120], [116, 116]) + ml([84, 120], [70, 138]) + ml([116, 116], [124, 138]) +
        ml([114, 104], [113, 64]) + ml([113, 64], [124, 61]) + circ([116, 116], 15, "mv-m") + m(56, 82, 24, 5, 2.5),
      pr: function (J) {
        function crank(i) { return ln(C, J.a[i], "mv-lv") + ln(add(J.a[i], [-5, 0]), add(J.a[i], [5, 0]), "mv-eq"); }
        return { b: '<g opacity=".45">' + crank(1) + "</g>", f: crank(0) + circ(C, 3, "mv-eqf") };
      }
    };
  })();

  // ---- glutes ----
  var BRIDGE_K = [
    { x: 79, y: 127, t: 215, f: [P(118, 136)], h: [R(1, -10)] },
    { x: 86, y: 104, t: 180, hd: -15, f: [P(118, 136)], h: [R(1, -10)] }
  ];
  SC.hip_thrust_bench = {
    v: "side", eb: -1, k: BRIDGE_K,
    bg: m(8, 106, 40, 8) + ml([14, 114], [14, 140]) + ml([42, 114], [42, 140]),
    pr: function (J) { return { f: bar(J.wr[0], 12) + circ(J.wr[0], 5, "mv-pad") + circ(J.wr[0], 2, "mv-eqf") }; }
  };
  SC.hip_thrust_machine = {
    v: "side", eb: -1,
    k: [
      { x: 79, y: 127, t: 215, f: [P(118, 136)], h: [R(-5, -10)] },
      { x: 86, y: 104, t: 180, hd: -15, f: [P(118, 136)], h: [R(-5, -10)] }
    ],
    bg: m(8, 104, 40, 10, 3) + ml([20, 114], [20, 140]) + ml([40, 114], [40, 140]) + m(62, 131, 30, 6) + ml([144, 140], [140, 112]),
    pr: function (J) {
      var c = add(J.root, [2, -9]);
      return { b: lever([140, 112], c, 0.55, 11), f: rr(c, 24, 7, J.t - 180, "mv-pad") };
    }
  };
  SC.glute_bridge = {
    v: "side", bg: mat(10, 132),
    k: [
      { x: 80, y: 134, t: 180, hd: 12, f: [P(112, 135)], h: [P(84, 136)] },
      { x: 77.6, y: 120.3, t: 160, hd: 6, f: [P(112, 135)], h: [P(84, 136)] }
    ]
  };
  SC.glute_kickback_machine = {
    v: "side",
    bg: m(60, 114, 28, 6, 3) + ml([86, 120], [86, 140]) + ml([70, 120], [70, 140]) + ml([104, 92], [112, 140]) + ml([118, 82], [124, 96]) + rr([97, 84], 30, 8, -22, "mv-m"),
    k: [
      { x: 66, y: 84, t: -22, f: [P(50, 106), P(44, 111)], ft: [100, 120], h: [P(118, 88)] },
      { x: 66, y: 84, t: -22, f: [P(17, 71), P(44, 111)], ft: [140, 120], h: [P(118, 88)] }
    ],
    pr: function (J) {
      var fa = angOf(J.a[0], J.o[0]), c = add(add(J.a[0], dir(shinDir(J, 0)), 4), dir(fa), 4);
      return { b: lever([70, 128], c, 0.45, 9), f: rr(c, 16, 4, fa, "mv-pad") };
    }
  };
  SC.hip_abduction = {
    v: "front", eb: -1,
    bg: m(66, 44, 28, 46, 4) + m(60, 88, 40, 9, 3) + ml([80, 97], [80, 140]) + ml([66, 140], [94, 140]),
    k: [
      { x: 80, y: 92, t: -90, h: [P(99, 92)], f: [A(96, 90, { k: [0.35, 1] })], ft: 75 },
      { x: 80, y: 92, t: -90, h: [P(99, 92)], f: [A(25, 90, { k: [0.55, 1] })], ft: 60 }
    ],
    pr: function (J) {
      return { f: rr(add(J.k[0], [-6, 8]), 6, 18, 0, "mv-pad") + rr(add(J.k[1], [6, 8]), 6, 18, 0, "mv-pad") };
    }
  };
  SC.band_side_walk = {
    v: "front", eb: -1,
    k: [
      { x: 66, y: 80, t: -90, h: [R(13, -6)], f: [P(54, 137), P(78, 137)] },
      { x: 79, y: 81, t: -90, h: [R(13, -6)], f: [P(54, 137), P(104, 137)] },
      { x: 92, y: 80, t: -90, h: [R(13, -6)], f: [P(80, 137), P(104, 137)] }
    ],
    pr: function (J) { return { f: ln(lerpP(J.hp[0], J.k[0], 0.8), lerpP(J.hp[1], J.k[1], 0.8), "mv-rp") }; }
  };
  SC.back_extension = {
    v: "side",
    bg: rr([86.5, 83], 22, 8, -45, "mv-m") + ml([92, 88], [104, 140]) + ml([36, 125], [34, 140]) + ml([30, 140], [112, 140]) +
      ln([31, 117], [47, 133], "mv-plat") + circ([36, 116], 4.5, "mv-pad"),
    k: [
      { x: 85.3, y: 74.7, t: 75, f: [P(40.2, 120.2)], ft: 45, h: [T(-9, 6)] },
      { x: 85.3, y: 74.7, t: -45, f: [P(40.2, 120.2)], ft: 45, h: [T(-9, 6)] }
    ]
  };

  // ---- legs ----
  function hinge(r) {
    return {
      v: "side",
      k: [
        { x: 80, y: 74, t: -90, f: [P(80, 137)], h: [P(86, 78)] },
        { x: 54, y: 83, t: -25, hd: -8, f: [P(80, 137)], h: [P(90, 110)] }
      ],
      pr: function (J) { return { f: r ? bar(J.wr[0], r) : db(J.wr[0]) }; }
    };
  }
  SC.rdl_db = hinge(0);
  SC.rdl_barbell = hinge(11);

  SC.leg_press = (function () {
    function c(J) { return add(J.a[0], dir(-45), 4); }
    var railA = [80.4, 109], railB = [132.9, 56.5];
    return {
      v: "side",
      bg: rr([40.2, 105.4], 46, 7, 35, "mv-m") + rr([64, 119], 18, 6, 35, "mv-m") + ml([52, 120], [52, 140]) + ml([30, 140], [150, 140]) +
        ml(railA, railB) + ml(railA, [80, 140]) + ml(railB, [142, 140]),
      k: [
        { x: 60, y: 112, t: 215, f: [P(106, 72)], ft: -135, h: [P(62, 114)] },
        { x: 60, y: 112, t: 215, f: [P(86, 92)], ft: -135, h: [P(62, 114)] }
      ],
      pr: function (J) {
        var cc = c(J);
        return { b: bar(add(add(cc, dir(-45), 9), dir(45), 13), 10), f: ln(add(cc, dir(-135), 15), add(cc, dir(45), 9), "mv-plat") };
      }
    };
  })();

  function curlBody(hand) {
    return function (shin, ft) { return { x: 82, y: 91, t: 0, hd: -8, f: [A(180, shin)], ft: ft, h: [hand] }; };
  }
  SC.leg_curl = (function () {
    var K = curlBody(P(138, 120));
    return {
      v: "side",
      bg: m(48, 97, 98, 7, 3) + ml([60, 104], [60, 140]) + ml([132, 104], [132, 140]) + ml([138, 104], [138, 124]),
      k: [K(180, 90), K(280, 190)],
      pr: function (J) {
        var sd = shinDir(J, 0), pc = add(J.a[0], dir(sd + 90), 6);
        return { b: ln(J.k[0], pc, "mv-lv") + circ(J.k[0], 3, "mv-eqf"), f: circ(pc, 5.5, "mv-pad") };
      }
    };
  })();
  SC.db_leg_curl = (function () {
    var K = curlBody(P(140, 108));
    return {
      v: "side",
      bg: m(56, 98, 92, 7, 3) + ml([64, 105], [64, 140]) + ml([140, 105], [140, 140]),
      k: [K(180, 90), K(280, 190)],
      pr: function (J) { return { f: dbAx(add(J.a[0], dir(angOf(J.a[0], J.o[0])), 5), shinDir(J, 0)) }; }
    };
  })();

  SC.goblet_squat = {
    v: "side",
    k: [
      { x: 78, y: 73, t: -88, f: [P(80, 137)], h: [S(16, 14)] },
      { x: 62, y: 106, t: -68, f: [P(80, 137)], h: [S(16, 14)] }
    ],
    pr: function (J) { return { f: dbAx(add(J.wr[0], [2, -3]), 90) }; }
  };
  SC.back_squat = {
    v: "side", eb: -1,
    bg: ml([44, 24], [44, 140]) + ml([114, 24], [114, 140]) + ln([40, 98], [118, 98], "mv-plat"),
    k: [
      { x: 78, y: 73, t: -86, f: [P(80, 137)], h: [S(-4, 1)] },
      { x: 62, y: 106, t: -52, f: [P(80, 137)], h: [S(-4, 1)] }
    ],
    pr: function (J) { return { f: bar(add(J.sh[0], [-4, 2]), 10) }; }
  };
  SC.smith_squat = {
    v: "side", eb: -1,
    bg: ml([80, 6], [80, 140]) + ml([70, 6], [92, 6]),
    k: [
      { x: 80, y: 73, t: -88, f: [P(86, 137)], h: [S(-3, 2)] },
      { x: 60, y: 106, t: -55, f: [P(86, 137)], h: [S(-3, 2)] }
    ],
    pr: function (J) { return { f: bar([80, J.sh[0][1] + 2], 9) }; }
  };
  SC.squat_machine = {
    v: "side",
    bg: ml([80.8, 31.5], [46.7, 136]) + ln([80, 139], [106, 131], "mv-plat") + ml([106, 131], [108, 140]),
    k: [
      { x: 76, y: 72, t: -72, f: [P(91, 131)], ft: -14, h: [S(5, 4)] },
      { x: 66, y: 104, t: -72, f: [P(91, 131)], ft: -14, h: [S(5, 4)] }
    ],
    pr: function (J) {
      var pc = add(add(J.root, J.u, 22), J.w, -6);
      return { b: rr(pc, 46, 6, J.t, "mv-m"), f: rr(add(add(J.sh[0], J.u, -1), J.w, 2), 6, 10, J.t, "mv-pad") };
    }
  };
  SC.db_lunge = {
    v: "side",
    k: [
      { x: 77, y: 78, t: -88, f: [P(98, 137), P(56, 134)], ft: [8, 27], h: [S(2, 45)] },
      { x: 75, y: 104, t: -88, f: [P(98, 137), P(56, 134)], ft: [8, 27], h: [S(2, 45)] }
    ],
    pr: function (J) { return { b: '<g opacity=".5">' + db(J.wr[1]) + "</g>", f: db(J.wr[0]) }; }
  };
  SC.leg_extension = {
    v: "side",
    bg: m(8, 40, 16, 96) + m(47, 54, 7, 46) + m(50, 100, 36, 7) + ml([66, 107], [66, 140]) + ml([66, 104], [74, 108]),
    k: [
      { x: 66, y: 96, t: -95, f: [A(0, 95)], ft: 5, h: [P(68, 101)] },
      { x: 66, y: 96, t: -95, f: [A(-4, 2)], ft: -88, h: [P(68, 101)] }
    ],
    pr: function (J) {
      var sd = shinDir(J, 0), pc = add(add(J.a[0], dir(sd - 90), 5.5), dir(sd), -5);
      return { b: ln(J.k[0], pc, "mv-lv") + circ(J.k[0], 3, "mv-eqf"), f: circ(pc, 5, "mv-pad") };
    }
  };

  // ---- back ----
  function pulldownBase() {
    return m(50, 102, 32, 6) + ml([66, 108], [66, 140]) + ml([54, 140], [80, 140]);
  }
  var KNEE_PAD = m(92, 90, 16, 6, 3);
  SC.lat_pulldown = {
    v: "side",
    bg: pulldownBase() + m(116, 8, 6, 132, 2) + ml([78, 8], [120, 8]) + m(100, 40, 12, 90) + pulley([78, 11]),
    fg: KNEE_PAD,
    k: [
      { x: 66, y: 100, t: -100, hd: -12, f: [P(100, 136)], h: [P(74, 18)] },
      { x: 66, y: 100, t: -100, hd: -8, f: [P(100, 136)], h: [P(70, 64)] }
    ],
    pr: function (J) { var w = J.wr[0]; return { b: cable([78, 11], w), f: ln([w[0] - 8, w[1] - 1], [w[0] + 8, w[1] + 1], "mv-eq") }; }
  };
  SC.lever_pulldown = {
    v: "side",
    bg: pulldownBase() + ml([24, 14], [24, 140]) + ml([24, 14], [32, 14]),
    fg: KNEE_PAD,
    k: [
      { x: 66, y: 100, t: -100, hd: -12, f: [P(100, 136)], h: [P(82, 22)] },
      { x: 66, y: 100, t: -100, hd: -8, f: [P(100, 136)], h: [P(74, 64)] }
    ],
    pr: function (J) {
      var pv = [32, 14], w = J.wr[0], d = unit(w, pv);
      return { b: ln(pv, w, "mv-lv") + bar(add(pv, d, 10), 9) + circ(pv, 2.5, "mv-eqf"), f: grip(w, 90) };
    }
  };
  SC.pull_up = {
    v: "side", ground: false,
    bg: ml([60, 10], [132, 10]) + ml([132, 10], [132, 148]) + circ([80, 10], 2.5, "mv-eqf"),
    k: [
      { x: 79.4, y: 95, t: -92, f: [A(82, 155), A(88, 150)], ft: 120, h: [P(80, 10)] },
      { x: 79.2, y: 67.8, t: -96, hd: -15, f: [A(82, 155), A(88, 150)], ft: 120, h: [P(80, 10)] }
    ]
  };
  SC.seated_row = {
    v: "side",
    bg: m(24, 112, 62, 6) + ml([32, 118], [32, 140]) + ml([78, 118], [78, 140]) + ln([112, 96], [116, 116], "mv-plat") + m(122, 30, 14, 104) + pulley([119, 94]),
    k: [
      { x: 54, y: 110, t: -72, f: [P(108, 104)], ft: -60, h: [P(100, 92)] },
      { x: 54, y: 110, t: -92, f: [P(108, 104)], ft: -60, h: [P(72, 92)] }
    ],
    pr: function (J) { var w = J.wr[0]; return { b: cable([119, 94], w), f: poly([add(w, [4, -4]), w, add(w, [4, 4])], "mv-eq") }; }
  };
  SC.chest_supported_row = {
    v: "side",
    bg: rr([82, 78], 30, 8, -58, "mv-m") + m(46, 102, 26, 6) + ml([58, 108], [58, 140]) + ml([86, 86], [96, 140]),
    k: [
      { x: 60, y: 100, t: -58, f: [P(92, 136)], h: [P(106, 98)] },
      { x: 60, y: 100, t: -58, f: [P(92, 136)], h: [P(84, 100)] }
    ],
    pr: function (J) { return { b: lever([126, 132], J.wr[0], 0.35, 10), f: grip(J.wr[0], 90) }; }
  };
  SC.tbar_row = {
    v: "side",
    bg: rr([84.4, 78.3], 30, 8, -38, "mv-m") + m(50, 135, 32, 5) + ml([86, 84], [82, 135]),
    k: [
      { x: 58, y: 90, t: -38, f: [P(66, 132)], h: [P(94, 108)] },
      { x: 58, y: 90, t: -38, f: [P(66, 132)], h: [P(92, 86)] }
    ],
    pr: function (J) {
      var pv = [14, 136], w = J.wr[0], d = unit(pv, w);
      return { b: ln(pv, w, "mv-lv") + circ(pv, 2.5, "mv-eqf") + bar(add(w, d, 9), 11), f: grip(w, angOf(pv, w) + 90) };
    }
  };
  SC.one_arm_db_row = {
    v: "side",
    bg: m(40, 108, 108, 7) + ml([48, 115], [48, 140]) + ml([140, 115], [140, 140]),
    k: [
      { x: 68, y: 76, t: -8, hd: 20, f: [P(84, 137), P(46, 105)], ft: [8, 160], h: [P(110, 112), P(128, 105)] },
      { x: 68, y: 76, t: -8, hd: 20, f: [P(84, 137), P(46, 105)], ft: [8, 160], h: [P(98, 84), P(128, 105)] }
    ],
    pr: function (J) { return { f: db(J.wr[0]) }; }
  };
  SC.face_pull = {
    v: "side", eb: -1,
    bg: m(130, 4, 8, 136) + pulley([127, 32]),
    k: [
      { x: 78, y: 73, t: -95, f: [P(84, 137), P(70, 137)], h: [P(118, 33)] },
      { x: 78, y: 73, t: -95, f: [P(84, 137), P(70, 137)], h: [P(92, 25, { k: [0.45, 1] })] }
    ],
    pr: function (J) { var w = J.wr[0]; return { b: cable([127, 32], w), f: rope(w, 180) }; }
  };
  function apart(dy, k3) {
    return [
      { x: 80, y: 73 + dy, t: -90, h: [P(86, 44 + dy, { k: [0.29, 0.29] })] },
      { x: 80, y: 73 + dy, t: -90, h: [P(110, 39 + dy, { k: [0.6, 0.6] })] },
      { x: 80, y: 73 + dy, t: -90, h: [P(136, 34 + dy, { k: [1, 1] })] }
    ].map(function (p) { p.f = k3; return p; });
  }
  SC.band_pull_apart = {
    v: "front", eb: -1,
    k: apart(0, [P(90, 137)]),
    pr: function (J) { return { f: ln(J.wr[0], J.wr[1], "mv-rp") }; }
  };
  SC.reverse_pec_deck = {
    v: "front", eb: -1,
    bg: m(60, 90, 40, 8, 3) + ml([80, 98], [80, 140]) + ml([66, 140], [94, 140]) + ml([80, 22], [80, 6]) + ml([80, 6], [80, 6]),
    k: apart(19, [A(80, 90, { k: [0.35, 1] })]),
    pr: function (J) {
      var pv = [80, 26];
      return {
        b: ln(pv, J.wr[0], "mv-lv") + ln(pv, J.wr[1], "mv-lv") + circ(pv, 2.5, "mv-eqf"),
        m: rr([80, 76], 22, 30, 0, "mv-pad mv-see", 5),
        f: circ(J.wr[0], 3, "mv-eqf") + circ(J.wr[1], 3, "mv-eqf")
      };
    }
  };

  // ---- arms ----
  function curlScene(r) {
    return {
      v: "side",
      k: [
        { x: 78, y: 73, t: -90, f: [P(80, 137)], h: [A(88, 85)] },
        { x: 78, y: 73, t: -90, f: [P(80, 137)], h: [A(88, -62)] }
      ],
      pr: function (J) { return { f: r ? bar(J.wr[0], r) : db(J.wr[0]) }; }
    };
  }
  SC.db_curl = curlScene(0);
  SC.barbell_curl = curlScene(9);
  SC.preacher_curl = {
    v: "side",
    bg: m(112, 30, 14, 104) + m(46, 102, 26, 6) + ml([58, 108], [58, 140]) + rr([71.5, 73.5], 26, 8, 48, "mv-m") + ml([76, 82], [90, 140]),
    k: [
      { x: 60, y: 100, t: -78, f: [P(96, 136)], h: [A(48, 55)] },
      { x: 60, y: 100, t: -78, f: [P(96, 136)], h: [A(48, -70)] }
    ],
    pr: function (J) { return { b: ln(add(J.e[0], [2, 3]), J.wr[0], "mv-lv") + circ(add(J.e[0], [2, 3]), 2.5, "mv-eqf"), f: grip(J.wr[0], 90) }; }
  };
  SC.cable_pushdown = {
    v: "side",
    bg: m(124, 4, 8, 136) + pulley([120, 8]),
    k: [
      { x: 76, y: 73, t: -80, f: [P(80, 137), P(72, 137)], h: [A(95, -15)] },
      { x: 76, y: 73, t: -80, f: [P(80, 137), P(72, 137)], h: [A(95, 86)] }
    ],
    pr: function (J) { var w = J.wr[0]; return { b: cable([120, 8], w), f: rope(w, 90) }; }
  };
  var FLAT = m(20, 104, 92, 7) + ml([28, 111], [28, 140]) + ml([100, 111], [100, 140]);
  var LIE = function (h1, h2) {
    return [
      { x: 80, y: 98, t: 180, f: [P(104, 136)], h: [h1] },
      { x: 80, y: 98, t: 180, f: [P(104, 136)], h: [h2] }
    ];
  };
  SC.db_skull_crusher = {
    v: "side", bg: FLAT,
    k: LIE(A(-100, -100), A(-100, -195)),
    pr: function (J) { return { f: db(J.wr[0]) }; }
  };
  SC.dips = {
    v: "side",
    bg: ml([106, 40], [106, 140]) + ln([76, 77], [106, 77], "mv-plat") + m(102, 24, 8, 20, 2),
    k: [
      { x: 72.5, y: 70.8, t: -85, f: [A(105, 200), A(100, 195)], ft: 110, h: [P(80, 76)] },
      { x: 56, y: 95.1, t: -68, f: [A(105, 200), A(100, 195)], ft: 110, h: [P(80, 76)] }
    ]
  };

  // ---- chest ----
  SC.chest_press_pin = {
    v: "side",
    bg: rect(20, 104, 82, 7, "mv-pad") + ml([28, 111], [28, 140]) + ml([94, 111], [94, 140]) + m(2, 24, 12, 112),
    k: LIE(P(52, 95), P(44, 54)),
    pr: function (J) { return { b: lever([14, 34], J.wr[0]), f: grip(J.wr[0], 0) }; }
  };
  SC.chest_press_plate = {
    v: "side", bg: FLAT,
    k: LIE(P(52, 95), P(44, 54)),
    pr: function (J) { return { b: lever([10, 124], J.wr[0], 0.35, 10), f: grip(J.wr[0], 0) }; }
  };
  SC.db_bench = { v: "side", bg: FLAT, k: LIE(P(52, 95), P(44, 54)), pr: function (J) { return { f: db(J.wr[0]) }; } };
  SC.bench_press = {
    v: "side", bg: FLAT + ml([30, 46], [30, 140]) + ml([30, 52], [37, 52]),
    k: LIE(P(52, 95), P(44, 54)),
    pr: function (J) { return { f: bar(J.wr[0], 11) }; }
  };
  SC.smith_bench = {
    v: "side", bg: FLAT + ml([46, 6], [46, 140]) + ml([36, 6], [56, 6]),
    k: LIE(P(46, 95), P(46, 54)),
    pr: function (J) { return { f: bar([46, J.wr[0][1]], 11) }; }
  };
  var INCL = rr([56.2, 99.4], 46, 7, 35, "mv-m") + rr([82, 112], 22, 6, 0, "mv-m") + ml([60, 108], [56, 140]) + ml([88, 115], [92, 140]);
  var INCL_K = function (h1, h2) {
    return [
      { x: 76, y: 106, t: 215, f: [P(106, 136)], h: [h1] },
      { x: 76, y: 106, t: 215, f: [P(106, 136)], h: [h2] }
    ];
  };
  SC.incline_bench = {
    v: "side", bg: INCL + ml([26, 34], [26, 140]) + ml([26, 40], [33, 40]),
    k: INCL_K(P(53, 82), P(50, 40)),
    pr: function (J) { return { f: bar(J.wr[0], 10) }; }
  };
  SC.incline_chest_press = {
    v: "side", bg: INCL,
    k: INCL_K(P(53, 82), P(50, 40)),
    pr: function (J) { return { b: lever([8, 128], J.wr[0], 0.35, 10), f: grip(J.wr[0], 0) }; }
  };
  SC.db_incline = { v: "side", bg: INCL, k: INCL_K(P(53, 82), P(50, 40)), pr: function (J) { return { f: db(J.wr[0]) }; } };

  // ---- shoulders ----
  var SEAT_FRONT = m(68, 40, 24, 52, 4) + m(62, 90, 36, 7, 3) + ml([66, 97], [64, 140]) + ml([94, 97], [96, 140]);
  SC.db_shoulder_press = {
    v: "front", eb: 1, bg: SEAT_FRONT,
    k: [
      { x: 80, y: 92, t: -90, h: [P(102, 40)], f: [A(80, 90, { k: [0.35, 1] })], ft: 60 },
      { x: 80, y: 92, t: -90, h: [P(98, 9)], f: [A(80, 90, { k: [0.35, 1] })], ft: 60 }
    ],
    pr: function (J) { return { f: dbAx(J.wr[0], 0) + dbAx(J.wr[1], 0) }; }
  };
  var SEAT_SIDE = m(47, 50, 7, 50) + m(48, 102, 30, 6) + ml([60, 108], [60, 140]);
  SC.shoulder_press_machine = {
    v: "side", bg: SEAT_SIDE,
    k: [
      { x: 62, y: 100, t: -92, f: [P(96, 136)], h: [P(72, 54)] },
      { x: 62, y: 100, t: -92, f: [P(96, 136)], h: [P(68, 16)] }
    ],
    pr: function (J) { return { b: lever([24, 96], J.wr[0], 0.3, 10), f: grip(J.wr[0], 0) }; }
  };
  SC.smith_shoulder_press = {
    v: "side", bg: SEAT_SIDE + ml([72, 4], [72, 140]),
    k: [
      { x: 62, y: 100, t: -92, f: [P(96, 136)], h: [P(72, 52)] },
      { x: 62, y: 100, t: -92, f: [P(96, 136)], h: [P(72, 18)] }
    ],
    pr: function (J) { return { f: bar([72, J.wr[0][1]], 7) }; }
  };
  var RAISE_K = [
    { x: 80, y: 73, t: -90, h: [A(84, 80)], f: [P(88, 137)] },
    { x: 80, y: 73, t: -90, h: [A(-2, 6)], f: [P(88, 137)] }
  ];
  SC.lateral_raise_db = {
    v: "front", k: RAISE_K,
    pr: function (J) { return { f: circ(J.wr[0], 5, "mv-pl") + circ(J.wr[1], 5, "mv-pl") }; }
  };
  SC.side_raise_machine = {
    v: "front", k: RAISE_K,
    bg: m(62, 8, 36, 130, 3) + ml([62, 140], [98, 140]),
    pr: function (J) {
      var s = "";
      for (var i = 0; i < 2; i++) {
        var a = angOf(J.sh[i], J.e[i]), pc = add(J.e[i], dir(a - 90), 4);
        s += ln(add(J.sh[i], [0, -6]), pc, "mv-lv") + rr(pc, 10, 5, a, "mv-pad");
      }
      return { f: s };
    }
  };
  SC.cable_lateral_raise = {
    v: "front",
    bg: m(14, 10, 10, 130) + pulley([28, 133]),
    k: [
      { x: 80, y: 73, t: -90, h: [R(-12, -6, { b: 1 }), A(102, 110)], f: [P(70, 137), P(90, 137)] },
      { x: 80, y: 73, t: -90, h: [R(-12, -6, { b: 1 }), A(-2, 6)], f: [P(70, 137), P(90, 137)] }
    ],
    pr: function (J) { return { b: cable([28, 133], J.wr[1]), f: grip(J.wr[1], 90) }; }
  };

  // ---- core ----
  SC.plank = {
    v: "side", bg: mat(8, 152),
    k: [
      { x: 81.6, y: 124, t: -16, f: [P(20, 134)], ft: 180, h: [P(141, 136)] },
      { x: 80.4, y: 118.8, t: -8.3, f: [P(17, 128)], ft: 85, h: [P(141, 136)] }
    ]
  };
  SC.side_plank = {
    v: "front", eb: -1, bg: mat(20, 158),
    k: [
      { x: 89.4, y: 117, t: 205, h: [P(51, 135, { k: [1, 0.25] }), R(16, -9)], f: [P(150, 131), P(152, 120)], ft: [60, 60] },
      { x: 89.7, y: 108.2, t: 192.8, h: [P(51, 135, { k: [1, 0.25] }), R(16, -9)], f: [P(150, 131), P(152, 120)], ft: [60, 60] }
    ]
  };
  SC.crunch_mat = {
    v: "side", eb: -1, bg: mat(10, 132),
    k: [
      { x: 80, y: 134, t: 180, hd: 12, f: [P(112, 135)], ft: 0, h: [T(-9, 3, { k: [0.35, 0.6] })] },
      { x: 80, y: 134, t: 208, hd: 2, f: [P(112, 135)], ft: 0, h: [T(-9, 3, { k: [0.35, 0.6] })] }
    ]
  };
  SC.crunch_machine = {
    v: "side",
    bg: m(50, 106, 30, 6) + ml([64, 112], [64, 140]) + rr([96, 129], 10, 6, 0, "mv-m") + ml([96, 132], [96, 140]),
    k: [
      { x: 66, y: 104, t: -100, f: [P(98, 136)], h: [T(2, 8)] },
      { x: 66, y: 104, t: -62, hd: 10, f: [P(98, 136)], h: [T(2, 8)] }
    ],
    pr: function (J) {
      var pc = add(add(J.root, J.u, 22), J.w, -6);
      return { b: rr(pc, 44, 7, J.t, "mv-m"), f: grip(J.wr[0], J.t) };
    }
  };
  SC.hanging_knee_raise = {
    v: "side", ground: false,
    bg: m(58, 22, 8, 58, 3) + m(70, 60, 30, 6, 3) + ml([58, 14], [58, 148]) + ln([4, 148], [156, 148], "mv-gr") + circ([96, 57], 2.5, "mv-eqf"),
    k: [
      { x: 72, y: 74, t: -90, f: [A(92, 92)], ft: 80, h: [P(94, 57)] },
      { x: 72, y: 74, t: -90, f: [A(-6, 88)], ft: 0, h: [P(94, 57)] }
    ]
  };
  SC.dead_bug = {
    v: "side", bg: mat(4, 156),
    k: [
      { x: 88, y: 132, t: 180, hd: 8, h: [A(-90, -90), A(-90, -90)], f: [A(-90, 0), A(-90, 0)], ft: [-80, -80] },
      { x: 88, y: 132, t: 180, hd: 8, h: [A(-170, -172), A(-90, -90)], f: [A(-90, 0), A(-20, -20)], ft: [-80, -50] }
    ]
  };
  SC.mountain_climber = {
    v: "side", bg: mat(8, 152),
    k: [
      { x: 80.3, y: 106.5, t: -19.7, f: [P(86, 128), P(20, 128)], ft: [60, 75], h: [P(118, 137)] },
      { x: 80.3, y: 106.5, t: -19.7, f: [P(20, 128), P(86, 128)], ft: [75, 60], h: [P(118, 137)] }
    ]
  };

  // normalise every scene once
  Object.keys(SC).forEach(function (id) {
    var sc = SC[id];
    sc.k = sc.k.map(function (p) { return normPose(sc, p); });
  });

  // ======================================================================
  // 5. Drawing + timing
  // ======================================================================

  function figure(sc, J) {
    var pr = sc.pr ? sc.pr(J) : {}, s = pr.b || "";
    if (!J.front) {
      s += poly([J.root, J.k[1], J.a[1], J.o[1]], "mv-f");
      s += poly([J.sh[1], J.e[1], J.wr[1]], "mv-f");
      s += poly([J.root, J.sh[0], J.head], "mv-b");
      s += poly([J.root, J.k[0], J.a[0], J.o[0]], "mv-b");
      s += poly([J.sh[0], J.e[0], J.wr[0]], "mv-h") + poly([J.sh[0], J.e[0], J.wr[0]], "mv-b");
    } else {
      for (var i = 0; i < 2; i++) s += poly([J.hp[i], J.k[i], J.a[i], J.o[i]], "mv-b");
      s += ln(J.hp[0], J.hp[1], "mv-b") + ln(J.root, J.top, "mv-b") + ln(J.sh[0], J.sh[1], "mv-b") + ln(J.top, J.head, "mv-b");
      s += pr.m || "";
      for (var j = 0; j < 2; j++) s += poly([J.sh[j], J.e[j], J.wr[j]], "mv-h") + poly([J.sh[j], J.e[j], J.wr[j]], "mv-b");
    }
    s += circ(J.head, LEN.headR, "mv-hd");
    return s + (pr.f || "");
  }
  function frameAt(sc, pose) { return figure(sc, solve(sc, pose)); }
  function sceneBg(sc) { return (sc.ground === false ? "" : GROUND) + (sc.bg || ""); }

  var PAUSE = 0.3;
  function poseAt(sc, sec) {
    var n = sc.k.length, pos, i, j;
    if (sc.loop === "cycle") {
      var Tc = sc.T || 2.4;
      pos = ((sec % Tc) / Tc) * n;
      i = Math.floor(pos) % n; j = (i + 1) % n;
      return blend(sc.k[i], sc.k[j], pos - Math.floor(pos));
    }
    var T = sc.T || 2.8, half = T / 2, mv = half - PAUSE, u = sec % T, q;
    if (u < PAUSE) q = 0;
    else if (u < half) q = ease((u - PAUSE) / mv);
    else if (u < half + PAUSE) q = 1;
    else q = 1 - ease((u - half - PAUSE) / mv);
    pos = q * (n - 1);
    i = Math.min(Math.floor(pos), n - 2);
    return blend(sc.k[i], sc.k[i + 1], pos - i);
  }
  // Start and end frames: for back-and-forth scenes the first and last keyframe;
  // for cycles the first keyframe and the one half a cycle later.
  function endPose(sc) { return sc.loop === "cycle" ? sc.k[Math.floor(sc.k.length / 2)] : sc.k[sc.k.length - 1]; }

  // ======================================================================
  // 6. Muscle map
  // ======================================================================

  function el(cx, cy, rx, ry, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + "/>";
  }
  function pairEl(X0, dx, cy, rx, ry, rot) { return el(X0 - dx, cy, rx, ry, rot ? -rot : 0) + el(X0 + dx, cy, rx, ry, rot || 0); }
  function base(X0) {
    var s = '<g class="mv-base">';
    s += '<circle cx="' + X0 + '" cy="13" r="8.5"/>' + '<rect x="' + (X0 - 3.5) + '" y="20" width="7" height="8"/>';
    s += '<path d="M' + (X0 - 19) + " 27 Q" + X0 + " 23 " + (X0 + 19) + " 27 Q" + (X0 + 25) + " 29 " + (X0 + 24) + " 36 L" + (X0 + 17) + " 60 L" + (X0 + 19) + " 82 Q" + X0 + " 89 " + (X0 - 19) + " 82 L" + (X0 - 17) + " 60 L" + (X0 - 24) + " 36 Q" + (X0 - 25) + " 29 " + (X0 - 19) + ' 27 Z"/>';
    s += "</g>";
    var limbs = [[24, 33, 28, 58, 10], [28, 58, 31, 82, 8], [10, 84, 11, 118, 14], [11, 120, 10, 146, 10]];
    var o = "", n = "";
    limbs.forEach(function (l) {
      [-1, 1].forEach(function (sg) {
        var a = [X0 + sg * l[0], l[1]], b = [X0 + sg * l[2], l[3]];
        o += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke-width="' + (l[4] + 2) + '"/>';
        n += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke-width="' + l[4] + '"/>';
      });
    });
    var hands = pairEl(X0, 31.5, 86, 3.5, 3.8) + pairEl(X0, 11, 149, 4.5, 2.6);
    return '<g class="mv-bo">' + o + '</g><g class="mv-bi">' + n + '</g><g class="mv-base">' + hands + "</g>" + s;
  }
  function region(id, shapes, cls) { return '<g class="mv-r' + (cls[id] || "") + '" data-r="' + id + '">' + shapes + "</g>"; }
  function muscleSvg(ex, lang) {
    var cls = {};
    ex.S.forEach(function (r) { cls[r] = " s"; });
    ex.P.forEach(function (r) { cls[r] = " p"; });
    var F = 50, B = 150, U = UI[lang];
    var f = base(F);
    f += region("traps", '<path d="M' + (F - 4) + " 23 Q" + (F - 11) + " 26 " + (F - 17) + " 28 L" + (F - 6) + ' 29 Z"/><path d="M' + (F + 4) + " 23 Q" + (F + 11) + " 26 " + (F + 17) + " 28 L" + (F + 6) + ' 29 Z"/>', cls);
    f += region("delts_side", pairEl(F, 24.5, 34, 3.5, 6), cls);
    f += region("delts_front", pairEl(F, 19.5, 32, 4.5, 5.5), cls);
    f += region("chest", pairEl(F, 8.5, 38, 8, 6), cls);
    f += region("biceps", pairEl(F, 26, 46, 4, 9, -9), cls);
    f += region("forearms", pairEl(F, 29.5, 70, 3.6, 10.5, -7), cls);
    f += region("abs", '<rect x="' + (F - 6.5) + '" y="46" width="13" height="32" rx="5"/>', cls);
    f += region("obliques", pairEl(F, 13, 61, 3.5, 11, 5), cls);
    f += region("hip_flexors", pairEl(F, 8, 84, 4.5, 3.5, -35), cls);
    f += region("quads", pairEl(F, 11.5, 103, 6, 15), cls);
    f += region("adductors", pairEl(F, 4, 99, 2.6, 10), cls);
    var b = base(B);
    b += region("upper_back", pairEl(B, 8, 40, 6, 8), cls);
    b += region("traps", '<path d="M' + B + " 21 L" + (B + 13) + " 29 L" + B + " 50 L" + (B - 13) + ' 29 Z"/>', cls);
    b += region("lats", pairEl(B, 13.5, 56, 6, 12, -14), cls);
    b += region("lower_back", '<rect x="' + (B - 6) + '" y="63" width="12" height="17" rx="4"/>', cls);
    b += region("delts_side", pairEl(B, 24.5, 34, 3.5, 6), cls);
    b += region("delts_rear", pairEl(B, 19.5, 32, 4.5, 5.5), cls);
    b += region("triceps", pairEl(B, 26, 46, 4, 9, -9), cls);
    b += region("forearms", pairEl(B, 29.5, 70, 3.6, 10.5, -7), cls);
    b += region("glute_med", pairEl(B, 13.5, 80, 5, 4), cls);
    b += region("glutes", pairEl(B, 7.5, 89, 8, 8), cls);
    b += region("hamstrings", pairEl(B, 11, 110, 6, 13), cls);
    b += region("calves", pairEl(B, 11, 132, 4.6, 9), cls);
    var lbl = '<text class="mv-mlbl" x="' + F + '" y="163" text-anchor="middle">' + esc(U.front) + '</text><text class="mv-mlbl" x="' + B + '" y="163" text-anchor="middle">' + esc(U.back) + "</text>";
    return '<svg class="mv-map" viewBox="0 0 200 166" aria-hidden="true">' + f + b + lbl + "</svg>";
  }

  // ======================================================================
  // 7. Sheet HTML
  // ======================================================================

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function li(lang) { return lang === "ko" ? 1 : 0; }
  function pick(v, lang) { return v == null ? "" : (typeof v === "string" ? v : (v[lang] || v.en || "")); }

  function motionHtml(id, lang) {
    var sc = SC[id], U = UI[lang], nm = EX[id].name[li(lang)];
    var bg = sceneBg(sc), fg = sc.fg || "";
    var anim = '<svg class="mv-anim" data-mv="' + id + '" viewBox="0 0 160 150" role="img" aria-label="' + esc(nm + " — " + U.anim) + '">' +
      '<g class="mv-bgs">' + bg + '</g><g class="mv-dyn">' + frameAt(sc, sc.k[0]) + "</g>" + (fg ? "<g>" + fg + "</g>" : "") + "</svg>";
    var still = '<svg class="mv-still" viewBox="0 0 330 150" role="img" aria-label="' + esc(nm + " — " + U.still) + '">' +
      '<text class="mv-lbl" x="6" y="12">' + esc(U.start) + '</text><text class="mv-lbl" x="176" y="12">' + esc(U.end) + "</text>" +
      "<g>" + bg + frameAt(sc, sc.k[0]) + fg + "</g>" +
      '<path class="mv-arr" d="M156 76 L170 76 M164 71 L170 76 L164 81"/>' +
      '<g transform="translate(170 0)">' + bg + frameAt(sc, endPose(sc)) + fg + "</g></svg>";
    return '<figure class="mv-motion">' + anim + still + "</figure>";
  }

  function musText(ex, lang) {
    var i = li(lang), U = UI[lang];
    function names(a) { return a.map(function (r) { return MUS[r][i]; }).join(", "); }
    var s = "<b>" + esc(U.main) + ":</b> " + esc(names(ex.P));
    if (ex.S.length) s += " · <b>" + esc(U.also) + ":</b> " + esc(names(ex.S));
    return s;
  }

  function photosHtml(ex, lang, photos) {
    var out = "";
    ex.photos.forEach(function (key) {
      var p = photos && photos[key], cap = CAPS[key];
      if (!p || !cap) return;
      var c = cap[li(lang)];
      out += '<figure class="mv-shot"><img src="' + esc(p.src) + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(c) + '" loading="lazy" decoding="async"><figcaption>' + esc(c) + "</figcaption></figure>";
    });
    return out;
  }

  function exHtml(id, lang, photos, inAlt) {
    var ex = EX[id], i = li(lang), U = UI[lang], h = '<article class="mv-ex">';
    if (!inAlt) h += '<header class="mv-hd"><h3 class="mv-name">' + esc(ex.name[i]) + '</h3><p class="mv-eq">' + esc(ex.eq[i]) + "</p></header>";
    else h += '<p class="mv-eq">' + esc(ex.eq[i]) + "</p>";
    h += motionHtml(id, lang);
    h += '<section class="mv-blk"><h4>' + esc(U.muscles) + "</h4>" + muscleSvg(ex, lang) + '<p class="mv-mtx">' + musText(ex, lang) + "</p></section>";
    h += '<section class="mv-blk"><h4>' + esc(U.points) + '</h4><ol class="mv-pts">' + ex.pts[i].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></section>";
    var ph = photosHtml(ex, lang, photos);
    if (ph) h += '<section class="mv-blk"><h4>' + esc(U.gym) + "</h4>" + ph + "</section>";
    return h + "</article>";
  }

  var CHEV = '<svg class="mv-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function renderSheet(id, opts) {
    opts = opts || {};
    var lang = opts.lang === "ko" ? "ko" : "en", ex = EX[id];
    if (!ex) return "";
    injectCss();
    var alts = opts.alts != null ? opts.alts : ex.alts;
    var h = '<div class="mv-sheet" lang="' + lang + '">' + exHtml(id, lang, opts.photos, false);
    alts = alts.filter(function (a) { return a && EX[a.id]; });
    if (alts.length || opts.busy) {
      var U = UI[lang];
      h += '<section class="mv-alts"><h3 class="mv-alts-h">' + esc(ex.next ? U.next : U.busy) + "</h3>";
      if (opts.busy) h += '<p class="mv-busy">' + esc(pick(opts.busy, lang)) + "</p>";
      alts.forEach(function (a) {
        var note = pick(a.note, lang);
        h += '<details class="mv-alt"><summary><span class="mv-alt-t"><span class="mv-alt-n">' + esc(EX[a.id].name[li(lang)]) + "</span>" +
          (note ? '<span class="mv-alt-note">' + esc(note) + "</span>" : "") + "</span>" + CHEV + "</summary>" +
          '<div class="mv-alt-b">' + exHtml(a.id, lang, opts.photos, true) + "</div></details>";
      });
      h += "</section>";
    }
    return h + "</div>";
  }

  // ======================================================================
  // 8. Animation driver
  // ======================================================================

  function reduced() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; }
  }

  function animate(root) {
    var noop = function () {};
    if (!root || !root.querySelectorAll || reduced()) return noop;
    var nodes = root.querySelectorAll("svg.mv-anim"), players = [];
    for (var n = 0; n < nodes.length; n++) {
      var sc = SC[nodes[n].getAttribute("data-mv")];
      if (sc) players.push({ el: nodes[n], g: nodes[n].querySelector(".mv-dyn"), sc: sc, vis: false });
    }
    if (!players.length) return noop;
    var raf = 0, t0 = null, dead = false, io = null;
    function tick(now) {
      raf = 0;
      if (dead) return;
      if (t0 == null) t0 = now;
      var any = false, sec = (now - t0) / 1000;
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (!p.vis) continue;
        any = true;
        p.g.innerHTML = frameAt(p.sc, poseAt(p.sc, sec));
      }
      if (any) raf = window.requestAnimationFrame(tick);
    }
    function kick() { if (!raf && !dead) raf = window.requestAnimationFrame(tick); }
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < players.length; i++) if (players[i].el === e.target) players[i].vis = e.isIntersecting;
        });
        kick();
      });
      players.forEach(function (p) { io.observe(p.el); });
    } else {
      players.forEach(function (p) { p.vis = true; });
      kick();
    }
    return function stop() {
      if (dead) return;
      dead = true;
      if (io) io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      players.forEach(function (p) { p.g.innerHTML = frameAt(p.sc, p.sc.k[0]); });
    };
  }

  // ======================================================================
  // 9. CSS (injected once; themed through --mv-* variables)
  // ======================================================================

  var CSS = [
    ".mv-sheet{--_ink:var(--mv-ink,#1c1c1e);--_muted:var(--mv-muted,#8e8e93);--_line:var(--mv-line,#d8d8dc);--_surface:var(--mv-surface,#fff);--_soft:var(--mv-soft,#f4f4f6);--_acc:var(--mv-accent,#0a84ff);--_acc-soft:var(--mv-accent-soft,#b8d9ff);--_acc2:var(--mv-accent2,#e1306c);display:grid;gap:18px;color:var(--_ink);min-width:0}",
    "@media (prefers-color-scheme:dark){.mv-sheet{--_ink:var(--mv-ink,#f2f2f7);--_muted:var(--mv-muted,#98989f);--_line:var(--mv-line,#3a3a3c);--_surface:var(--mv-surface,#000);--_soft:var(--mv-soft,#1c1c1e);--_acc:var(--mv-accent,#0a84ff);--_acc-soft:var(--mv-accent-soft,#123f6b);--_acc2:var(--mv-accent2,#ff4f8b)}}",
    ".mv-sheet *{box-sizing:border-box}",
    ".mv-ex{display:grid;gap:16px;min-width:0}",
    ".mv-hd{display:grid;gap:2px}",
    ".mv-name{margin:0;font-size:20px;font-weight:800;letter-spacing:-.01em;line-height:1.2}",
    ".mv-eq{margin:0;font-size:13.5px;color:var(--_muted)}",
    ".mv-motion{margin:0;background:var(--_soft);border-radius:14px;padding:8px;display:grid;justify-items:center}",
    ".mv-anim{display:block;width:100%;max-width:340px;height:auto}",
    ".mv-still{display:none;width:100%;height:auto}",
    "@media (prefers-reduced-motion:reduce){.mv-anim{display:none}.mv-still{display:block}}",
    ".mv-blk{display:grid;gap:8px;min-width:0}",
    ".mv-blk h4{margin:0;font-size:13px;font-weight:600;color:var(--_muted)}",
    ".mv-map{display:block;width:100%;max-width:240px;height:auto;margin:0 auto}",
    ".mv-mtx{margin:0;font-size:14px}",
    ".mv-mtx b{font-weight:600}",
    ".mv-pts{margin:0;padding-left:20px;display:grid;gap:6px;font-size:14.5px}",
    ".mv-shot{margin:0;display:grid;gap:6px}",
    ".mv-shot img{display:block;width:100%;height:auto;max-height:62vh;object-fit:contain;background:var(--_soft);border-radius:12px}",
    ".mv-shot figcaption{font-size:13px;color:var(--_muted)}",
    ".mv-alts{display:grid;gap:0;border-top:1px solid var(--_line);padding-top:14px}",
    ".mv-alts-h{margin:0 0 6px;font-size:16px;font-weight:700}",
    ".mv-busy{margin:0 0 8px;font-size:14px;color:var(--_muted)}",
    ".mv-alt{border-bottom:1px solid var(--_line)}",
    ".mv-alt>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 0}",
    ".mv-alt>summary::-webkit-details-marker{display:none}",
    ".mv-alt>summary:focus-visible{outline:3px solid var(--_acc);outline-offset:2px}",
    ".mv-alt-t{flex:1;min-width:0;display:grid;gap:2px}",
    ".mv-alt-n{font-size:15px;font-weight:600}",
    ".mv-alt-note{font-size:13px;color:var(--_muted)}",
    ".mv-chev{flex:none;width:18px;height:18px;fill:none;stroke:var(--_muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s}",
    ".mv-alt[open]>summary .mv-chev{transform:rotate(90deg)}",
    ".mv-alt-b{padding:0 0 16px}",
    // figure
    ".mv-b{fill:none;stroke:var(--_ink);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}",
    ".mv-h{fill:none;stroke:var(--_soft);stroke-width:10;stroke-linecap:round;stroke-linejoin:round}",
    ".mv-f{fill:none;stroke:var(--_muted);stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round;opacity:.5}",
    ".mv-hd{fill:var(--_ink)}",
    ".mv-eq{fill:none;stroke:var(--_acc);stroke-width:3;stroke-linecap:round}",
    "svg .mv-eq{margin:0}",
    ".mv-eqf{fill:var(--_acc)}",
    ".mv-pl{fill:var(--_surface);fill-opacity:.85;stroke:var(--_acc);stroke-width:2.5}",
    ".mv-pad{fill:var(--_surface);stroke:var(--_acc2);stroke-width:2.5}",
    ".mv-see{fill-opacity:.55}",
    ".mv-m{fill:var(--_surface);stroke:var(--_muted);stroke-width:2}",
    ".mv-ml{fill:none;stroke:var(--_muted);stroke-width:2.5;stroke-linecap:round}",
    ".mv-plat{fill:none;stroke:var(--_muted);stroke-width:4.5;stroke-linecap:round}",
    ".mv-lv{fill:none;stroke:var(--_acc);stroke-width:3;stroke-linecap:round;opacity:.7}",
    ".mv-cb{stroke:var(--_muted);stroke-width:1.5}",
    ".mv-rp{fill:none;stroke:var(--_acc2);stroke-width:2.5;stroke-linecap:round}",
    ".mv-gr{stroke:var(--_muted);stroke-opacity:.4;stroke-width:2}",
    ".mv-mat{fill:var(--_acc-soft)}",
    ".mv-lbl{font:600 12px -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;fill:var(--_muted)}",
    ".mv-arr{fill:none;stroke:var(--_muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    // muscle map
    ".mv-base{fill:var(--_soft);stroke:var(--_line);stroke-width:1}",
    ".mv-bo{stroke:var(--_line);stroke-linecap:round}",
    ".mv-bi{stroke:var(--_soft);stroke-linecap:round}",
    ".mv-r{fill:var(--_line);stroke:var(--_surface);stroke-width:1}",
    ".mv-r.s{fill:var(--_acc-soft)}",
    ".mv-r.p{fill:var(--_acc)}",
    ".mv-mlbl{font:600 11px -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;fill:var(--_muted)}"
  ].join("\n");

  function injectCss() {
    if (typeof document === "undefined" || document.getElementById("mv-style")) return;
    var st = document.createElement("style");
    st.id = "mv-style";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  // ======================================================================
  // 10. Public API
  // ======================================================================

  window.MOVES = {
    ids: function () { return ORDER.slice(); },
    name: function (id, lang) { var e = EX[id]; return e ? e.name[li(lang)] : ""; },
    renderSheet: renderSheet,
    animate: animate,
    cats: function () { return CATS.map(function (c) { return c[0]; }); },
    cat: function (id) { var e = EX[id]; return e ? e.cat : ""; },
    catName: function (key, lang) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === key) return CATS[i][li(lang) + 1]; return ""; },
    // QA helpers (not part of the page API): SVG of one scene at a 0–1 point of its loop
    _frame: function (id, q) {
      var sc = SC[id];
      if (!sc) return "";
      var T = sc.T || (sc.loop === "cycle" ? 2.4 : 2.8);
      return '<svg viewBox="0 0 160 150">' + sceneBg(sc) + frameAt(sc, poseAt(sc, q * T)) + (sc.fg || "") + "</svg>";
    },
    _data: function (id) { return EX[id]; }
  };
  injectCss();
})();
