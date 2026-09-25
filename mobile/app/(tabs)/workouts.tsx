import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import workoutService from '../../services/workoutService';
import Colors from '../../constants/colors';
import { WorkoutPlan } from '../../types';
import AIWorkoutModal from '../../components/AIWorkoutModal';
import ManualWorkoutModal from '../../components/ManualWorkoutModal';
import WorkoutTimetableModal, {
  TIMETABLE_STORAGE_KEY,
  DEFAULT_TIMETABLE,
  TimetableDay,
} from '../../components/WorkoutTimetableModal';
import { TrashIcon } from '../../components/Icons';

type ConditionFilter = 'all' | 'ready' | 'completed' | 'ai';

const CONDITIONS: { id: ConditionFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'ready', label: 'Ready', icon: '⚡' },
  { id: 'completed', label: 'Done', icon: '✓' },
  { id: 'ai', label: 'AI Plans', icon: '✨' },
];

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState<string>('');
  const [activeCondition, setActiveCondition] = useState<ConditionFilter>('all');
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadTimetablePreview = async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMETABLE_STORAGE_KEY);
      const list: TimetableDay[] = stored ? JSON.parse(stored) : DEFAULT_TIMETABLE;
      const day = new Date().getDay();
      const idx = day === 0 ? 6 : day - 1;
      const cur = list[idx] || list[0];
      if (cur.isRest) {
        setTodaySummary(`Today (${cur.shortDay}): Rest & Recovery 🛌`);
      } else {
        setTodaySummary(`Today (${cur.shortDay}): ${cur.targetFocus} · ${cur.time}`);
      }
    } catch {
      setTodaySummary('Plan your 7-day routine, rest days & timings');
    }
  };

  const fetchWorkouts = async () => {
    try {
      // 1. Fetch backend workouts
      let backendList: WorkoutPlan[] = [];
      try {
        backendList = await workoutService.getWorkoutHistory(50);
      } catch (beErr) {
        console.log('Backend workouts fetch error/offline:', beErr);
      }

      // 2. Fetch local manual workouts
      let localList: WorkoutPlan[] = [];
      try {
        const storedLocal = await AsyncStorage.getItem('@local_manual_workouts');
        if (storedLocal) {
          localList = JSON.parse(storedLocal);
        }
      } catch (localErr) {
        console.log('Failed reading local workouts:', localErr);
      }

      // 3. Deduplicate / Merge: local workouts first so newly created manual workouts appear immediately
      const existingIds = new Set(backendList.map((w) => w.id));
      const combined = [
        ...localList.filter((w) => !existingIds.has(w.id)),
        ...backendList,
      ];

      setWorkouts(combined);
    } catch (error) {
      console.log('Failed to fetch workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    loadTimetablePreview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  const handlePlanGenerated = async (_plan: any) => {
    await fetchWorkouts();
  };

  // 4 Conditions filtering
  const filteredWorkouts = useMemo(() => {
    switch (activeCondition) {
      case 'ready':
        return workouts.filter((w) => !w.is_completed);
      case 'completed':
        return workouts.filter((w) => w.is_completed);
      case 'ai':
        return workouts.filter((w) => (w as any).ai_generated);
      case 'all':
      default:
        return workouts;
    }
  }, [workouts, activeCondition]);

  // Counts for each condition
  const counts = useMemo(() => {
    return {
      all: workouts.length,
      ready: workouts.filter((w) => !w.is_completed).length,
      completed: workouts.filter((w) => w.is_completed).length,
      ai: workouts.filter((w) => (w as any).ai_generated).length,
    };
  }, [workouts]);

  // Confirmed Delete Action
  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return;
    const targetId = workoutToDelete.id;
    setIsDeleting(true);

    try {
      // 1. Delete from backend if possible
      try {
        await workoutService.deleteWorkout(targetId);
      } catch (beErr) {
        console.log('Backend delete note (local plan only):', beErr);
      }

      // 2. Delete from local storage
      try {
        const storedLocal = await AsyncStorage.getItem('@local_manual_workouts');
        if (storedLocal) {
          const list = JSON.parse(storedLocal);
          const updated = list.filter((w: any) => w.id !== targetId);
          await AsyncStorage.setItem('@local_manual_workouts', JSON.stringify(updated));
        }
      } catch (localErr) {
        console.log('Local delete note:', localErr);
      }

      // 3. Immediately remove from current state
      setWorkouts((prev) => prev.filter((w) => w.id !== targetId));
      setWorkoutToDelete(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to delete workout plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return Colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.responsiveWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Workout Plans</Text>
            <Text style={styles.headerSubtitle}>
              {workouts.length} personalized routines logged
            </Text>
          </View>

          {/* ── Action Cards Row: Manual Plan (LEFT) & AI Generate (RIGHT) ── */}
          <View style={styles.actionCardsRow}>
            {/* Left: Manual Workout Plan */}
            <TouchableOpacity
              style={styles.manualCard}
              activeOpacity={0.88}
              onPress={() => setShowManualModal(true)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.manualIconCircle}>
                  <Text style={styles.cardIconText}>✍️</Text>
                </View>
                <View style={styles.manualBadge}>
                  <Text style={styles.manualBadgeText}>Days & Time</Text>
                </View>
              </View>
              <View>
                <Text style={styles.cardTitle}>Manual Plan</Text>
                <Text style={styles.cardSubtitle}>
                  Pick days, exercises & time
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.manualLinkText}>Schedule Days →</Text>
              </View>
            </TouchableOpacity>

            {/* Right: AI Generate Plan */}
            <TouchableOpacity
              style={styles.aiCard}
              activeOpacity={0.88}
              onPress={() => setShowAIModal(true)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.aiIconCircle}>
                  <Text style={styles.cardIconText}>🤖</Text>
                </View>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>✨ Gemini</Text>
                </View>
              </View>
              <View>
                <Text style={styles.cardTitle}>AI Generate</Text>
                <Text style={styles.cardSubtitle}>
                  Smart personalized plan
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.aiLinkText}>Generate →</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Workout Timetable Planner Button ── */}
          <TouchableOpacity
            style={styles.timetableButton}
            activeOpacity={0.88}
            onPress={() => setShowTimetableModal(true)}
          >
            <View style={styles.timetableButtonInner}>
              <View style={styles.timetableIconCircle}>
                <Text style={styles.timetableIconText}>📅</Text>
              </View>
              <View style={styles.timetableTextCol}>
                <View style={styles.timetableTitleRow}>
                  <Text style={styles.timetableTitle}>Workout Timetable</Text>
                  <View style={styles.timetableBadge}>
                    <Text style={styles.timetableBadgeText}>Planner</Text>
                  </View>
                </View>
                <Text style={styles.timetableSubtitle} numberOfLines={1}>
                  {todaySummary || 'Plan your 7-day routine, rest days & timings'}
                </Text>
              </View>
              <Text style={styles.timetableArrow}>→</Text>
            </View>
            <View style={styles.timetableTagRow}>
              <Text style={styles.timetableTag}>🗓️ Mon–Sun Schedule</Text>
              <Text style={styles.timetableTagSep}>·</Text>
              <Text style={styles.timetableTag}>⏰ Custom Timings</Text>
              <Text style={styles.timetableTagSep}>·</Text>
              <Text style={styles.timetableTag}>⚡ 1-Tap Splits</Text>
            </View>
          </TouchableOpacity>

          {/* ── 4 Conditions Filter Pills ── */}
          <View style={styles.conditionsRow}>
            {CONDITIONS.map((cond) => {
              const isActive = activeCondition === cond.id;
              const count = counts[cond.id];
              return (
                <TouchableOpacity
                  key={cond.id}
                  style={[
                    styles.conditionPill,
                    isActive && styles.conditionPillActive,
                  ]}
                  onPress={() => setActiveCondition(cond.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.conditionIcon}>{cond.icon}</Text>
                  <Text
                    style={[
                      styles.conditionText,
                      isActive && styles.conditionTextActive,
                    ]}
                  >
                    {cond.label}
                  </Text>
                  <View
                    style={[
                      styles.conditionCountBadge,
                      isActive && styles.conditionCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.conditionCountText,
                        isActive && styles.conditionCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Workout List ── */}
          {filteredWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>
                {workouts.length === 0 ? 'No workouts yet' : 'No matching plans'}
              </Text>
              <Text style={styles.emptyText}>
                {workouts.length === 0
                  ? 'Tap the button above to generate your first AI-powered personalized routine!'
                  : 'Try selecting a different filter above to view your workouts.'}
              </Text>
            </View>
          ) : (
            <View style={styles.workoutList}>
              {filteredWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutCard}>
                  {/* Top Bar: Date, Badges & Independent Delete Button */}
                  <View style={styles.workoutHeader}>
                    <View style={styles.dateAndStatus}>
                      <View style={styles.workoutDateBadge}>
                        <Text style={styles.workoutDate}>
                          {formatDate(workout.date)}
                        </Text>
                      </View>
                      {workout.is_completed ? (
                        <View style={styles.completedPill}>
                          <Text style={styles.completedPillText}>✓ Done</Text>
                        </View>
                      ) : (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>Ready</Text>
                        </View>
                      )}
                      {(workout as any).ai_generated && (
                        <View style={styles.aiBadgeInline}>
                          <Text style={styles.aiBadgeInlineText}>✨ AI</Text>
                        </View>
                      )}
                      {(workout as any).day && (
                        <View style={styles.dayBadgeInline}>
                          <Text style={styles.dayBadgeInlineText}>🗓️ {(workout as any).day}</Text>
                        </View>
                      )}
                      {(workout as any).time && (
                        <View style={styles.timeBadgeInline}>
                          <Text style={styles.timeBadgeInlineText}>⏰ {(workout as any).time}</Text>
                        </View>
                      )}
                    </View>

                    {/* Delete Option Button (Fully Decoupled from card navigation) */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                      onPress={() => setWorkoutToDelete(workout)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <TrashIcon size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Clickable Card Body: Navigates to detail */}
                  <TouchableOpacity
                    style={styles.workoutBodyTouchable}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: '/workout/[id]',
                        params: { id: workout.id },
                      })
                    }
                  >
                    {/* Title & Description */}
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    <Text style={styles.workoutDesc} numberOfLines={2}>
                      {workout.description || 'Personalized AI fitness session'}
                    </Text>

                    {/* Footer Meta */}
                    <View style={styles.workoutFooter}>
                      <View style={styles.workoutMeta}>
                        <Text style={styles.metaText}>
                          ⏱ {workout.estimated_duration_min} min
                        </Text>
                      </View>
                      <View style={styles.workoutMeta}>
                        <Text style={styles.metaText}>
                          🏋️ {workout.exercises?.length || 0} exercises
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.difficultyBadge,
                          {
                            backgroundColor:
                              getDifficultyColor(workout.difficulty) + '15',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(workout.difficulty) },
                          ]}
                        >
                          {workout.difficulty}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* AI Modal */}
      <AIWorkoutModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Manual Workout Modal */}
      <ManualWorkoutModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onWorkoutCreated={async () => {
          await fetchWorkouts();
        }}
      />

      {/* Timetable Planner Modal */}
      <WorkoutTimetableModal
        visible={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        onSaved={() => loadTimetablePreview()}
      />

      {/* ── Custom Delete Confirmation Modal ── */}
      <Modal
        visible={!!workoutToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setWorkoutToDelete(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={styles.deleteModalIconCircle}>
              <TrashIcon size={24} color="#EF4444" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Workout Routine?</Text>
            <Text style={styles.deleteModalDesc}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: '700', color: '#111827' }}>
                "{workoutToDelete?.title}"
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalCancelBtn}
                onPress={() => setWorkoutToDelete(null)}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteModalConfirmBtn,
                  isDeleting && { opacity: 0.6 },
                ]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>Delete Routine</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === yesterday) return 'Yesterday';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
  },
  header: { marginBottom: 18 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: '#6B7280' },

  // ── Action Cards Row (Manual on Left, AI on Right) ──
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  manualCard: {
    flex: 1,
    backgroundColor: '#111216',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    justifyContent: 'space-between',
    minHeight: 145,
  },
  aiCard: {
    flex: 1,
    backgroundColor: '#111216',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(250, 90, 71, 0.35)',
    shadowColor: '#FA5A47',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    justifyContent: 'space-between',
    minHeight: 145,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  manualIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  aiIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(250, 90, 71, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 71, 0.35)',
  },
  cardIconText: { fontSize: 18 },
  manualBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60A5FA',
  },
  aiBadge: {
    backgroundColor: 'rgba(250, 90, 71, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 71, 0.3)',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FA5A47',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
    lineHeight: 15,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    marginTop: 8,
  },
  manualLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60A5FA',
  },
  aiLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FA5A47',
  },

  // ── Workout Timetable Button ──
  timetableButton: {
    backgroundColor: '#111216',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  timetableButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  timetableIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  timetableIconText: { fontSize: 22 },
  timetableTextCol: { flex: 1 },
  timetableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  timetableTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timetableBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  timetableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818CF8',
  },
  timetableSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  timetableArrow: { fontSize: 20, color: '#818CF8', fontWeight: '700' },
  timetableTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  timetableTag: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  timetableTagSep: { fontSize: 11, color: 'rgba(255,255,255,0.2)' },

  // ── 4 Conditions Filter Pills Row ──
  conditionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECEEF2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  conditionPillActive: {
    backgroundColor: Colors.primary,
  },
  conditionIcon: {
    fontSize: 12,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  conditionTextActive: {
    color: '#FFFFFF',
  },
  conditionCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  conditionCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  conditionCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  conditionCountTextActive: {
    color: '#FFFFFF',
  },

  // ── Workout list
  workoutList: { gap: 14 },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  workoutDateBadge: {
    backgroundColor: '#ECEEF2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutDate: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  completedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedPillText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  activePill: {
    backgroundColor: 'rgba(250, 90, 71, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activePillText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  aiBadgeInline: {
    backgroundColor: 'rgba(250,90,71,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(250,90,71,0.25)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aiBadgeInlineText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  dayBadgeInline: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dayBadgeInlineText: { fontSize: 10, fontWeight: '800', color: '#2563EB' },
  timeBadgeInline: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  timeBadgeInlineText: { fontSize: 10, fontWeight: '800', color: '#059669' },

  // Delete button
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  workoutTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  workoutDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 17,
  },
  workoutFooter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  workoutMeta: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  difficultyBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  difficultyText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  workoutBodyTouchable: {
    paddingTop: 2,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  deleteModalConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteModalConfirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 8, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 50, marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111216' },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
