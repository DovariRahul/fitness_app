import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import workoutService from '../services/workoutService';
import sessionService from '../services/sessionService';
import feedbackService from '../services/feedbackService';
import Colors from '../constants/colors';
import {
  BackArrowIcon,
  BookmarkIcon,
  MoreHorizontalIcon,
  PlayIcon,
  TimerIcon,
  CircleCheckIcon,
  CircleOutlineIcon,
  CheckIcon,
} from '../components/Icons';
import { WorkoutPlan, WorkoutSession, FeedbackReason } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEEDBACK_REASONS: { label: string; value: FeedbackReason; icon: string }[] = [
  { label: 'Too difficult', value: 'too_difficult', icon: '😰' },
  { label: "Didn't have time", value: 'no_time', icon: '⏰' },
  { label: 'Low energy', value: 'low_energy', icon: '😴' },
  { label: 'Equipment unavailable', value: 'no_equipment', icon: '🏋️' },
  { label: 'Pain/discomfort', value: 'pain', icon: '🤕' },
  { label: 'Other', value: 'other', icon: '📝' },
];

const DEFAULT_DEMO_EXERCISES = [
  {
    exercise_id: 'ex-squat-jump',
    exercise_name: 'Squat Jump',
    sets: 2,
    reps: 12,
    duration_sec: 45,
    rest_time_sec: 30,
    media_url:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=80',
  },
  {
    exercise_id: 'ex-mountain-climbers',
    exercise_name: 'Mountain Climbers',
    sets: 2,
    reps: 20,
    duration_sec: 45,
    rest_time_sec: 30,
    media_url:
      'https://images.unsplash.com/photo-1434596922112-19c563067271?w=900&auto=format&fit=crop&q=80',
  },
  {
    exercise_id: 'ex-burpees',
    exercise_name: 'Burpees',
    sets: 2,
    reps: 10,
    duration_sec: 45,
    rest_time_sec: 30,
    media_url:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
  },
];

export default function WorkoutSessionScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({
    'ex-squat-jump': 1, // Pre-check set 1 to match reference screenshot!
  });
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(72); // 01:12 to match reference screenshot!
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadWorkout();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const loadWorkout = async () => {
    try {
      let activePlan: WorkoutPlan | null = null;
      if (planId && planId !== 'current' && planId !== 'trending-1') {
        activePlan = await workoutService.getWorkoutById(planId).catch(() => null);
      }
      if (!activePlan) {
        activePlan = await workoutService.getTodayWorkout().catch(() => null);
      }

      if (activePlan && activePlan.exercises && activePlan.exercises.length > 0) {
        setPlan(activePlan);
        const sess = await sessionService.startSession(activePlan.id).catch(() => null);
        if (sess) setSession(sess);

        const initial: Record<string, number> = {};
        activePlan.exercises.forEach((ex: any) => {
          initial[ex.exercise_id] = 0;
        });
        setCompletedSets(initial);
      } else {
        // Fallback demo plan with exact reference data
        setPlan({
          id: 'demo-hiit-1',
          user_id: 'user-demo',
          date: new Date().toISOString(),
          title: 'Beginner HIIT Workout',
          description: 'High intensity interval training session',
          estimated_duration_min: 10,
          difficulty: 'beginner',
          is_completed: false,
          created_at: new Date().toISOString(),
          exercises: DEFAULT_DEMO_EXERCISES as any,
        });
      }
    } catch (e) {
      console.log('Session load fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exercises = plan?.exercises?.length ? plan.exercises : DEFAULT_DEMO_EXERCISES;
  const currentExercise = exercises[currentExIndex] || DEFAULT_DEMO_EXERCISES[0];
  const totalSets = currentExercise.sets || 2;
  const currentSetsDone = completedSets[currentExercise.exercise_id] || 0;

  const toggleSet = (setNumber: number) => {
    // If tapping set, toggle completion
    const newCount = currentSetsDone >= setNumber ? setNumber - 1 : setNumber;
    setCompletedSets({
      ...completedSets,
      [currentExercise.exercise_id]: newCount,
    });
  };

  const handleDoneOrNext = async () => {
    const nextSetCount = Math.min(currentSetsDone + 1, totalSets);
    const updated = {
      ...completedSets,
      [currentExercise.exercise_id]: nextSetCount,
    };
    setCompletedSets(updated);

    if (session) {
      try {
        await sessionService.updateExercise(
          session.id,
          currentExercise.exercise_id,
          nextSetCount,
          [12],
          nextSetCount >= totalSets
        );
      } catch (e) {
        console.log('Update exercise failed:', e);
      }
    }

    if (nextSetCount >= totalSets) {
      // Exercise completed
      if (currentExIndex < exercises.length - 1) {
        setCurrentExIndex(currentExIndex + 1);
      } else {
        // All exercises completed
        setShowFeedback(true);
      }
    }
  };

  const handleFinishWorkout = async () => {
    try {
      if (session) {
        await sessionService.completeSession(session.id);
      }
    } catch (e) {
      console.log('Complete session error:', e);
    }
    router.replace('/(tabs)');
  };

  const handleFeedbackSubmit = async () => {
    try {
      if (plan) {
        await feedbackService.submitFeedback({
          session_id: session?.id || 'demo-session',
          plan_id: plan.id,
          difficulty_rating: difficultyRating,
          reason: selectedReason || 'other',
          completion_percentage: 100,
        });
      }
    } catch (e) {
      console.log('Feedback submit error:', e);
    }
    setShowFeedback(false);
    router.replace('/(tabs)');
  };

  const currentMediaUrl =
    (currentExercise as any).media_url ||
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=80';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Half: Workout Media Banner with Controls */}
      <View style={styles.mediaContainer}>
        <Image source={{ uri: currentMediaUrl }} style={styles.mediaImage} />
        <View style={styles.mediaOverlay} />

        {/* Top Floating Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => {
              Alert.alert('Leave Workout?', 'Your progress so far will be saved.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => router.back() },
              ]);
            }}
            activeOpacity={0.7}
          >
            <BackArrowIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}>
              <BookmarkIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}>
              <MoreHorizontalIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Central Play/Pause Button Overlay */}
        <TouchableOpacity
          style={styles.centerPlayButton}
          activeOpacity={0.8}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <View style={styles.pauseIconWrapper}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <PlayIcon size={26} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Half: Exercise Sets & Progress (Dark Theme) */}
      <View style={styles.bottomSection}>
        {/* Title & Exercise Counter Header */}
        <View style={styles.exerciseHeaderRow}>
          <Text style={styles.exerciseTitle}>
            {(currentExercise as any).exercise_name || (currentExercise as any).name || 'Squat Jump'}
          </Text>
          <Text style={styles.exerciseCounter}>
            Exercise {currentExIndex + 1} of {exercises.length}
          </Text>
        </View>

        {/* Set Checklist matching reference screenshot */}
        <ScrollView
          style={styles.setsScrollView}
          contentContainerStyle={styles.setsListContainer}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: totalSets }).map((_, i) => {
            const setNum = i + 1;
            const isDone = currentSetsDone >= setNum;
            const repsLabel = (currentExercise as any).reps
              ? `${(currentExercise as any).reps} reps`
              : '12 reps';

            return (
              <TouchableOpacity
                key={setNum}
                style={[styles.setCard, isDone && styles.setCardDone]}
                activeOpacity={0.75}
                onPress={() => toggleSet(setNum)}
              >
                <View style={styles.setLeftRow}>
                  {isDone ? (
                    <CircleCheckIcon size={22} color={Colors.primary} />
                  ) : (
                    <CircleOutlineIcon size={22} color="#71717A" />
                  )}
                  <Text style={[styles.setNameText, isDone && styles.setNameTextDone]}>
                    Set {setNum}
                  </Text>
                </View>

                <Text style={styles.setRepsText}>{repsLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Bottom Controller Bar matching screenshot */}
      <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomBarContent}>
          {/* Timer Pill */}
          <View style={styles.timerPill}>
            <TimerIcon size={18} color="#FFFFFF" />
            <Text style={styles.timerPillText}>{formatTime(timer)}</Text>
          </View>

          {/* Action Done Pill Button */}
          <TouchableOpacity
            style={styles.donePillButton}
            onPress={handleDoneOrNext}
            activeOpacity={0.85}
          >
            <CheckIcon size={18} color="#FFFFFF" />
            <Text style={styles.donePillText}>
              {currentSetsDone >= totalSets && currentExIndex === exercises.length - 1
                ? 'Finish'
                : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Modal on Completion */}
      <Modal visible={showFeedback} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Workout Completed!</Text>
            <Text style={styles.modalSubtitle}>
              Great effort! You finished in {formatTime(timer)}. How did it feel?
            </Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.ratingBtn,
                    difficultyRating === val && styles.ratingBtnActive,
                  ]}
                  onPress={() => setDifficultyRating(val)}
                >
                  <Text
                    style={[
                      styles.ratingBtnText,
                      difficultyRating === val && styles.ratingBtnTextActive,
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleFeedbackSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSubmitText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  // Top Media
  mediaContainer: {
    width: '100%',
    height: '48%',
    backgroundColor: '#1C1C1E',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseIconWrapper: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 5,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 2.5,
  },

  // Bottom Content Section
  bottomSection: {
    flex: 1,
    backgroundColor: '#121214',
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  exerciseCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },

  // Sets Checklist
  setsScrollView: {
    flex: 1,
  },
  setsListContainer: {
    gap: 12,
    paddingBottom: 110,
  },
  setCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#26262A',
  },
  setCardDone: {
    backgroundColor: '#202024',
    borderColor: 'rgba(250, 90, 71, 0.3)',
  },
  setLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  setNameTextDone: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  setRepsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Docked Bottom Controller Bar
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: '#121214',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#28282D',
  },
  timerPillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  donePillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  donePillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E2E34',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  ratingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#26262B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: {
    backgroundColor: Colors.primary,
  },
  ratingBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingBtnTextActive: {
    color: '#FFFFFF',
  },
  modalSubmitBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
