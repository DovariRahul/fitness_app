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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import workoutService from '../../services/workoutService';
import Colors from '../../constants/colors';
import { WorkoutPlan } from '../../types';
import AIWorkoutModal from '../../components/AIWorkoutModal';
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
  const [activeCondition, setActiveCondition] = useState<ConditionFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutService.getWorkoutHistory(50);
      setWorkouts(data);
    } catch (error) {
      console.log('Failed to fetch workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
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

  // Delete workout plan handler
  const handleDeleteWorkout = (e: any, workout: WorkoutPlan) => {
    e.stopPropagation?.();

    const confirmAction = async () => {
      setDeletingId(workout.id);
      try {
        await workoutService.deleteWorkout(workout.id);
        setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to delete workout plan');
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(`Delete workout plan "${workout.title}"?`);
      if (ok) confirmAction();
    } else {
      Alert.alert(
        'Delete Workout Plan',
        `Are you sure you want to delete "${workout.title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmAction },
        ]
      );
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

          {/* ── AI Generate Button ── */}
          <TouchableOpacity
            style={styles.generateButton}
            activeOpacity={0.88}
            onPress={() => setShowAIModal(true)}
          >
            <View style={styles.generateButtonInner}>
              <View style={styles.generateIconCircle}>
                <Text style={styles.generateIconText}>🤖</Text>
              </View>
              <View style={styles.generateTextCol}>
                <Text style={styles.generateTitle}>Generate AI Workout Plan</Text>
                <Text style={styles.generateSubtitle}>
                  Powered by Gemini · Personalized for you
                </Text>
              </View>
              <Text style={styles.generateArrow}>→</Text>
            </View>
            <View style={styles.geminiTagRow}>
              <Text style={styles.geminiTag}>✨ Gemini AI</Text>
              <Text style={styles.geminiTagSep}>·</Text>
              <Text style={styles.geminiTag}>💪 Goal-based</Text>
              <Text style={styles.geminiTagSep}>·</Text>
              <Text style={styles.geminiTag}>⚡ Instant</Text>
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
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: '/workout/[id]',
                      params: { id: workout.id },
                    })
                  }
                >
                  {/* Top Bar: Date, Badges & Delete Button */}
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
                    </View>

                    {/* Delete Option Button */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                      onPress={(e) => handleDeleteWorkout(e, workout)}
                      disabled={deletingId === workout.id}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {deletingId === workout.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <TrashIcon size={18} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  </View>

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

  // ── AI Generate Button
  generateButton: {
    backgroundColor: '#111216',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  generateButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  generateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(250,90,71,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250,90,71,0.4)',
  },
  generateIconText: { fontSize: 22 },
  generateTextCol: { flex: 1 },
  generateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  generateSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  generateArrow: { fontSize: 20, color: Colors.primary, fontWeight: '700' },
  geminiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  geminiTag: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  geminiTagSep: { fontSize: 11, color: 'rgba(255,255,255,0.2)' },

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
