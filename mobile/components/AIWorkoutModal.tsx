import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import workoutService from '../services/workoutService';

// ─── Data ────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'muscle_gain', label: 'Muscle Gain', emoji: '💪', desc: 'Build mass & strength' },
  { id: 'fat_loss', label: 'Fat Loss', emoji: '🔥', desc: 'Burn fat & tone up' },
  { id: 'strength', label: 'Strength', emoji: '🏋️', desc: 'Raw power & lifts' },
  { id: 'endurance', label: 'Endurance', emoji: '🏃', desc: 'Stamina & cardio' },
  { id: 'flexibility', label: 'Flexibility', emoji: '🧘', desc: 'Mobility & range' },
  { id: 'general_fitness', label: 'General Fitness', emoji: '⚡', desc: 'All-round health' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: '0 – 6 months training' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🌿', desc: '6 months – 2 years' },
  { id: 'advanced', label: 'Advanced', emoji: '🌳', desc: '2+ years training' },
];

const DURATIONS = [
  { id: 15, label: '15 min', emoji: '⚡' },
  { id: 30, label: '30 min', emoji: '🕐' },
  { id: 45, label: '45 min', emoji: '⏱' },
  { id: 60, label: '60 min', emoji: '💯' },
  { id: 75, label: '75 min', emoji: '🏆' },
  { id: 90, label: '90 min', emoji: '🦁' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'Bodyweight', emoji: '🤸' },
  { id: 'dumbbells', label: 'Dumbbells', emoji: '🏋️' },
  { id: 'barbell', label: 'Barbell', emoji: '⚖️' },
  { id: 'resistance_bands', label: 'Resistance Bands', emoji: '🔗' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', emoji: '🏗' },
  { id: 'machine', label: 'Gym Machines', emoji: '🏭' },
  { id: 'kettlebell', label: 'Kettlebell', emoji: '🔔' },
  { id: 'cable', label: 'Cable Machine', emoji: '🔄' },
];

const STEPS = ['Goal', 'Level', 'Duration', 'Equipment', 'Generate'];

// ─── Step Components ──────────────────────────────────────────────────────────

function StepGoal({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <View style={step.container}>
      <Text style={step.title}>What's your goal?</Text>
      <Text style={step.subtitle}>We'll craft a plan built around your objective</Text>
      <View style={step.grid}>
        {GOALS.map((g) => {
          const active = selected === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[step.card, active && step.cardActive]}
              onPress={() => onSelect(g.id)}
              activeOpacity={0.8}
            >
              <Text style={step.cardEmoji}>{g.emoji}</Text>
              <Text style={[step.cardLabel, active && step.cardLabelActive]}>{g.label}</Text>
              <Text style={[step.cardDesc, active && step.cardDescActive]}>{g.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepLevel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <View style={step.container}>
      <Text style={step.title}>Your fitness level?</Text>
      <Text style={step.subtitle}>Be honest — we'll match the intensity perfectly</Text>
      <View style={{ gap: 12 }}>
        {LEVELS.map((l) => {
          const active = selected === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              style={[step.rowCard, active && step.rowCardActive]}
              onPress={() => onSelect(l.id)}
              activeOpacity={0.8}
            >
              <Text style={step.rowEmoji}>{l.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[step.rowLabel, active && step.rowLabelActive]}>{l.label}</Text>
                <Text style={[step.rowDesc, active && step.rowDescActive]}>{l.desc}</Text>
              </View>
              {active && <Text style={step.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepDuration({ selected, onSelect }: { selected: number; onSelect: (id: number) => void }) {
  return (
    <View style={step.container}>
      <Text style={step.title}>How long do you have?</Text>
      <Text style={step.subtitle}>We'll fit a perfect session into your schedule</Text>
      <View style={step.durationGrid}>
        {DURATIONS.map((d) => {
          const active = selected === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              style={[step.durationCard, active && step.durationCardActive]}
              onPress={() => onSelect(d.id)}
              activeOpacity={0.8}
            >
              <Text style={step.durationEmoji}>{d.emoji}</Text>
              <Text style={[step.durationLabel, active && step.durationLabelActive]}>{d.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepEquipment({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={step.container}>
      <Text style={step.title}>Available equipment?</Text>
      <Text style={step.subtitle}>Select everything you have access to</Text>
      <View style={step.grid}>
        {EQUIPMENT_OPTIONS.map((e) => {
          const active = selected.includes(e.id);
          return (
            <TouchableOpacity
              key={e.id}
              style={[step.card, active && step.cardActive]}
              onPress={() => onToggle(e.id)}
              activeOpacity={0.8}
            >
              <Text style={step.cardEmoji}>{e.emoji}</Text>
              <Text style={[step.cardLabel, active && step.cardLabelActive]}>{e.label}</Text>
              {active && <View style={step.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StepGenerating({ plan, generating }: { plan: any; generating: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (generating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [generating]);

  if (generating) {
    return (
      <View style={gen.container}>
        <Animated.View style={[gen.orb, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={gen.orbEmoji}>🤖</Text>
        </Animated.View>
        <Text style={gen.title}>Gemini AI is crafting{'\n'}your perfect plan...</Text>
        <Text style={gen.subtitle}>Analyzing your goals, level, and preferences</Text>
        <View style={gen.steps}>
          {['Analyzing your profile', 'Selecting optimal exercises', 'Structuring your plan', 'Adding expert tips'].map(
            (s, i) => (
              <View key={i} style={gen.stepRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={gen.stepText}>{s}</Text>
              </View>
            )
          )}
        </View>
      </View>
    );
  }

  if (plan) {
    return (
      <ScrollView style={gen.planScroll} showsVerticalScrollIndicator={false}>
        <View style={gen.planHeader}>
          <Text style={gen.checkCircle}>✅</Text>
          <Text style={gen.planTitle}>{plan.title}</Text>
          <Text style={gen.planDesc}>{plan.description}</Text>
          <View style={gen.metaRow}>
            <View style={gen.metaBadge}><Text style={gen.metaText}>⏱ {plan.estimated_duration_min} min</Text></View>
            <View style={gen.metaBadge}><Text style={gen.metaText}>💪 {plan.exercises?.length} exercises</Text></View>
            <View style={gen.metaBadge}><Text style={gen.metaText}>📊 {plan.difficulty}</Text></View>
          </View>
        </View>

        {plan.ai_tips?.length > 0 && (
          <View style={gen.section}>
            <Text style={gen.sectionTitle}>🧠 AI Tips</Text>
            {plan.ai_tips.map((tip: string, i: number) => (
              <View key={i} style={gen.tipRow}>
                <Text style={gen.tipDot}>•</Text>
                <Text style={gen.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {plan.warmup?.exercises?.length > 0 && (
          <View style={gen.section}>
            <Text style={gen.sectionTitle}>🔥 Warm-up ({plan.warmup.duration_min} min)</Text>
            {plan.warmup.exercises.map((ex: any, i: number) => (
              <View key={i} style={gen.exRow}>
                <Text style={gen.exName}>{ex.name}</Text>
                <Text style={gen.exMeta}>{ex.duration} • {ex.instruction}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={gen.section}>
          <Text style={gen.sectionTitle}>🏋️ Main Workout</Text>
          {plan.exercises?.map((ex: any, i: number) => (
            <View key={i} style={gen.exCard}>
              <View style={gen.exCardHeader}>
                <View style={gen.exNum}><Text style={gen.exNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={gen.exCardName}>{ex.exercise_name}</Text>
                  <Text style={gen.exCardMuscle}>{ex.target_muscle}</Text>
                </View>
                <View style={gen.exBadge}>
                  <Text style={gen.exBadgeText}>{ex.sets} × {ex.reps}</Text>
                </View>
              </View>
              {ex.instruction ? <Text style={gen.exInstruction}>💡 {ex.instruction}</Text> : null}
              {ex.modification ? <Text style={gen.exMod}>♻️ Easier: {ex.modification}</Text> : null}
            </View>
          ))}
        </View>

        {plan.cooldown?.exercises?.length > 0 && (
          <View style={gen.section}>
            <Text style={gen.sectionTitle}>❄️ Cool-down ({plan.cooldown.duration_min} min)</Text>
            {plan.cooldown.exercises.map((ex: any, i: number) => (
              <View key={i} style={gen.exRow}>
                <Text style={gen.exName}>{ex.name}</Text>
                <Text style={gen.exMeta}>{ex.duration} • {ex.instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {plan.nutrition_tip ? (
          <View style={gen.nutritionCard}>
            <Text style={gen.nutritionLabel}>🥗 Nutrition Tip</Text>
            <Text style={gen.nutritionText}>{plan.nutrition_tip}</Text>
          </View>
        ) : null}

        {plan.weekly_schedule_suggestion ? (
          <View style={gen.scheduleCard}>
            <Text style={gen.scheduleLabel}>📅 Weekly Schedule</Text>
            <Text style={gen.scheduleText}>{plan.weekly_schedule_suggestion}</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: any) => void;
}

export default function AIWorkoutModal({ visible, onClose, onPlanGenerated }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.max(540, Math.min(screenHeight * 0.88, 720));

  const [currentStep, setCurrentStep] = useState(0);
  const [goal, setGoal] = useState('general_fitness');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState<string[]>(['none']);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = STEPS.length;

  const handleToggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (currentStep === 0) return !!goal;
    if (currentStep === 1) return !!level;
    if (currentStep === 2) return !!duration;
    if (currentStep === 3) return equipment.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 2) {
      Animated.timing(slideAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        setCurrentStep((s) => s + 1);
        slideAnim.setValue(0);
      });
    } else {
      // Last real step -> generate
      setCurrentStep(totalSteps - 1);
      setGenerating(true);
      setGeneratedPlan(null);
      try {
        const plan = await workoutService.generateAIWorkout({
          goal,
          fitness_level: level,
          duration_minutes: duration,
          equipment,
        });
        setGeneratedPlan(plan);
        onPlanGenerated(plan);
      } catch (e: any) {
        Alert.alert('Generation Failed', e.message || 'Could not generate plan. Check your API key.');
        setCurrentStep(totalSteps - 2);
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      if (currentStep === totalSteps - 1) {
        setGeneratedPlan(null);
      }
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setGoal('general_fitness');
    setLevel('beginner');
    setDuration(30);
    setEquipment(['none']);
    setGeneratedPlan(null);
    setGenerating(false);
    onClose();
  };

  const isLastStep = currentStep === totalSteps - 1;
  const isGenerateStep = currentStep === totalSteps - 2;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={modal.overlay}>
        <View
          style={[
            modal.sheet,
            {
              height: sheetHeight,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Handle bar */}
          <View style={modal.handleBar} />

          {/* Header */}
          <View style={modal.header}>
            <TouchableOpacity onPress={handleBack} style={modal.backBtn}>
              <Text style={modal.backArrow}>{currentStep === 0 ? '✕' : '←'}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={modal.headerTitle}>
                {isLastStep ? 'Your AI Plan' : `Step ${currentStep + 1} of ${totalSteps - 1}`}
              </Text>
              <Text style={modal.headerSubtitle}>
                {isLastStep ? 'Powered by Gemini AI' : STEPS[currentStep]}
              </Text>
            </View>
            <View style={modal.geminiPill}>
              <Text style={modal.geminiText}>✨ Gemini</Text>
            </View>
          </View>

          {/* Progress bar */}
          {!isLastStep && (
            <View style={modal.progressTrack}>
              <View
                style={[
                  modal.progressFill,
                  { width: `${((currentStep + 1) / (totalSteps - 1)) * 100}%` },
                ]}
              />
            </View>
          )}

          {/* Step content */}
          <ScrollView
            style={modal.body}
            contentContainerStyle={modal.bodyScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 0 && <StepGoal selected={goal} onSelect={setGoal} />}
            {currentStep === 1 && <StepLevel selected={level} onSelect={setLevel} />}
            {currentStep === 2 && <StepDuration selected={duration} onSelect={setDuration} />}
            {currentStep === 3 && <StepEquipment selected={equipment} onToggle={handleToggleEquipment} />}
            {currentStep === 4 && <StepGenerating plan={generatedPlan} generating={generating} />}
          </ScrollView>

          {/* CTA Button */}
          {(!isLastStep || (!generating && !generatedPlan)) && (
            <TouchableOpacity
              style={[modal.cta, !canProceed() && modal.ctaDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.85}
            >
              <Text style={modal.ctaText}>
                {isGenerateStep ? '✨ Generate My Plan' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          )}

          {isLastStep && generatedPlan && !generating && (
            <TouchableOpacity style={modal.ctaDone} onPress={handleClose} activeOpacity={0.85}>
              <Text style={modal.ctaDoneText}>✓ Done — View in My Workouts</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  geminiPill: {
    backgroundColor: 'rgba(250, 90, 71, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 71, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  geminiText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    width: '100%',
  },
  bodyScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    flexGrow: 1,
  },
  cta: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ctaDone: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#10B981',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDoneText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const step = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 20,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 10,
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'flex-start',
    position: 'relative',
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(250,90,71,0.12)',
  },
  cardEmoji: { fontSize: 24, marginBottom: 6 },
  cardLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  cardLabelActive: { color: '#FFFFFF' },
  cardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  cardDescActive: { color: 'rgba(255,255,255,0.6)' },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  rowCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(250,90,71,0.12)',
  },
  rowEmoji: { fontSize: 26 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  rowLabelActive: { color: '#FFFFFF' },
  rowDesc: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  rowDescActive: { color: 'rgba(255,255,255,0.5)' },
  checkmark: { fontSize: 16, color: Colors.primary, fontWeight: '800' },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 10,
  },
  durationCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  durationCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(250,90,71,0.12)',
  },
  durationEmoji: { fontSize: 20 },
  durationLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  durationLabelActive: { color: '#FFFFFF' },
});

const gen = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(250,90,71,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(250,90,71,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  orbEmoji: { fontSize: 48 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: 32,
  },
  steps: { gap: 12, width: '100%' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  planScroll: { flex: 1 },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  checkCircle: { fontSize: 36, marginBottom: 12 },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  planDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipDot: { color: Colors.primary, fontSize: 14, fontWeight: '800', marginTop: 2 },
  tipText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  exRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  exMeta: { fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 16 },
  exCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  exCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  exNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  exCardName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  exCardMuscle: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' },
  exBadge: {
    backgroundColor: 'rgba(250,90,71,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  exBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  exInstruction: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17, marginBottom: 4 },
  exMod: { fontSize: 11, color: 'rgba(16,185,129,0.8)', lineHeight: 16 },
  nutritionCard: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  nutritionLabel: { fontSize: 13, fontWeight: '700', color: '#10B981', marginBottom: 6 },
  nutritionText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  scheduleCard: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    borderRadius: 14,
    padding: 14,
  },
  scheduleLabel: { fontSize: 13, fontWeight: '700', color: '#3B82F6', marginBottom: 6 },
  scheduleText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
});
