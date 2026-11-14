// How-to info and trained muscles per exercise (muscle ids match src/data/bodyPaths.ts).
export type ExerciseInfo = { p: string[]; s: string[]; steps: string[]; tip: string };
export const EXERCISE_INFO: Record<string, ExerciseInfo> = {
 "Barbell Bench Press": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front",
   "triceps"
  ],
  "steps": [
   "Lie on the bench with eyes under the bar and feet planted on the floor.",
   "Grip the bar slightly wider than shoulder width and unrack it over your chest.",
   "Lower the bar under control to your mid-chest.",
   "Press the bar up until your arms are extended."
  ],
  "tip": "Keep your shoulder blades pulled back and use a spotter or safety arms for heavy sets."
 },
 "Incline Dumbbell Press": {
  "p": [
   "chest",
   "delts_front"
  ],
  "s": [
   "triceps"
  ],
  "steps": [
   "Set the bench to a 30 to 45 degree incline and sit with a dumbbell on each thigh.",
   "Kick the weights up to shoulder level with palms facing forward.",
   "Press the dumbbells up until your arms are extended over your upper chest.",
   "Lower slowly back to the sides of your chest."
  ],
  "tip": "Keep your wrists stacked over your elbows throughout the press."
 },
 "Cable Fly": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Set both pulleys at chest height and stand in a split stance holding the handles.",
   "Keep a slight bend in your elbows and your chest up.",
   "Bring the handles together in a wide arc in front of your chest.",
   "Return slowly to the start until you feel a stretch across the chest."
  ],
  "tip": "Keep the elbow angle fixed so the chest does the work instead of the arms."
 },
 "Push-Up": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front",
   "triceps",
   "abs"
  ],
  "steps": [
   "Place your hands slightly wider than shoulders and form a straight line from head to heels.",
   "Brace your abs and glutes.",
   "Lower your chest toward the floor with elbows about 45 degrees from your body.",
   "Push the floor away until your arms are straight."
  ],
  "tip": "Do not let your hips sag or pike so your body stays in one line."
 },
 "Pull-Up": {
  "p": [
   "lats"
  ],
  "s": [
   "biceps",
   "upper_back",
   "forearms",
   "delts_rear"
  ],
  "steps": [
   "Hang from the bar with an overhand grip slightly wider than shoulders.",
   "Pull your shoulder blades down and back to start the movement.",
   "Pull your chest toward the bar by driving your elbows down.",
   "Lower yourself under control to a full hang."
  ],
  "tip": "Avoid swinging or kipping so the lats do the work."
 },
 "Barbell Row": {
  "p": [
   "lats",
   "upper_back"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "lower_back",
   "forearms"
  ],
  "steps": [
   "Stand with the bar over mid-foot, hinge at the hips and grip the bar just outside your knees.",
   "Keep your back flat and torso at a steady forward angle.",
   "Pull the bar to your lower ribs, driving your elbows back.",
   "Lower the bar under control without changing your torso angle."
  ],
  "tip": "Keep your spine neutral and do not use momentum from your hips."
 },
 "Lat Pulldown": {
  "p": [
   "lats"
  ],
  "s": [
   "biceps",
   "upper_back",
   "delts_rear",
   "forearms"
  ],
  "steps": [
   "Sit down, secure your thighs under the pads and grip the bar wider than shoulders.",
   "Lean back slightly and lift your chest.",
   "Pull the bar down to your upper chest by driving your elbows down.",
   "Let the bar rise slowly until your arms are extended."
  ],
  "tip": "Do not pull the bar behind your neck; bring it to your upper chest instead."
 },
 "Seated Cable Row": {
  "p": [
   "upper_back",
   "lats"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "lower_back",
   "forearms"
  ],
  "steps": [
   "Sit at the cable station with feet on the platform and knees slightly bent.",
   "Grab the handle and sit tall with your chest up.",
   "Pull the handle to your lower abdomen while squeezing your shoulder blades together.",
   "Extend your arms slowly back to the start."
  ],
  "tip": "Keep your torso steady and avoid rocking back to move the weight."
 },
 "Deadlift": {
  "p": [
   "glutes",
   "hamstrings",
   "lower_back"
  ],
  "s": [
   "quads",
   "traps",
   "upper_back",
   "lats",
   "forearms",
   "adductors"
  ],
  "steps": [
   "Stand with feet hip-width apart and the bar over mid-foot.",
   "Hinge down, grip the bar and brace your core with a flat back.",
   "Push through the floor and stand up, keeping the bar close to your legs.",
   "Lock out your hips, then lower the bar by hinging back under control."
  ],
  "tip": "Keep your back neutral and the bar in contact with your legs the whole lift."
 },
 "Back Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings",
   "lower_back",
   "abs"
  ],
  "steps": [
   "Set the bar on your upper back and unrack it with feet shoulder-width apart.",
   "Brace your core and sit down and back with knees tracking over your toes.",
   "Descend until your thighs are at least parallel to the floor.",
   "Drive through your whole foot to stand back up."
  ],
  "tip": "Use safety arms or a spotter and keep your chest up through the whole rep."
 },
 "Front Squat": {
  "p": [
   "quads"
  ],
  "s": [
   "glutes",
   "abs",
   "upper_back",
   "adductors"
  ],
  "steps": [
   "Rest the bar on your front shoulders with elbows high and feet shoulder-width apart.",
   "Brace your core and keep your torso upright.",
   "Squat down with your knees tracking over your toes.",
   "Drive up through your feet while keeping your elbows high."
  ],
  "tip": "Keep your elbows up so the bar stays on your shoulders."
 },
 "Romanian Deadlift": {
  "p": [
   "hamstrings",
   "glutes"
  ],
  "s": [
   "lower_back",
   "forearms",
   "traps"
  ],
  "steps": [
   "Stand holding the bar at hip level with a slight knee bend.",
   "Push your hips back while sliding the bar down your thighs.",
   "Lower until you feel a strong stretch in your hamstrings, with a flat back.",
   "Drive your hips forward to stand tall."
  ],
  "tip": "Keep the bar close to your legs and your back flat throughout."
 },
 "Leg Press": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings"
  ],
  "steps": [
   "Sit in the machine with your back flat against the pad and feet shoulder-width on the platform.",
   "Release the safety handles.",
   "Lower the platform until your knees reach about 90 degrees.",
   "Press through your feet until your legs are almost straight."
  ],
  "tip": "Do not lock your knees at the top and keep your lower back on the pad."
 },
 "Walking Lunge": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "adductors",
   "calves"
  ],
  "steps": [
   "Stand tall holding a dumbbell in each hand at your sides.",
   "Step forward and lower until both knees are bent about 90 degrees.",
   "Push through your front foot and bring the back leg forward into the next step.",
   "Continue alternating legs for the set."
  ],
  "tip": "Take long enough steps that your front knee stays over your ankle."
 },
 "Calf Raise": {
  "p": [
   "calves"
  ],
  "s": [],
  "steps": [
   "Set the machine so the pads rest on your shoulders and the balls of your feet are on the platform.",
   "Lower your heels for a full stretch.",
   "Rise onto your toes as high as you can.",
   "Pause briefly, then lower slowly."
  ],
  "tip": "Use the full range of motion and avoid bouncing at the bottom."
 },
 "Overhead Press": {
  "p": [
   "delts_front"
  ],
  "s": [
   "delts_side",
   "triceps",
   "traps",
   "abs"
  ],
  "steps": [
   "Hold the bar at shoulder height with a grip just outside your shoulders.",
   "Brace your abs and glutes.",
   "Press the bar straight up, moving your head slightly back, then forward under it.",
   "Lower the bar back to your upper chest under control."
  ],
  "tip": "Squeeze your glutes and avoid leaning back to keep your lower back safe."
 },
 "Lateral Raise": {
  "p": [
   "delts_side"
  ],
  "s": [
   "traps",
   "delts_front"
  ],
  "steps": [
   "Stand holding a dumbbell in each hand at your sides with a slight elbow bend.",
   "Raise your arms out to the sides up to shoulder height.",
   "Pause briefly at the top.",
   "Lower the weights slowly to your sides."
  ],
  "tip": "Use a light weight and lead with your elbows rather than swinging."
 },
 "Face Pull": {
  "p": [
   "delts_rear",
   "upper_back"
  ],
  "s": [
   "traps",
   "biceps"
  ],
  "steps": [
   "Set a rope attachment on a cable at upper-chest height or higher.",
   "Grab the rope with both hands and step back with arms extended.",
   "Pull the rope toward your face, flaring your elbows out and high.",
   "Return slowly to the start."
  ],
  "tip": "Keep your torso still and finish with your hands beside your ears."
 },
 "Barbell Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms",
   "delts_front"
  ],
  "steps": [
   "Stand holding the bar with an underhand shoulder-width grip.",
   "Keep your elbows pinned at your sides.",
   "Curl the bar up to shoulder height.",
   "Lower it slowly until your arms are fully extended."
  ],
  "tip": "Do not swing your torso to lift the bar."
 },
 "Hammer Curl": {
  "p": [
   "biceps",
   "forearms"
  ],
  "s": [],
  "steps": [
   "Stand holding a dumbbell in each hand with palms facing each other.",
   "Keep your elbows close to your sides.",
   "Curl the dumbbells up toward your shoulders without rotating your wrists.",
   "Lower them slowly to the start."
  ],
  "tip": "Keep your upper arms still and control the lowering phase."
 },
 "Triceps Pushdown": {
  "p": [
   "triceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Attach a bar or rope to a high pulley and grip it with elbows at your sides.",
   "Keep your torso upright and elbows pinned.",
   "Push the handle down until your arms are fully extended.",
   "Return slowly until your forearms are about parallel to the floor."
  ],
  "tip": "Keep your elbows fixed at your sides so only the forearms move."
 },
 "Skull Crusher": {
  "p": [
   "triceps"
  ],
  "s": [
   "delts_front",
   "forearms"
  ],
  "steps": [
   "Lie on a bench holding the bar over your chest with arms extended.",
   "Keep your upper arms still and bend only at the elbows.",
   "Lower the bar toward your forehead or just behind your head.",
   "Extend your elbows to press the bar back up."
  ],
  "tip": "Use a manageable weight and a spotter or EZ-bar to protect your elbows and head."
 },
 "Plank": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques",
   "delts_front",
   "glutes",
   "lower_back"
  ],
  "steps": [
   "Place your forearms on the floor with elbows under your shoulders.",
   "Extend your legs and rise onto your toes.",
   "Brace your abs and glutes to keep a straight line from head to heels.",
   "Hold the position while breathing steadily."
  ],
  "tip": "Do not let your hips sag or rise, and stop the set when your form breaks."
 },
 "Hanging Leg Raise": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques",
   "forearms",
   "quads"
  ],
  "steps": [
   "Hang from a pull-up bar with an overhand grip and arms straight.",
   "Brace your core and keep your body still.",
   "Raise your legs until your hips curl up and thighs are at least parallel to the floor.",
   "Lower your legs slowly without swinging."
  ],
  "tip": "Tilt your pelvis up at the top and avoid swinging to keep tension on your abs."
 },
 "Cable Crunch": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques"
  ],
  "steps": [
   "Kneel facing a high pulley and hold the rope beside your head.",
   "Set your hips and keep them still.",
   "Curl your torso down, bringing your elbows toward your knees.",
   "Return slowly to the upright position."
  ],
  "tip": "Bend through your spine, not your hips, so your abs do the work."
 },
 "Incline Barbell Bench Press": {
  "p": [
   "chest",
   "delts_front"
  ],
  "s": [
   "triceps"
  ],
  "steps": [
   "Set the bench to a 30 degree incline and lie back with feet planted.",
   "Grip the bar slightly wider than shoulders and unrack it over your upper chest.",
   "Lower the bar to your upper chest under control.",
   "Press the bar back up until your arms are extended."
  ],
  "tip": "Keep your shoulder blades retracted and use a spotter for heavy loads."
 },
 "Decline Barbell Bench Press": {
  "p": [
   "chest"
  ],
  "s": [
   "triceps",
   "delts_front"
  ],
  "steps": [
   "Lock your legs into the decline bench and lie back with eyes under the bar.",
   "Grip slightly wider than shoulders and unrack the bar.",
   "Lower the bar to your lower chest under control.",
   "Press up until your arms are extended."
  ],
  "tip": "Use a spotter, since unracking and re-racking is harder on a decline bench."
 },
 "Close-Grip Bench Press": {
  "p": [
   "triceps"
  ],
  "s": [
   "chest",
   "delts_front"
  ],
  "steps": [
   "Lie on a flat bench and grip the bar about shoulder-width apart.",
   "Unrack the bar and hold it over your chest.",
   "Lower the bar to your lower chest with elbows tucked close to your body.",
   "Press the bar up until your arms are extended."
  ],
  "tip": "Do not use a very narrow grip; shoulder width is easier on your wrists."
 },
 "Dumbbell Bench Press": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front",
   "triceps"
  ],
  "steps": [
   "Sit on a flat bench with dumbbells on your thighs and lie back, lifting them to chest level.",
   "Press the dumbbells up until your arms are extended above your chest.",
   "Lower them slowly to the sides of your chest.",
   "Press back up along the same path."
  ],
  "tip": "Keep your wrists straight and control the weights through the full range."
 },
 "Dumbbell Fly": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Lie on a flat bench holding dumbbells over your chest with palms facing each other.",
   "Keep a slight bend in your elbows.",
   "Lower the dumbbells out to the sides in a wide arc until you feel a chest stretch.",
   "Bring them back together over your chest."
  ],
  "tip": "Use a light weight and do not lower past a comfortable stretch."
 },
 "Incline Dumbbell Fly": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Set the bench to a low incline and hold dumbbells over your upper chest with palms facing in.",
   "Keep a slight bend in your elbows.",
   "Lower the weights out to the sides in a wide arc.",
   "Squeeze your chest to bring them back together overhead."
  ],
  "tip": "Keep the elbow bend constant so the movement stays a fly rather than a press."
 },
 "Machine Chest Press": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front",
   "triceps"
  ],
  "steps": [
   "Adjust the seat so the handles are at mid-chest height.",
   "Sit with your back against the pad and grip the handles.",
   "Press the handles forward until your arms are extended.",
   "Return slowly until you feel a stretch in your chest."
  ],
  "tip": "Keep your shoulder blades back against the pad throughout."
 },
 "Pec Deck": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Adjust the seat so the handles are at chest height and sit with your back against the pad.",
   "Place your forearms or hands on the pads with elbows slightly bent.",
   "Bring the handles together in front of your chest.",
   "Return slowly until you feel a stretch across your chest."
  ],
  "tip": "Do not let the weight stack drop and keep your shoulders away from your ears."
 },
 "Low-to-High Cable Fly": {
  "p": [
   "chest",
   "delts_front"
  ],
  "s": [],
  "steps": [
   "Set both pulleys low and grab the handles with a staggered stance.",
   "Keep a slight bend in your elbows.",
   "Sweep your arms up and together to about eye level in front of you.",
   "Lower slowly back to the start."
  ],
  "tip": "Lead with your chest and avoid shrugging your shoulders."
 },
 "Dip": {
  "p": [
   "chest",
   "triceps"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Grip the parallel bars and lift yourself up with arms straight.",
   "Lean your torso slightly forward.",
   "Lower your body until your upper arms are about parallel to the floor.",
   "Press up until your arms are extended."
  ],
  "tip": "Stop at a comfortable depth to avoid straining your shoulders."
 },
 "Decline Push-Up": {
  "p": [
   "chest",
   "delts_front"
  ],
  "s": [
   "triceps",
   "abs"
  ],
  "steps": [
   "Place your feet on a bench and hands on the floor slightly wider than shoulders.",
   "Brace your abs and keep a straight body line.",
   "Lower your chest toward the floor.",
   "Push up until your arms are straight."
  ],
  "tip": "Keep your core tight so your hips do not drop."
 },
 "Diamond Push-Up": {
  "p": [
   "triceps"
  ],
  "s": [
   "chest",
   "delts_front",
   "abs"
  ],
  "steps": [
   "Start in a push-up position with hands close together under your chest.",
   "Keep your body in a straight line.",
   "Lower your chest toward your hands with elbows close to your sides.",
   "Press back up until your arms are straight."
  ],
  "tip": "Keep your elbows tucked and drop to your knees if your wrists feel strained."
 },
 "Smith Machine Bench Press": {
  "p": [
   "chest"
  ],
  "s": [
   "delts_front",
   "triceps"
  ],
  "steps": [
   "Place a bench under the bar and lie down with the bar over your mid-chest.",
   "Grip slightly wider than shoulders and unhook the bar.",
   "Lower the bar to your mid-chest under control.",
   "Press up and re-hook the bar when finished."
  ],
  "tip": "Set the safety stops at the right height before you start your set."
 },
 "Landmine Press": {
  "p": [
   "delts_front",
   "chest"
  ],
  "s": [
   "triceps",
   "abs",
   "obliques"
  ],
  "steps": [
   "Place one end of the barbell in a landmine anchor and hold the other end at your shoulder.",
   "Stand in a staggered stance with your core braced.",
   "Press the bar up and forward until your arm is extended.",
   "Lower it slowly back to your shoulder."
  ],
  "tip": "Keep your ribs down and avoid leaning back as you press."
 },
 "Chin-Up": {
  "p": [
   "lats",
   "biceps"
  ],
  "s": [
   "upper_back",
   "forearms",
   "delts_rear"
  ],
  "steps": [
   "Hang from the bar with an underhand shoulder-width grip.",
   "Pull your shoulder blades down and back.",
   "Pull your chin above the bar by driving your elbows down.",
   "Lower yourself under control to a full hang."
  ],
  "tip": "Avoid swinging and lower slowly to protect your elbows."
 },
 "Wide-Grip Pull-Up": {
  "p": [
   "lats"
  ],
  "s": [
   "upper_back",
   "biceps",
   "delts_rear",
   "forearms"
  ],
  "steps": [
   "Hang from the bar with an overhand grip well wider than your shoulders.",
   "Pull your shoulder blades down and back.",
   "Pull your chest toward the bar, driving your elbows down and out.",
   "Lower yourself under control to a full hang."
  ],
  "tip": "Do not grip too wide; a width you can control keeps your shoulders comfortable."
 },
 "Assisted Pull-Up": {
  "p": [
   "lats"
  ],
  "s": [
   "biceps",
   "upper_back",
   "forearms",
   "delts_rear"
  ],
  "steps": [
   "Select an assistance weight and kneel or stand on the pad.",
   "Grip the handles with an overhand grip and pull your shoulder blades down.",
   "Pull your chest toward the handles.",
   "Lower yourself slowly until your arms are straight."
  ],
  "tip": "Reduce the assistance gradually as you get stronger."
 },
 "Pendlay Row": {
  "p": [
   "upper_back",
   "lats"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "lower_back",
   "forearms"
  ],
  "steps": [
   "Hinge with the bar over mid-foot until your torso is nearly parallel to the floor, then grip it.",
   "Keep your back flat and core braced.",
   "Row the bar explosively to your lower chest.",
   "Lower the bar to the floor and reset for each rep."
  ],
  "tip": "Keep your torso still and reset your back position on every rep."
 },
 "T-Bar Row": {
  "p": [
   "upper_back",
   "lats"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "lower_back",
   "forearms"
  ],
  "steps": [
   "Straddle the bar and hinge at the hips with a flat back, gripping the handle.",
   "Brace your core.",
   "Pull the weight toward your chest, driving your elbows back.",
   "Lower it slowly until your arms are straight."
  ],
  "tip": "Keep your chest up and avoid jerking the weight with your lower back."
 },
 "One-Arm Dumbbell Row": {
  "p": [
   "lats"
  ],
  "s": [
   "upper_back",
   "biceps",
   "delts_rear",
   "forearms"
  ],
  "steps": [
   "Place one hand and knee on a bench and hold a dumbbell in the other hand.",
   "Keep your back flat and parallel to the floor.",
   "Pull the dumbbell toward your hip, driving the elbow back.",
   "Lower it slowly until your arm is straight."
  ],
  "tip": "Do not rotate your torso to lift the weight."
 },
 "Chest-Supported Row": {
  "p": [
   "upper_back",
   "lats"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "forearms"
  ],
  "steps": [
   "Adjust the seat and lie or sit with your chest against the pad.",
   "Grip the handles with arms extended.",
   "Pull the handles toward your torso, squeezing your shoulder blades together.",
   "Return slowly to the start."
  ],
  "tip": "Keep your chest on the pad and avoid shrugging your shoulders."
 },
 "Close-Grip Lat Pulldown": {
  "p": [
   "lats"
  ],
  "s": [
   "biceps",
   "upper_back",
   "forearms",
   "delts_rear"
  ],
  "steps": [
   "Attach a close-grip handle, sit down and secure your thighs under the pads.",
   "Lean back slightly with your chest up.",
   "Pull the handle down to your upper chest, driving your elbows down.",
   "Let it rise slowly until your arms are extended."
  ],
  "tip": "Avoid leaning far back and keep the pull smooth."
 },
 "Straight-Arm Pulldown": {
  "p": [
   "lats"
  ],
  "s": [
   "triceps",
   "abs",
   "delts_rear"
  ],
  "steps": [
   "Stand facing a high pulley and grip a bar or rope with straight arms.",
   "Hinge slightly forward with your core braced.",
   "Push the bar down in an arc to your thighs, keeping your arms nearly straight.",
   "Return slowly to the start above shoulder height."
  ],
  "tip": "Keep your elbow angle fixed and move only at your shoulders."
 },
 "Rack Pull": {
  "p": [
   "glutes",
   "lower_back",
   "upper_back"
  ],
  "s": [
   "hamstrings",
   "traps",
   "forearms",
   "lats",
   "quads"
  ],
  "steps": [
   "Set the bar on safety pins at knee height and stand with it over mid-foot.",
   "Grip the bar, brace your core and keep a flat back.",
   "Drive your hips forward and stand tall, keeping the bar close.",
   "Lower the bar under control back to the pins."
  ],
  "tip": "Keep a neutral spine and avoid leaning back at the top."
 },
 "Sumo Deadlift": {
  "p": [
   "glutes",
   "quads",
   "adductors"
  ],
  "s": [
   "hamstrings",
   "lower_back",
   "traps",
   "forearms",
   "upper_back"
  ],
  "steps": [
   "Stand with a wide stance and toes turned out, with the bar over mid-foot.",
   "Grip the bar inside your knees, brace your core and keep your chest up.",
   "Push the floor apart and stand up, keeping the bar close.",
   "Lock out your hips, then lower the bar under control."
  ],
  "tip": "Keep your knees tracking over your toes as you pull."
 },
 "Trap Bar Deadlift": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "lower_back",
   "traps",
   "forearms",
   "upper_back"
  ],
  "steps": [
   "Stand inside the trap bar with feet hip-width apart and grip the handles.",
   "Brace your core and keep your chest up with a flat back.",
   "Push through the floor and stand up.",
   "Lower the bar under control by hinging at your hips and bending your knees."
  ],
  "tip": "Keep the bar close and your back flat throughout the lift."
 },
 "Back Extension": {
  "p": [
   "lower_back",
   "glutes"
  ],
  "s": [
   "hamstrings"
  ],
  "steps": [
   "Position yourself on the bench with your hips just over the pad and ankles secured.",
   "Cross your arms over your chest and keep your spine neutral.",
   "Raise your torso until your body forms a straight line.",
   "Lower under control with a straight back."
  ],
  "tip": "Stop at a straight body line without overarching your lower back."
 },
 "Dumbbell Shrug": {
  "p": [
   "traps"
  ],
  "s": [
   "forearms",
   "upper_back"
  ],
  "steps": [
   "Stand holding a dumbbell in each hand at your sides.",
   "Keep your arms straight and your chest up.",
   "Lift your shoulders straight up toward your ears.",
   "Pause briefly, then lower slowly."
  ],
  "tip": "Move straight up and down without rolling your shoulders."
 },
 "Barbell Shrug": {
  "p": [
   "traps"
  ],
  "s": [
   "forearms",
   "upper_back"
  ],
  "steps": [
   "Stand holding a barbell in front of your thighs with a shoulder-width overhand grip.",
   "Keep your arms straight and your chest up.",
   "Lift your shoulders straight up toward your ears.",
   "Pause briefly, then lower slowly."
  ],
  "tip": "Use straps if your grip limits you, and avoid bending your elbows."
 },
 "Inverted Row": {
  "p": [
   "upper_back",
   "lats"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "forearms",
   "abs"
  ],
  "steps": [
   "Set a bar at waist height and hang beneath it with arms extended and heels on the floor.",
   "Keep your body straight from head to heels.",
   "Pull your chest to the bar by driving your elbows back.",
   "Lower yourself slowly until your arms are straight."
  ],
  "tip": "Raise the bar height to make it easier and keep your hips from sagging."
 },
 "Meadows Row": {
  "p": [
   "lats",
   "upper_back"
  ],
  "s": [
   "biceps",
   "delts_rear",
   "forearms",
   "lower_back"
  ],
  "steps": [
   "Place one end of a barbell in a landmine anchor and stand sideways to it.",
   "Hinge forward with a flat back and grip the end of the bar.",
   "Row the bar toward your hip, driving your elbow back.",
   "Lower under control until your arm is straight."
  ],
  "tip": "Keep your hips and torso still as you row."
 },
 "Bulgarian Split Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings"
  ],
  "steps": [
   "Hold a dumbbell in each hand and rest one rear foot on a bench behind you.",
   "Step your front foot forward and keep your torso upright.",
   "Lower until your front thigh is about parallel to the floor.",
   "Drive through your front foot to stand up."
  ],
  "tip": "Keep your front foot far enough forward that your knee stays stable."
 },
 "Goblet Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "abs",
   "upper_back"
  ],
  "steps": [
   "Hold a dumbbell vertically against your chest with feet shoulder-width apart.",
   "Brace your core and keep your chest up.",
   "Squat down between your knees until your thighs are at least parallel.",
   "Drive through your feet to stand."
  ],
  "tip": "Keep your elbows inside your knees and the dumbbell close to your chest."
 },
 "Hack Squat": {
  "p": [
   "quads"
  ],
  "s": [
   "glutes",
   "adductors"
  ],
  "steps": [
   "Position your shoulders under the pads and place your feet shoulder-width on the platform.",
   "Release the safety handles.",
   "Lower yourself until your thighs are about parallel to the platform.",
   "Press through your feet to stand without locking out your knees."
  ],
  "tip": "Keep your back and hips against the pad as you lower."
 },
 "Smith Machine Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings"
  ],
  "steps": [
   "Set the bar on your upper back and stand with feet slightly forward of the bar.",
   "Unhook the bar and brace your core.",
   "Lower until your thighs are at least parallel to the floor.",
   "Press up through your feet and re-hook the bar when finished."
  ],
  "tip": "Place your feet slightly in front of you so your knees and back stay comfortable."
 },
 "Leg Extension": {
  "p": [
   "quads"
  ],
  "s": [],
  "steps": [
   "Adjust the seat so your knees line up with the machine pivot and the pad rests on your lower shins.",
   "Grip the handles.",
   "Extend your legs until they are almost straight.",
   "Lower the weight slowly."
  ],
  "tip": "Avoid slamming the weight stack and pause briefly at the top."
 },
 "Lying Leg Curl": {
  "p": [
   "hamstrings"
  ],
  "s": [
   "calves"
  ],
  "steps": [
   "Lie face down on the machine with the pad just above your heels.",
   "Grip the handles and keep your hips pressed down.",
   "Curl your heels toward your glutes.",
   "Lower the weight slowly until your legs are almost straight."
  ],
  "tip": "Keep your hips on the pad and do not lift them to move the weight."
 },
 "Seated Leg Curl": {
  "p": [
   "hamstrings"
  ],
  "s": [
   "calves"
  ],
  "steps": [
   "Sit in the machine with the pad above your heels and the lap pad secured on your thighs.",
   "Grip the handles and sit upright.",
   "Curl your heels down and back toward the seat.",
   "Return slowly until your legs are almost straight."
  ],
  "tip": "Use a smooth tempo and avoid letting the weight stack crash down."
 },
 "Stiff-Leg Deadlift": {
  "p": [
   "hamstrings",
   "glutes"
  ],
  "s": [
   "lower_back",
   "forearms",
   "traps"
  ],
  "steps": [
   "Stand holding the bar at hip level with your legs nearly straight.",
   "Hinge forward at the hips while keeping your back flat.",
   "Lower the bar along your legs until you feel a strong hamstring stretch.",
   "Drive your hips forward to stand tall."
  ],
  "tip": "Keep your back flat and stop lowering when your form starts to round."
 },
 "Dumbbell Romanian Deadlift": {
  "p": [
   "hamstrings",
   "glutes"
  ],
  "s": [
   "lower_back",
   "forearms",
   "traps"
  ],
  "steps": [
   "Stand holding a dumbbell in each hand in front of your thighs with a slight knee bend.",
   "Push your hips back and slide the weights down your legs.",
   "Lower until you feel a stretch in your hamstrings, keeping your back flat.",
   "Drive your hips forward to stand tall."
  ],
  "tip": "Keep the dumbbells close to your legs and your back flat throughout."
 },
 "Reverse Lunge": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "adductors"
  ],
  "steps": [
   "Stand tall holding a dumbbell in each hand at your sides.",
   "Step one foot straight back and lower until both knees are about 90 degrees.",
   "Keep your torso upright and front heel down.",
   "Push through your front foot to return to standing, then switch legs."
  ],
  "tip": "Keep most of your weight on your front leg as you step back."
 },
 "Barbell Lunge": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "adductors",
   "abs"
  ],
  "steps": [
   "Set the bar on your upper back and stand tall with feet hip-width apart.",
   "Step forward and lower until both knees are about 90 degrees.",
   "Keep your torso upright.",
   "Push through your front foot back to the start and alternate legs."
  ],
  "tip": "Use a light load first and a rack with safety arms nearby for balance."
 },
 "Step-Up": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "calves",
   "adductors"
  ],
  "steps": [
   "Stand facing a bench holding a dumbbell in each hand.",
   "Place one foot fully on the bench.",
   "Drive through that heel to stand up on the bench.",
   "Step back down under control and repeat, then switch legs."
  ],
  "tip": "Use a bench height that lets your front knee stay at about 90 degrees."
 },
 "Seated Calf Raise": {
  "p": [
   "calves"
  ],
  "s": [],
  "steps": [
   "Sit in the machine with the balls of your feet on the platform and the pads on your lower thighs.",
   "Release the safety.",
   "Lower your heels for a deep stretch.",
   "Raise your heels as high as you can, pause, then lower slowly."
  ],
  "tip": "Use a full range of motion and avoid bouncing at the bottom."
 },
 "Standing Calf Raise": {
  "p": [
   "calves"
  ],
  "s": [],
  "steps": [
   "Set the bar on your upper back and stand with the balls of your feet on a raised edge.",
   "Brace your core and keep your knees nearly straight.",
   "Rise onto your toes as high as you can.",
   "Lower your heels below the edge for a full stretch."
  ],
  "tip": "Hold a rack or support for balance and keep the movement controlled."
 },
 "Sissy Squat": {
  "p": [
   "quads"
  ],
  "s": [
   "abs",
   "adductors"
  ],
  "steps": [
   "Stand with feet hip-width apart and hold a support for balance.",
   "Rise onto your toes and lean your torso back.",
   "Bend your knees forward and lower your hips toward your heels.",
   "Push through your toes to return to standing."
  ],
  "tip": "Start with a small range and hold a support until you can control the movement."
 },
 "Nordic Hamstring Curl": {
  "p": [
   "hamstrings"
  ],
  "s": [
   "glutes",
   "calves",
   "lower_back"
  ],
  "steps": [
   "Kneel on a pad with your ankles secured under a bar or held by a partner.",
   "Keep your body straight from knees to head.",
   "Lower your torso forward as slowly as you can.",
   "Catch yourself with your hands and push back up to the start."
  ],
  "tip": "Lower as slowly as possible and use your hands to catch yourself when needed."
 },
 "Box Squat": {
  "p": [
   "glutes",
   "quads"
  ],
  "s": [
   "hamstrings",
   "adductors",
   "lower_back",
   "abs"
  ],
  "steps": [
   "Set a box behind you at about parallel height and place the bar on your upper back.",
   "Brace your core and sit back onto the box with control.",
   "Pause briefly without relaxing your core.",
   "Drive through your feet to stand."
  ],
  "tip": "Sit back under control and do not drop onto the box or rock back."
 },
 "Pause Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings",
   "lower_back",
   "abs"
  ],
  "steps": [
   "Set the bar on your upper back and brace your core.",
   "Squat down until your thighs are at least parallel.",
   "Hold the bottom position for 2 to 3 seconds, staying tight.",
   "Drive through your whole foot to stand up."
  ],
  "tip": "Stay braced during the pause instead of relaxing into the bottom."
 },
 "Adductor Machine": {
  "p": [
   "adductors"
  ],
  "s": [
   "glutes"
  ],
  "steps": [
   "Sit with your back against the pad and set your legs on the inner pads.",
   "Adjust the starting width to a comfortable stretch.",
   "Squeeze your legs together under control.",
   "Return slowly to the start without letting the plates crash."
  ],
  "tip": "Choose a weight that lets you control the return without bouncing."
 },
 "Abductor Machine": {
  "p": [
   "glutes"
  ],
  "s": [
   "quads"
  ],
  "steps": [
   "Sit with your back against the pad and set your legs against the outer pads.",
   "Brace your core and keep your hips planted.",
   "Press your legs outward as far as comfortable.",
   "Return slowly to the start under control."
  ],
  "tip": "Keep your hips and back pressed into the seat to avoid using momentum."
 },
 "Bodyweight Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "adductors",
   "calves",
   "abs"
  ],
  "steps": [
   "Stand with feet shoulder-width apart and toes slightly out.",
   "Push your hips back and bend your knees to lower down.",
   "Descend until your thighs are about parallel to the floor.",
   "Press through your feet to stand tall."
  ],
  "tip": "Keep your knees tracking over your toes and your chest up."
 },
 "Wall Sit": {
  "p": [
   "quads"
  ],
  "s": [
   "glutes",
   "calves",
   "hamstrings"
  ],
  "steps": [
   "Stand with your back against a wall and feet about two feet out.",
   "Slide down until your thighs are parallel to the floor.",
   "Keep knees over ankles and your back flat on the wall.",
   "Hold for the planned time, then slide back up."
  ],
  "tip": "Keep your weight in your heels and breathe steadily throughout the hold."
 },
 "Kettlebell Goblet Squat": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "abs",
   "adductors",
   "delts_front",
   "upper_back"
  ],
  "steps": [
   "Hold the kettlebell by the horns against your chest.",
   "Brace your core and sit down between your knees.",
   "Keep your elbows inside your knees and your chest tall.",
   "Drive through your feet to return to standing."
  ],
  "tip": "Keep the kettlebell close to your chest so your torso stays upright."
 },
 "Hip Thrust": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "quads",
   "adductors"
  ],
  "steps": [
   "Sit with your upper back against a bench and a padded barbell over your hips.",
   "Plant your feet hip-width apart with knees bent.",
   "Drive through your heels and lift your hips until your torso is level.",
   "Squeeze your glutes at the top, then lower under control."
  ],
  "tip": "Tuck your chin and avoid overarching your lower back at the top."
 },
 "Glute Bridge": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "abs",
   "adductors"
  ],
  "steps": [
   "Lie on your back with knees bent and feet flat on the floor.",
   "Brace your core and press through your heels.",
   "Lift your hips until your body forms a straight line from shoulders to knees.",
   "Squeeze your glutes, then lower slowly."
  ],
  "tip": "Finish by squeezing your glutes rather than arching your lower back."
 },
 "Cable Pull-Through": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "lower_back",
   "adductors"
  ],
  "steps": [
   "Face away from a low cable and hold the rope between your legs.",
   "Step forward with your knees slightly bent.",
   "Push your hips back, keeping your back flat.",
   "Drive your hips forward and squeeze your glutes to stand tall."
  ],
  "tip": "Hinge at the hips rather than squatting, and keep your spine neutral."
 },
 "Cable Kickback": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "lower_back"
  ],
  "steps": [
   "Attach an ankle cuff to a low cable and face the machine.",
   "Hold the frame and lean slightly forward with a braced core.",
   "Kick your working leg back and slightly up.",
   "Squeeze your glute, then return slowly."
  ],
  "tip": "Move from the hip without arching your lower back."
 },
 "Good Morning": {
  "p": [
   "hamstrings",
   "glutes"
  ],
  "s": [
   "lower_back",
   "abs"
  ],
  "steps": [
   "Set a barbell on your upper back and stand with knees slightly bent.",
   "Brace your core and push your hips straight back.",
   "Lower your torso until you feel a stretch in your hamstrings.",
   "Drive your hips forward to return to standing."
  ],
  "tip": "Keep your back flat and use a light load while learning the movement."
 },
 "Frog Pump": {
  "p": [
   "glutes"
  ],
  "s": [
   "adductors",
   "hamstrings"
  ],
  "steps": [
   "Lie on your back with the soles of your feet together and knees dropped out.",
   "Bring your heels close to your hips.",
   "Press through your feet and lift your hips up.",
   "Squeeze your glutes at the top, then lower with control."
  ],
  "tip": "Use short, fast reps and keep tension in your glutes throughout."
 },
 "Machine Hip Thrust": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "quads",
   "adductors"
  ],
  "steps": [
   "Sit in the machine and set the pad or belt across your hips.",
   "Plant your feet flat, shoulder-width apart.",
   "Drive through your heels to lift your hips up.",
   "Squeeze at the top, then lower under control."
  ],
  "tip": "Pause briefly at the top and avoid pushing through your lower back."
 },
 "Single-Leg Hip Thrust": {
  "p": [
   "glutes"
  ],
  "s": [
   "hamstrings",
   "abs",
   "adductors"
  ],
  "steps": [
   "Sit with your upper back on a bench and one foot flat on the floor.",
   "Extend your other leg or hold it up.",
   "Drive through your planted heel to lift your hips.",
   "Squeeze your glute at the top, then lower slowly."
  ],
  "tip": "Keep your hips level and avoid rotating toward the lifted leg."
 },
 "Seated Dumbbell Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "traps",
   "upper_back"
  ],
  "steps": [
   "Sit on a bench with back support and hold dumbbells at shoulder height.",
   "Brace your core and press the weights overhead.",
   "Stop just short of locking out your elbows.",
   "Lower the dumbbells slowly back to shoulder level."
  ],
  "tip": "Keep your ribs down and avoid arching your lower back as you press."
 },
 "Arnold Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "delts_rear",
   "traps"
  ],
  "steps": [
   "Sit with dumbbells at chest height and palms facing you.",
   "Press up while rotating your palms to face forward.",
   "Finish with your arms extended overhead.",
   "Lower while rotating your palms back toward you."
  ],
  "tip": "Move smoothly and use a lighter weight than your standard press."
 },
 "Push Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "quads",
   "glutes",
   "traps"
  ],
  "steps": [
   "Hold the barbell at your shoulders with feet shoulder-width apart.",
   "Dip slightly by bending your knees, keeping your torso upright.",
   "Drive up with your legs and press the bar overhead.",
   "Lock out, then lower the bar back to your shoulders."
  ],
  "tip": "Use the leg drive to start the bar and finish the press with your arms."
 },
 "Machine Shoulder Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "traps"
  ],
  "steps": [
   "Adjust the seat so the handles are at shoulder height.",
   "Sit with your back against the pad and grip the handles.",
   "Press the handles up until your arms are nearly straight.",
   "Lower under control to the starting position."
  ],
  "tip": "Keep your back against the pad and do not shrug during the press."
 },
 "Front Raise": {
  "p": [
   "delts_front"
  ],
  "s": [
   "delts_side",
   "chest",
   "traps"
  ],
  "steps": [
   "Stand holding dumbbells in front of your thighs.",
   "Keep a slight bend in your elbows and brace your core.",
   "Raise the weights forward to shoulder height.",
   "Lower them slowly without swinging."
  ],
  "tip": "Avoid leaning back or using momentum to lift the weights."
 },
 "Cable Lateral Raise": {
  "p": [
   "delts_side"
  ],
  "s": [
   "delts_front",
   "traps"
  ],
  "steps": [
   "Stand sideways to a low cable and grip the handle with the far hand.",
   "Keep a slight bend in your elbow.",
   "Raise your arm out to the side up to shoulder height.",
   "Lower slowly against the cable tension."
  ],
  "tip": "Lead with your elbow and keep your shoulder away from your ear."
 },
 "Rear Delt Fly": {
  "p": [
   "delts_rear"
  ],
  "s": [
   "upper_back",
   "traps"
  ],
  "steps": [
   "Hinge forward at the hips with a flat back, holding dumbbells below your chest.",
   "Keep a slight bend in your elbows.",
   "Raise your arms out to the sides to shoulder height.",
   "Lower slowly under control."
  ],
  "tip": "Squeeze your shoulder blades gently and avoid swinging your torso."
 },
 "Reverse Pec Deck": {
  "p": [
   "delts_rear"
  ],
  "s": [
   "upper_back",
   "traps"
  ],
  "steps": [
   "Sit facing the pad and grip the handles with arms extended.",
   "Keep your chest against the pad and a slight bend in your elbows.",
   "Pull your arms back and out to the sides.",
   "Return slowly without letting the weights drop."
  ],
  "tip": "Keep your shoulders down and avoid shrugging as you pull."
 },
 "Upright Row": {
  "p": [
   "delts_side",
   "traps"
  ],
  "s": [
   "biceps",
   "delts_front",
   "forearms"
  ],
  "steps": [
   "Stand holding a barbell in front of your thighs with a shoulder-width grip.",
   "Pull the bar up along your body, leading with your elbows.",
   "Raise it to about chest height, elbows at or below shoulder level.",
   "Lower the bar slowly to the start."
  ],
  "tip": "Use a comfortable grip width and keep the bar close to your body."
 },
 "Landmine Shoulder Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "chest",
   "abs"
  ],
  "steps": [
   "Set one end of a barbell in a landmine anchor and hold the other end at your shoulder.",
   "Stand with feet staggered and core braced.",
   "Press the bar up and forward until your arm is extended.",
   "Lower it under control to your shoulder."
  ],
  "tip": "Keep your torso upright and avoid leaning back as you press."
 },
 "Seated Barbell Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "traps",
   "upper_back"
  ],
  "steps": [
   "Sit on a bench with back support and grip the bar just outside shoulder width.",
   "Lift the bar off the rack and hold it at upper-chest level.",
   "Press it overhead until your arms are nearly straight.",
   "Lower the bar slowly back to your upper chest."
  ],
  "tip": "Brace your core and keep your forearms vertical during the press."
 },
 "Pike Push-Up": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "chest",
   "upper_back"
  ],
  "steps": [
   "Start in a push-up position and walk your feet in so your hips rise.",
   "Keep your legs straight and your body in an inverted V.",
   "Bend your elbows to lower your head toward the floor.",
   "Press back up to the start."
  ],
  "tip": "Keep your elbows at about 45 degrees rather than flaring them out."
 },
 "Cable Rear Delt Fly": {
  "p": [
   "delts_rear"
  ],
  "s": [
   "upper_back",
   "traps"
  ],
  "steps": [
   "Set two cable handles at shoulder height and cross the cables to grip them.",
   "Step back with a slight bend in your elbows.",
   "Pull your arms out and back in a wide arc.",
   "Return slowly under control."
  ],
  "tip": "Keep your torso still and move only your arms."
 },
 "Kettlebell Press": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "triceps",
   "traps",
   "abs"
  ],
  "steps": [
   "Hold the kettlebell in the rack position at your shoulder.",
   "Brace your core and keep your wrist straight.",
   "Press the kettlebell overhead until your arm is straight.",
   "Lower it back to the rack position under control."
  ],
  "tip": "Squeeze your glutes and keep your ribs down to protect your lower back."
 },
 "EZ-Bar Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms",
   "delts_front"
  ],
  "steps": [
   "Stand holding an EZ-bar with an underhand grip on the angled sections.",
   "Keep your elbows close to your sides.",
   "Curl the bar up toward your shoulders.",
   "Lower it slowly until your arms are straight."
  ],
  "tip": "Keep your elbows pinned and avoid swinging your torso."
 },
 "Dumbbell Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms",
   "delts_front"
  ],
  "steps": [
   "Stand holding dumbbells at your sides with palms facing forward.",
   "Keep your elbows close to your torso.",
   "Curl the weights up toward your shoulders.",
   "Lower them slowly to full extension."
  ],
  "tip": "Control the lowering phase and avoid using body momentum."
 },
 "Incline Dumbbell Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms",
   "delts_front"
  ],
  "steps": [
   "Sit back on an incline bench with dumbbells hanging at your sides.",
   "Keep your upper arms still and behind your torso.",
   "Curl the weights up toward your shoulders.",
   "Lower slowly until your arms are fully extended."
  ],
  "tip": "Let your arms hang straight down to get a full stretch at the bottom."
 },
 "Preacher Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Sit at a preacher bench with your upper arms resting on the pad.",
   "Grip the bar with an underhand grip.",
   "Curl the bar up toward your shoulders.",
   "Lower slowly until your arms are nearly straight."
  ],
  "tip": "Do not drop the weight at the bottom; lower it with control."
 },
 "Concentration Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Sit on a bench and rest your elbow against your inner thigh.",
   "Hold a dumbbell with your arm extended.",
   "Curl the weight up toward your shoulder.",
   "Lower it slowly to full extension."
  ],
  "tip": "Keep your upper arm still and avoid leaning your torso to lift."
 },
 "Cable Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Stand facing a low cable with a straight or EZ-bar attachment.",
   "Keep your elbows close to your sides.",
   "Curl the handle up toward your shoulders.",
   "Lower slowly against the cable tension."
  ],
  "tip": "Keep constant tension by controlling the weight all the way down."
 },
 "Spider Curl": {
  "p": [
   "biceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Lie chest-down on an incline bench holding dumbbells with arms hanging.",
   "Keep your upper arms vertical and still.",
   "Curl the weights up toward your shoulders.",
   "Lower slowly to full extension."
  ],
  "tip": "Avoid swinging; let your upper arms stay perpendicular to the floor."
 },
 "Reverse Curl": {
  "p": [
   "forearms",
   "biceps"
  ],
  "s": [
   "delts_front"
  ],
  "steps": [
   "Stand holding a barbell with an overhand grip, hands shoulder-width apart.",
   "Keep your elbows tight to your sides.",
   "Curl the bar up toward your shoulders.",
   "Lower it slowly to the start."
  ],
  "tip": "Keep your wrists straight and use a lighter weight than your normal curl."
 },
 "Overhead Triceps Extension": {
  "p": [
   "triceps"
  ],
  "s": [
   "delts_front",
   "abs"
  ],
  "steps": [
   "Hold one dumbbell with both hands overhead and arms extended.",
   "Keep your elbows pointing forward and close to your head.",
   "Bend your elbows to lower the weight behind your head.",
   "Extend your arms to return to the top."
  ],
  "tip": "Keep your ribs down and your upper arms still throughout."
 },
 "Cable Overhead Triceps Extension": {
  "p": [
   "triceps"
  ],
  "s": [
   "delts_front",
   "abs"
  ],
  "steps": [
   "Attach a rope to a high or low cable and face away from the machine.",
   "Hold the rope overhead with your elbows bent and close to your head.",
   "Extend your arms forward and up until straight.",
   "Return slowly to the start."
  ],
  "tip": "Keep your elbows fixed in place and avoid arching your lower back."
 },
 "Triceps Kickback": {
  "p": [
   "triceps"
  ],
  "s": [
   "delts_rear"
  ],
  "steps": [
   "Hinge forward with a flat back and your upper arm parallel to the floor.",
   "Hold a dumbbell with your elbow bent at 90 degrees.",
   "Extend your arm straight back.",
   "Return slowly without moving your upper arm."
  ],
  "tip": "Keep your upper arm still and squeeze your triceps at the top."
 },
 "Close-Grip Push-Up": {
  "p": [
   "triceps",
   "chest"
  ],
  "s": [
   "delts_front",
   "abs"
  ],
  "steps": [
   "Start in a plank with your hands closer than shoulder-width.",
   "Keep your body in a straight line.",
   "Lower your chest toward your hands with elbows close to your ribs.",
   "Press back up to the start."
  ],
  "tip": "Keep your elbows tucked and your core tight so your hips do not sag."
 },
 "Bench Dip": {
  "p": [
   "triceps"
  ],
  "s": [
   "chest",
   "delts_front"
  ],
  "steps": [
   "Sit on a bench edge with hands beside your hips and legs forward.",
   "Slide your hips off the bench with arms straight.",
   "Bend your elbows to lower your body until about 90 degrees.",
   "Press back up to straight arms."
  ],
  "tip": "Keep your hips close to the bench and avoid sinking your shoulders too low."
 },
 "Rope Pushdown": {
  "p": [
   "triceps"
  ],
  "s": [
   "forearms"
  ],
  "steps": [
   "Attach a rope to a high cable and stand facing the machine.",
   "Keep your elbows pinned to your sides.",
   "Push the rope down until your arms are straight, spreading the ends.",
   "Let your hands rise slowly to the start."
  ],
  "tip": "Keep your elbows fixed and your torso upright rather than leaning over the weight."
 },
 "EZ-Bar Skull Crusher": {
  "p": [
   "triceps"
  ],
  "s": [
   "delts_front",
   "forearms"
  ],
  "steps": [
   "Lie on a bench holding an EZ-bar over your chest with arms extended.",
   "Keep your upper arms still and bend your elbows.",
   "Lower the bar toward your forehead or just behind your head.",
   "Extend your arms to return to the top."
  ],
  "tip": "Use a controlled tempo and a weight you can lower safely."
 },
 "Wrist Curl": {
  "p": [
   "forearms"
  ],
  "s": [],
  "steps": [
   "Sit with your forearms resting on your thighs, palms up, holding a barbell.",
   "Let the bar roll toward your fingertips.",
   "Curl your wrists up as high as possible.",
   "Lower slowly under control."
  ],
  "tip": "Keep your forearms still on your legs and use a light weight with full range."
 },
 "Reverse Wrist Curl": {
  "p": [
   "forearms"
  ],
  "s": [],
  "steps": [
   "Sit with your forearms on your thighs, palms down, holding a barbell.",
   "Let your wrists lower gently.",
   "Extend your wrists to lift the bar up.",
   "Lower slowly under control."
  ],
  "tip": "Use a light weight and move only at the wrists."
 },
 "Farmer's Carry": {
  "p": [
   "forearms",
   "traps"
  ],
  "s": [
   "abs",
   "obliques",
   "glutes",
   "quads"
  ],
  "steps": [
   "Pick up a heavy dumbbell in each hand and stand tall.",
   "Brace your core and keep your shoulders back and down.",
   "Walk with short, steady steps for the set distance.",
   "Set the weights down under control."
  ],
  "tip": "Keep your torso upright and avoid leaning to either side."
 },
 "Ab Wheel Rollout": {
  "p": [
   "abs"
  ],
  "s": [
   "lats",
   "delts_front",
   "obliques",
   "lower_back"
  ],
  "steps": [
   "Kneel on the floor holding an ab wheel under your shoulders.",
   "Brace your core and tuck your pelvis slightly.",
   "Roll forward as far as you can keep your back flat.",
   "Pull the wheel back with your abs to the start."
  ],
  "tip": "Stop before your lower back sags and shorten the range if needed."
 },
 "Crunch": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques"
  ],
  "steps": [
   "Lie on your back with knees bent and feet flat.",
   "Place your hands lightly behind your head or across your chest.",
   "Curl your shoulders off the floor by contracting your abs.",
   "Lower slowly back down."
  ],
  "tip": "Lift with your abs rather than pulling on your neck."
 },
 "Sit-Up": {
  "p": [
   "abs"
  ],
  "s": [
   "quads",
   "obliques"
  ],
  "steps": [
   "Lie on your back with knees bent and feet flat.",
   "Cross your arms over your chest or place hands by your ears.",
   "Curl your torso all the way up toward your knees.",
   "Lower slowly back to the floor."
  ],
  "tip": "Move with control instead of using momentum or pulling on your head."
 },
 "Russian Twist": {
  "p": [
   "obliques"
  ],
  "s": [
   "abs"
  ],
  "steps": [
   "Sit with knees bent and lean back slightly with a straight back.",
   "Hold your hands together or hold a weight at your chest.",
   "Rotate your torso to one side.",
   "Rotate to the other side in a controlled motion."
  ],
  "tip": "Rotate through your torso rather than just moving your arms."
 },
 "Side Plank": {
  "p": [
   "obliques"
  ],
  "s": [
   "abs",
   "glutes",
   "delts_side"
  ],
  "steps": [
   "Lie on your side with your elbow under your shoulder and legs stacked.",
   "Lift your hips so your body forms a straight line.",
   "Keep your core and glutes tight.",
   "Hold for the set time, then switch sides."
  ],
  "tip": "Keep your hips lifted and your body in a straight line."
 },
 "Dead Bug": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques",
   "quads"
  ],
  "steps": [
   "Lie on your back with arms up and knees bent at 90 degrees over your hips.",
   "Press your lower back gently toward the floor.",
   "Lower your opposite arm and leg toward the floor.",
   "Return to the start and repeat on the other side."
  ],
  "tip": "Keep your lower back pressed down as your limbs move."
 },
 "Bicycle Crunch": {
  "p": [
   "abs",
   "obliques"
  ],
  "s": [
   "quads"
  ],
  "steps": [
   "Lie on your back with hands lightly behind your head.",
   "Lift your shoulders and bring your knees up.",
   "Rotate to bring one elbow toward the opposite knee while extending the other leg.",
   "Switch sides in a smooth pedaling motion."
  ],
  "tip": "Rotate your torso rather than pulling on your neck."
 },
 "Mountain Climber": {
  "p": [
   "abs",
   "quads"
  ],
  "s": [
   "delts_front",
   "obliques",
   "triceps"
  ],
  "steps": [
   "Start in a high plank with hands under your shoulders.",
   "Keep your body in a straight line.",
   "Drive one knee toward your chest.",
   "Switch legs quickly in a running motion."
  ],
  "tip": "Keep your hips level and your core tight throughout."
 },
 "Cable Woodchop": {
  "p": [
   "obliques"
  ],
  "s": [
   "abs",
   "delts_front",
   "glutes"
  ],
  "steps": [
   "Set a cable at a high position and stand sideways to the machine.",
   "Grip the handle with both hands and brace your core.",
   "Pull the cable diagonally down across your body.",
   "Return slowly to the start."
  ],
  "tip": "Rotate through your torso and hips and keep your arms mostly straight."
 },
 "Pallof Press": {
  "p": [
   "obliques",
   "abs"
  ],
  "s": [
   "delts_front",
   "glutes"
  ],
  "steps": [
   "Set a cable at chest height and stand sideways to the machine.",
   "Hold the handle at your chest with both hands.",
   "Press the handle straight out in front of you.",
   "Hold briefly, then bring it back to your chest."
  ],
  "tip": "Resist the cable's pull and do not let your torso rotate."
 },
 "Hanging Knee Raise": {
  "p": [
   "abs"
  ],
  "s": [
   "forearms",
   "lats",
   "quads"
  ],
  "steps": [
   "Hang from a pull-up bar with arms straight.",
   "Brace your core and avoid swinging.",
   "Raise your knees toward your chest.",
   "Lower your legs slowly."
  ],
  "tip": "Curl your pelvis up and avoid using momentum."
 },
 "Toes to Bar": {
  "p": [
   "abs"
  ],
  "s": [
   "lats",
   "forearms",
   "quads"
  ],
  "steps": [
   "Hang from a pull-up bar with a firm grip.",
   "Pull the bar toward you slightly to engage your lats.",
   "Raise your straight legs until your toes touch the bar.",
   "Lower your legs slowly under control."
  ],
  "tip": "Build up with knee raises first and avoid uncontrolled swinging."
 },
 "Hollow Hold": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques",
   "quads"
  ],
  "steps": [
   "Lie on your back with your arms extended overhead.",
   "Press your lower back into the floor.",
   "Lift your shoulders and legs a few inches off the ground.",
   "Hold the position, breathing steadily."
  ],
  "tip": "Keep your lower back flat; raise your legs higher if it arches."
 },
 "Machine Crunch": {
  "p": [
   "abs"
  ],
  "s": [
   "obliques"
  ],
  "steps": [
   "Sit in the machine and adjust the seat and pads for your height.",
   "Grip the handles and set your feet.",
   "Curl your torso forward by contracting your abs.",
   "Return slowly to the start."
  ],
  "tip": "Move with your abs, not your arms or hips."
 },
 "Decline Sit-Up": {
  "p": [
   "abs"
  ],
  "s": [
   "quads",
   "obliques"
  ],
  "steps": [
   "Lie on a decline bench and secure your feet under the pads.",
   "Cross your arms over your chest.",
   "Curl your torso up toward your knees.",
   "Lower slowly back down."
  ],
  "tip": "Avoid yanking your neck; keep the movement controlled."
 },
 "Bird Dog": {
  "p": [
   "abs",
   "lower_back"
  ],
  "s": [
   "glutes",
   "delts_front",
   "obliques"
  ],
  "steps": [
   "Start on hands and knees with a neutral spine.",
   "Extend one arm forward and the opposite leg back.",
   "Hold briefly without rotating your hips.",
   "Return to the start and switch sides."
  ],
  "tip": "Keep your hips level and your spine neutral as you reach."
 },
 "Treadmill Run": {
  "p": [
   "quads",
   "hamstrings",
   "calves"
  ],
  "s": [
   "glutes",
   "abs"
  ],
  "steps": [
   "Start the treadmill at a slow warm-up pace.",
   "Stand tall with a relaxed upper body and land softly.",
   "Increase to your target speed gradually.",
   "Slow down to a walk for a cool-down at the end."
  ],
  "tip": "Keep a relaxed posture and avoid holding the handrails while running."
 },
 "Rowing Machine": {
  "p": [
   "lats",
   "quads"
  ],
  "s": [
   "hamstrings",
   "glutes",
   "upper_back",
   "biceps",
   "lower_back",
   "abs"
  ],
  "steps": [
   "Sit with feet strapped in and grip the handle with arms straight.",
   "Push with your legs first, then lean back slightly.",
   "Pull the handle to your lower chest.",
   "Extend your arms, hinge forward, then bend your knees to return."
  ],
  "tip": "Drive with your legs first and keep your back straight."
 },
 "Stationary Bike": {
  "p": [
   "quads",
   "hamstrings"
  ],
  "s": [
   "glutes",
   "calves"
  ],
  "steps": [
   "Adjust the seat so your knees are slightly bent at the bottom of each pedal stroke.",
   "Sit tall and rest your hands lightly on the handlebars.",
   "Pedal at a steady cadence.",
   "Adjust resistance for your target effort."
  ],
  "tip": "Set the seat height correctly and keep your upper body relaxed."
 },
 "Elliptical": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "hamstrings",
   "calves"
  ],
  "steps": [
   "Step onto the pedals and hold the handles.",
   "Stand tall with your core engaged.",
   "Move in a smooth, continuous striding motion.",
   "Adjust resistance and incline as needed."
  ],
  "tip": "Keep your weight through your feet and avoid leaning on the handles."
 },
 "Stair Climber": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "calves",
   "hamstrings"
  ],
  "steps": [
   "Step onto the machine and hold the rails lightly.",
   "Stand upright with your core engaged.",
   "Step steadily, placing your whole foot on each step.",
   "Adjust the speed to maintain good posture."
  ],
  "tip": "Avoid leaning heavily on the rails so your legs do the work."
 },
 "Jump Rope": {
  "p": [
   "calves"
  ],
  "s": [
   "quads",
   "delts_front",
   "forearms"
  ],
  "steps": [
   "Hold the rope handles at hip height with elbows close to your sides.",
   "Swing the rope using your wrists.",
   "Jump just high enough to clear the rope.",
   "Land softly on the balls of your feet."
  ],
  "tip": "Keep your jumps small and land softly on the balls of your feet."
 },
 "Burpee": {
  "p": [
   "quads",
   "chest"
  ],
  "s": [
   "glutes",
   "triceps",
   "delts_front",
   "abs",
   "hamstrings",
   "calves"
  ],
  "steps": [
   "Stand with feet shoulder-width apart, then squat down and place your hands on the floor.",
   "Jump or step your feet back into a plank.",
   "Perform a push-up, then jump your feet back toward your hands.",
   "Jump up explosively with your arms overhead."
  ],
  "tip": "Keep your core tight in the plank so your hips do not sag."
 },
 "Kettlebell Swing": {
  "p": [
   "glutes",
   "hamstrings"
  ],
  "s": [
   "lower_back",
   "quads",
   "delts_front",
   "abs",
   "forearms"
  ],
  "steps": [
   "Stand with feet wider than shoulder-width and the kettlebell in front of you.",
   "Hinge at the hips and grip the handle with both hands.",
   "Snap your hips forward to swing the bell to chest height.",
   "Let it swing back and hinge into the next rep."
  ],
  "tip": "Power the swing with your hips, not by lifting with your arms."
 },
 "Battle Ropes": {
  "p": [
   "delts_front",
   "delts_side"
  ],
  "s": [
   "forearms",
   "abs",
   "biceps",
   "quads",
   "upper_back"
  ],
  "steps": [
   "Hold one rope end in each hand and stand in a slight squat.",
   "Brace your core and keep your chest up.",
   "Move your arms up and down in alternating waves.",
   "Maintain the pace for the set time."
  ],
  "tip": "Keep your core braced and your legs slightly bent throughout."
 },
 "Box Jump": {
  "p": [
   "quads",
   "glutes"
  ],
  "s": [
   "calves",
   "hamstrings"
  ],
  "steps": [
   "Stand facing a sturdy box with feet shoulder-width apart.",
   "Swing your arms back and bend into a quarter squat.",
   "Jump explosively onto the box, landing softly with both feet.",
   "Stand tall, then step back down."
  ],
  "tip": "Step down rather than jumping down, and use a box height you can land on safely."
 }
};
