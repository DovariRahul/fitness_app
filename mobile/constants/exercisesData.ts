export interface ExerciseItem {
  id: string;
  name: string;
  target: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'upper' | 'lower' | 'core' | 'cardio' | 'flexibility';
  isNoEquipment: boolean;
  isPopular?: boolean;
  description: string;
  image: string;
  recommended: string;
  tips: string[];
  aiAlternative: {
    easier: { name: string; reason: string };
    harder: { name: string; reason: string };
    variation: { name: string; reason: string };
  };
}

export const EXERCISE_CATEGORIES = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'upper', label: 'Upper Body', icon: '💪' },
  { id: 'lower', label: 'Lower Body', icon: '🦵' },
  { id: 'core', label: 'Core', icon: '🔥' },
  { id: 'cardio', label: 'Cardio', icon: '❤️' },
  { id: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { id: 'no_equipment', label: 'No Equipment', icon: '🏠' },
];

export const QUICK_10_MIN_WORKOUT = {
  id: 'quick-10-min',
  title: '10-Minute Quick Workout',
  subtitle: 'High-efficiency blast • No equipment required',
  duration: '10 min',
  calories: '110 kcal',
  level: 'All Levels',
  exercises: [
    { name: 'Jumping Jacks', spec: '30 sec' },
    { name: 'Bodyweight Squats', spec: '15 reps' },
    { name: 'Push-Ups', spec: '10 reps' },
    { name: 'Mountain Climbers', spec: '30 sec' },
    { name: 'Reverse Lunges', spec: '10 / leg' },
    { name: 'Plank Hold', spec: '30 sec' },
  ],
};

export const ALL_EXERCISES: ExerciseItem[] = [
  // ── 1. UPPER BODY ──────────────────────────────────────────
  {
    id: 'push-ups',
    name: 'Push-Ups',
    target: 'Chest, Triceps',
    difficulty: 'Beginner',
    category: 'upper',
    isNoEquipment: true,
    isPopular: true,
    description:
      'A foundational bodyweight exercise where you lower and push your body while maintaining a rigid, straight line from head to heels.',
    image:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 10–12 reps',
    tips: [
      'Keep elbows at a 45-degree angle to protect shoulders',
      'Brace your core and squeeze glutes to prevent hip sagging',
      'Lower until chest is roughly an inch off the floor',
    ],
    aiAlternative: {
      easier: { name: 'Incline Push-Ups', reason: 'Elevating hands reduces the percentage of bodyweight you press.' },
      harder: { name: 'Diamond Push-Ups', reason: 'Narrow grip significantly increases triceps activation.' },
      variation: { name: 'Plank Shoulder Taps', reason: 'Adds dynamic anti-rotational core stability.' },
    },
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-Ups',
    target: 'Shoulders, Triceps',
    difficulty: 'Intermediate',
    category: 'upper',
    isNoEquipment: true,
    isPopular: false,
    description:
      'A shoulder-focused push-up performed with the hips raised high into an inverted V, shifting the load vertically.',
    image:
      'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 8–10 reps',
    tips: [
      'Keep head in line with arms throughout the motion',
      'Lower the crown of your head slightly in front of your hands',
      'Press through the palms and lock shoulders at the top',
    ],
    aiAlternative: {
      easier: { name: 'Downward Dog Hold', reason: 'Builds isometric shoulder tolerance without pressing load.' },
      harder: { name: 'Elevated Feet Pike Push-Up', reason: 'Increases vertical load onto deltoids.' },
      variation: { name: 'Superman Hold', reason: 'Engages posterior deltoids and upper back instead of front.' },
    },
  },
  {
    id: 'diamond-push-ups',
    name: 'Diamond Push-Ups',
    target: 'Chest, Triceps',
    difficulty: 'Intermediate',
    category: 'upper',
    isNoEquipment: true,
    isPopular: false,
    description:
      'A push-up variation with thumb and index fingers touching in a diamond shape under your chest to isolate triceps.',
    image:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 8–12 reps',
    tips: [
      'Position hands directly under center of sternum',
      'Keep elbows pinned close to your ribcage',
      'Control the eccentric lowering phase for 2 seconds',
    ],
    aiAlternative: {
      easier: { name: 'Knee Diamond Push-Ups', reason: 'Takes pressure off shoulders while focusing on arms.' },
      harder: { name: 'Decline Diamond Push-Ups', reason: 'Intensifies chest upper fibers and triceps.' },
      variation: { name: 'Close-Grip Wall Push-Ups', reason: 'Gentle triceps focus for rehabilitation or warm-ups.' },
    },
  },
  {
    id: 'incline-push-ups',
    name: 'Incline Push-Ups',
    target: 'Chest, Shoulders',
    difficulty: 'Beginner',
    category: 'upper',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Perform push-ups with your hands elevated on a bench, table, or wall to safely build upper body pushing strength.',
    image:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 12–15 reps',
    tips: [
      'Choose a stable surface at bench or chair height',
      'Maintain flat spine and do not let your hips dip',
      'Touch lower chest to edge of surface smoothly',
    ],
    aiAlternative: {
      easier: { name: 'Wall Push-Ups', reason: 'Minimal gravitational resistance for joint-friendly conditioning.' },
      harder: { name: 'Standard Push-Ups', reason: 'Full horizontal bodyweight load.' },
      variation: { name: 'Incline Plank Hold', reason: 'Isolates core and shoulder stabilizers.' },
    },
  },
  {
    id: 'superman',
    name: 'Superman',
    target: 'Back, Shoulders',
    difficulty: 'Beginner',
    category: 'upper',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Lie face down and raise your arms, chest, and legs simultaneously to strengthen your spinal erectors and upper back.',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 12 reps or 30s holds',
    tips: [
      'Gaze downward at the mat to maintain a neutral neck',
      'Squeeze shoulder blades together at the peak',
      'Hold the contraction for 2 seconds before lowering',
    ],
    aiAlternative: {
      easier: { name: 'Bird-Dog', reason: 'Alternates limbs on all fours with less lower back stress.' },
      harder: { name: 'Superman Swimmers', reason: 'Adds dynamic pulsing flutter for endurance.' },
      variation: { name: 'Cobra Stretch', reason: 'Releases spinal compression.' },
    },
  },
  {
    id: 'plank-shoulder-taps',
    name: 'Plank Shoulder Taps',
    target: 'Shoulders, Core',
    difficulty: 'Intermediate',
    category: 'upper',
    isNoEquipment: true,
    isPopular: false,
    description:
      'From a high plank position, alternately tap each shoulder with the opposite hand while keeping hips completely still.',
    image:
      'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 20 total taps (10/side)',
    tips: [
      'Widen foot stance to shoulder-width for stability',
      'Imagine balancing a cup of water on your lower back',
      'Slow, deliberate taps prevent hip swaying',
    ],
    aiAlternative: {
      easier: { name: 'Kneeling Shoulder Taps', reason: 'Reduces lever length while preserving anti-rotation cues.' },
      harder: { name: 'Feet-Elevated Shoulder Taps', reason: 'Elevates load on deltoids and deep core.' },
      variation: { name: 'High Plank Hold', reason: 'Pure isometric core endurance.' },
    },
  },

  // ── 2. LOWER BODY ──────────────────────────────────────────
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    target: 'Quads, Glutes',
    difficulty: 'Beginner',
    category: 'lower',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Lower your hips into a deep squat with chest upright and knees tracking over toes, then drive through midfoot to stand.',
    image:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 15 reps',
    tips: [
      'Feet shoulder-width apart with toes slightly turned out',
      'Keep chest proud and drive knees outward',
      'Aim for thighs parallel to ground or deeper',
    ],
    aiAlternative: {
      easier: { name: 'Box / Chair Squat', reason: 'Safe depth guide for beginners and protects knees.' },
      harder: { name: 'Jump Squats', reason: 'Adds explosive plyometric power.' },
      variation: { name: 'Wall Sit', reason: 'Isometric quad burnout without joint movement.' },
    },
  },
  {
    id: 'reverse-lunges',
    name: 'Reverse Lunges',
    target: 'Quads, Glutes',
    difficulty: 'Beginner',
    category: 'lower',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Step backward and lower your body until both knees form 90-degree angles before returning smoothly to standing.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 10 reps per leg',
    tips: [
      'Keep front knee directly above front ankle',
      'Torso slightly hinged forward to load glutes',
      'Step back gently without letting knee slam the floor',
    ],
    aiAlternative: {
      easier: { name: 'Static Split Squat', reason: 'Removes the step-back balance requirement.' },
      harder: { name: 'Bulgarian Split Squat', reason: 'Elevating rear foot places 85%+ load on front leg.' },
      variation: { name: 'Curtsy Lunges', reason: 'Targets outer glutes (glute medius).' },
    },
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    target: 'Quads, Glutes',
    difficulty: 'Intermediate',
    category: 'lower',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Perform a single-leg squat with your rear foot elevated on a chair or bench, creating high unilateral tension.',
    image:
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 8–10 reps per leg',
    tips: [
      'Hop forward so your front knee stays behind toes during descent',
      'Lower straight down like an elevator, not forward like an escalator',
      'Drive through front heel to engage glutes',
    ],
    aiAlternative: {
      easier: { name: 'Reverse Lunges', reason: 'Both feet remain on the floor for balanced support.' },
      harder: { name: 'Deficit Split Squat', reason: 'Increases range of motion below parallel.' },
      variation: { name: 'Glute Bridge', reason: 'Emphasizes hip extension without quad fatigue.' },
    },
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    target: 'Glutes, Hamstrings',
    difficulty: 'Beginner',
    category: 'lower',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Lie on your back with knees bent and drive through your heels to raise your hips while squeezing your glutes tightly at the top.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 15 reps with 2s hold',
    tips: [
      'Feet hip-width apart and close enough to touch heels with fingertips',
      'Do not overarch your lower back at top peak',
      'Focus the mind-muscle contraction squarely on glutes',
    ],
    aiAlternative: {
      easier: { name: 'Isometric Glute Squeeze', reason: 'Gentle pelvis tilt suitable for injury recovery.' },
      harder: { name: 'Single-Leg Glute Bridge', reason: 'Doubles unilateral load and fixes muscle imbalances.' },
      variation: { name: 'Hamstring Walkouts', reason: 'Transfers tension further into the posterior hamstrings.' },
    },
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    target: 'Quads',
    difficulty: 'Beginner',
    category: 'lower',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Hold a seated 90-degree position against a flat wall with knees bent, creating an intense isometric burn in the thighs.',
    image:
      'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 30–45 sec holds',
    tips: [
      'Keep thighs parallel to the ground and knees above ankles',
      'Press entire back flat against wall (no hands on knees)',
      'Breathe steadily throughout the hold',
    ],
    aiAlternative: {
      easier: { name: 'Higher-Angle Wall Sit (120°)', reason: 'Less joint strain while building initial strength.' },
      harder: { name: 'Single-Leg Wall Sit', reason: 'Extreme unilateral quad and hip flexor test.' },
      variation: { name: 'Bodyweight Squats', reason: 'Dynamic movement through full joint range.' },
    },
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    target: 'Calves',
    difficulty: 'Beginner',
    category: 'lower',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Stand tall and raise your heels smoothly as high as possible onto the balls of your feet, then slowly control the descent.',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 20 reps',
    tips: [
      'Pause at the very top for a 1-second peak squeeze',
      'Take 2 full seconds to lower your heels down',
      'Keep ankles straight without rolling outward',
    ],
    aiAlternative: {
      easier: { name: 'Seated Calf Raises', reason: 'Eliminates bodyweight load for rehabilitation.' },
      harder: { name: 'Single-Leg Calf Raises', reason: 'Full bodyweight focused on one ankle complex.' },
      variation: { name: 'Deficit Calf Raises (on step)', reason: 'Deeper stretch below parallel.' },
    },
  },

  // ── 3. CORE EXERCISES ──────────────────────────────────────
  {
    id: 'plank',
    name: 'Plank',
    target: 'Core, Abs',
    difficulty: 'Beginner',
    category: 'core',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Hold a rigid straight-body position supporting yourself on forearms or hands, engaging transverse abdominis and stabilizers.',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 30–60 sec holds',
    tips: [
      'Keep elbows aligned directly below your shoulders',
      'Squeeze glutes and tuck pelvis slightly to protect spine',
      'Do not let lower back bow or hips pike in the air',
    ],
    aiAlternative: {
      easier: { name: 'Knee Plank', reason: 'Reduces lever length while training core bracing.' },
      harder: { name: 'Plank with Shoulder Taps', reason: 'Adds dynamic rotational resistance.' },
      variation: { name: 'Side Plank', reason: 'Shifts tension onto lateral obliques.' },
    },
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    target: 'Obliques, Core',
    difficulty: 'Intermediate',
    category: 'core',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Hold your body sideways supported on one forearm and the edge of your foot, targeting the obliques and quadratus lumborum.',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 30 sec per side',
    tips: [
      'Keep elbow directly beneath shoulder joint',
      'Maintain straight diagonal line from ear to ankles',
      'Lift bottom hip high toward ceiling',
    ],
    aiAlternative: {
      easier: { name: 'Knee Side Plank', reason: 'Lower lever length reduces stress on shoulder.' },
      harder: { name: 'Side Plank with Hip Dips', reason: 'Adds dynamic contraction for oblique definition.' },
      variation: { name: 'Bicycle Crunch', reason: 'Dynamic rotational oblique work.' },
    },
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    target: 'Core, Lower Back',
    difficulty: 'Beginner',
    category: 'core',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Lie on your back and alternate extending opposite arms and legs while pressing your lower back flush against the ground.',
    image:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 12 total reps (6/side)',
    tips: [
      'Maintain 100% contact between lower back and floor',
      'Move arms and legs with slow, deliberate control',
      'Exhale as you extend, inhale as you return',
    ],
    aiAlternative: {
      easier: { name: 'Heel Taps (bent knee)', reason: 'Shorter lever makes it easier to prevent back arching.' },
      harder: { name: 'Hollow Body Hold', reason: 'Sustained full-body tension test.' },
      variation: { name: 'Bird-Dog', reason: 'Prone equivalent of opposite-arm/leg coordination.' },
    },
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    target: 'Core, Shoulders',
    difficulty: 'Intermediate',
    category: 'core',
    isNoEquipment: true,
    isPopular: true,
    description:
      'From a high plank position, drive knees alternately toward your chest in a brisk running motion to fuse core and cardio.',
    image:
      'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 30–45 sec bursts',
    tips: [
      'Keep shoulders stacked directly over wrists',
      'Keep hips down level with torso throughout',
      'Drive knees forward with rhythm and control',
    ],
    aiAlternative: {
      easier: { name: 'Slow-Motion Mountain Climbers', reason: 'Removes bouncing to focus purely on abdominal crunch.' },
      harder: { name: 'Cross-Body Mountain Climbers', reason: 'Drives knee to opposite elbow to engage obliques.' },
      variation: { name: 'High Knees', reason: 'Standing cardiovascular sprint movement.' },
    },
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    target: 'Abs, Obliques',
    difficulty: 'Intermediate',
    category: 'core',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Lie on your back, pedal legs in a cycling motion, and alternately bring each elbow toward the opposite knee with torso rotation.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 20 reps (10/side)',
    tips: [
      'Rotate from your ribcage and shoulders, do not yank your neck',
      'Pause for a beat on each elbow-to-knee touch',
      'Keep extended leg hovering a few inches off the floor',
    ],
    aiAlternative: {
      easier: { name: 'Standard Crunch', reason: 'Removes rotational complexity and neck torque.' },
      harder: { name: 'V-Up Twist', reason: 'Full sit-up with rotation for advanced conditioning.' },
      variation: { name: 'Russian Twists', reason: 'Seated rotational alternative.' },
    },
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    target: 'Lower Abs',
    difficulty: 'Intermediate',
    category: 'core',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Raise straight legs smoothly toward the ceiling while lying on your back, then lower them slowly under control without arching.',
    image:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 12 reps',
    tips: [
      'Hands flat by your hips or slightly under glutes for support',
      'Stop lowering if your lower back begins lifting off the mat',
      'Control the lowering phase over 3 seconds',
    ],
    aiAlternative: {
      easier: { name: 'Reverse Crunches (bent knees)', reason: 'Less strain on lumbar spine and hip flexors.' },
      harder: { name: 'Hanging Leg Raises', reason: 'Hanging from a bar engages lats and full core.' },
      variation: { name: 'Flutter Kicks', reason: 'Continuous alternating micro-reps.' },
    },
  },

  // ── 4. CARDIO EXERCISES ────────────────────────────────────
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    target: 'Full Body, Cardio',
    difficulty: 'Beginner',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Jump while extending your arms overhead and legs outward, then spring back smoothly to starting position to ignite heart rate.',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 45 sec',
    tips: [
      'Land softly on the balls of your feet with knees slightly bent',
      'Reach full arm extension overhead on each rep',
      'Maintain a continuous, brisk breathing rhythm',
    ],
    aiAlternative: {
      easier: { name: 'Step Jacks (no jump)', reason: 'Low impact variation for joints and recovery.' },
      harder: { name: 'Star Jumps', reason: 'Explosive plyometric leap into the air.' },
      variation: { name: 'High Knees', reason: 'High-intensity forward cadence.' },
    },
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    target: 'Cardio, Quads',
    difficulty: 'Beginner',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Sprint in place while driving your knees up toward your chest at hip height, pumping arms in coordination.',
    image:
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 30–45 sec',
    tips: [
      'Land lightly on midfoot, spring back immediately',
      'Keep chest tall and do not lean backward',
      'Drive knees as high as comfortable (hip level)',
    ],
    aiAlternative: {
      easier: { name: 'Marching in Place', reason: 'Low impact with identical movement pattern.' },
      harder: { name: 'Tuck Jumps', reason: 'Double knee drive with maximum explosive power.' },
      variation: { name: 'Butt Kicks', reason: 'Shifts focus back to hamstrings and calves.' },
    },
  },
  {
    id: 'burpees',
    name: 'Burpees',
    target: 'Full Body, Cardio',
    difficulty: 'Advanced',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Drop into a squat, kick feet back into a plank, perform a push-up, jump feet forward, and explode vertically with hands overhead.',
    image:
      'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 8–10 reps',
    tips: [
      'Pace yourself—aim for smooth fluid transitions',
      'Tighten core in the plank to protect lower back',
      'Land with soft knees during the vertical jump',
    ],
    aiAlternative: {
      easier: { name: 'Sprawls (no push-up, no jump)', reason: 'Preserves the cardio transfer without upper exhaustion.' },
      harder: { name: 'Burpee Box Jump', reason: 'Adds box jump for supreme athletic output.' },
      variation: { name: 'Jump Squats', reason: 'Focuses power solely on lower body.' },
    },
  },
  {
    id: 'jump-squats',
    name: 'Jump Squats',
    target: 'Quads, Glutes',
    difficulty: 'Intermediate',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Perform a full squat and explode straight up off the floor into a vertical jump, absorbing the landing softly back into a squat.',
    image:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 12 reps',
    tips: [
      'Sink to 90 degrees before springing upward',
      'Use arm swing to assist vertical momentum',
      'Absorb impact through balls of feet into heels',
    ],
    aiAlternative: {
      easier: { name: 'Bodyweight Squats', reason: 'Zero impact for knees and joints.' },
      harder: { name: 'Tuck Jumps', reason: 'Higher vertical height with knee lift.' },
      variation: { name: 'Skater Jumps', reason: 'Lateral plyometric direction change.' },
    },
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    target: 'Hamstrings, Cardio',
    difficulty: 'Beginner',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Jog in place with a slight forward lean, kicking your heels vigorously toward your glutes on every step.',
    image:
      'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 45 sec',
    tips: [
      'Keep knees pointed down at the mat',
      'Pump arms rhythmically with quick feet cadence',
      'Stay light on your toes for speed',
    ],
    aiAlternative: {
      easier: { name: 'Walking Butt Kicks', reason: 'Gentle hamstring stretch without impact.' },
      harder: { name: 'Fast Feet Shuffles', reason: 'High-speed athletic agility drill.' },
      variation: { name: 'High Knees', reason: 'Front-side knee drive counterpart.' },
    },
  },
  {
    id: 'skater-jumps',
    name: 'Skater Jumps',
    target: 'Legs, Cardio',
    difficulty: 'Intermediate',
    category: 'cardio',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Leap laterally from one foot to the other in a skating motion, bending knees to absorb the landing with single-leg balance.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    recommended: '3 sets • 20 total jumps (10/side)',
    tips: [
      'Push off outside edge of the plant foot',
      'Reach opposite arm across for counter-balance',
      'Stick the landing for a half-second before leaping back',
    ],
    aiAlternative: {
      easier: { name: 'Curtsy Lunges', reason: 'Controlled step without airborne lateral impact.' },
      harder: { name: 'Wide Bound Skaters', reason: 'Maximum horizontal leap distance.' },
      variation: { name: 'Jump Squats', reason: 'Vertical trajectory instead of lateral.' },
    },
  },

  // ── 5. FLEXIBILITY & MOBILITY ──────────────────────────────
  {
    id: 'cat-cow-stretch',
    name: 'Cat-Cow Stretch',
    target: 'Spine, Core',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: true,
    description:
      'On hands and knees, smoothly alternate between arching your spine (cow) with an inhale, and rounding your back (cat) with an exhale.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 10 slow breath cycles',
    tips: [
      'Wrists directly under shoulders, knees under hips',
      'Move vertebra by vertebra starting from tailbone',
      'Sync every movement with deep belly breathing',
    ],
    aiAlternative: {
      easier: { name: 'Seated Cat-Cow', reason: 'Can be done sitting in a chair for office relief.' },
      harder: { name: 'Thread the Needle Flow', reason: 'Adds thoracic spine rotation to flexion/extension.' },
      variation: { name: 'Child’s Pose', reason: 'Static resting stretch for lower back.' },
    },
  },
  {
    id: 'childs-pose',
    name: 'Child’s Pose',
    target: 'Back, Hips',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: true,
    description:
      'Kneel on the floor, sit back toward your heels, fold forward, and rest your forehead on the ground while extending arms forward.',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 60 sec holds',
    tips: [
      'Widen knees to create room for deep torso sink',
      'Crawl fingertips forward to lengthen latissimus dorsi',
      'Breathe deeply into the back of your ribcage',
    ],
    aiAlternative: {
      easier: { name: 'Supported Child’s Pose (with pillow)', reason: 'Removes pressure from stiff knees and ankles.' },
      harder: { name: 'Extended Puppy Pose', reason: 'Deeper shoulder and thoracic opening.' },
      variation: { name: 'Cat-Cow Stretch', reason: 'Dynamic mobility instead of static hold.' },
    },
  },
  {
    id: 'cobra-stretch',
    name: 'Cobra Stretch',
    target: 'Abdomen, Spine',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: false,
    description:
      'From a lying position, gently press into your hands to raise your chest and lengthen the abdominal wall and spine.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 30–45 sec holds',
    tips: [
      'Roll shoulders down and away from your ears',
      'Keep pelvis resting flat on the ground',
      'Soft bend in elbows prevents locking joints',
    ],
    aiAlternative: {
      easier: { name: 'Sphinx Pose (on forearms)', reason: 'Gentler lower back arch on elbows.' },
      harder: { name: 'Upward-Facing Dog', reason: 'Thighs lift off the mat for full body extension.' },
      variation: { name: 'Cat-Cow Stretch', reason: 'Dynamic back flexion and extension.' },
    },
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    target: 'Hips, Quads',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Drop into a low lunge with back knee down, tuck your pelvis forward, and gently stretch the front of your hip.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 45 sec per side',
    tips: [
      'Squeeze the glute of the back leg to release hip flexor',
      'Keep torso upright without arching lower back',
      'Raise arm on the kneeling side for a deeper stretch',
    ],
    aiAlternative: {
      easier: { name: 'Standing Quad Pull', reason: 'Performed standing using a wall for balance.' },
      harder: { name: 'Lizard Pose', reason: 'Deep hip opening for advanced flexibility.' },
      variation: { name: 'Pigeon Pose', reason: 'Targets the outer rotators and glutes instead.' },
    },
  },
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    target: 'Hamstrings',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Extend one leg forward with heel down, hinge at your hips, and lean gently forward while keeping your spine straight.',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 45 sec per leg',
    tips: [
      'Hinge strictly from your hips, not by rounding your upper back',
      'Pull toes back toward your shin for calf involvement',
      'Breathe into the tension, never bounce',
    ],
    aiAlternative: {
      easier: { name: 'Lying Hamstring Stretch (with towel)', reason: 'Removes gravity pressure from lower back.' },
      harder: { name: 'Standing Forward Fold', reason: 'Stretches both hamstrings simultaneously with bodyweight.' },
      variation: { name: 'Down Dog Pedal', reason: 'Dynamic calf and hamstring stretch.' },
    },
  },
  {
    id: 'shoulder-stretch',
    name: 'Shoulder Stretch',
    target: 'Shoulders, Upper Back',
    difficulty: 'Beginner',
    category: 'flexibility',
    isNoEquipment: true,
    isPopular: false,
    description:
      'Gently draw one arm across your chest and hold it securely with the opposite arm to stretch the posterior deltoid and rotator cuff.',
    image:
      'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80',
    recommended: '2 sets • 30–45 sec per side',
    tips: [
      'Keep shoulders relaxed away from ears',
      'Support your arm at the forearm or triceps, not on the elbow joint',
      'Rotate wrist to find the tightest angle of relief',
    ],
    aiAlternative: {
      easier: { name: 'Shoulder Rolls', reason: 'Dynamic joint lubrication without static pull.' },
      harder: { name: 'Doorway Chest & Shoulder Opener', reason: 'Bilateral opening for chest and anterior deltoid.' },
      variation: { name: 'Overhead Triceps Stretch', reason: 'Targets triceps and lats.' },
    },
  },
];
