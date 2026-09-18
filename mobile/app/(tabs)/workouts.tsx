import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import workoutService from '../../services/workoutService';
import Colors from '../../constants/colors';
import { WorkoutPlan } from '../../types';

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutService.getWorkoutHistory(30);
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await workoutService.generateWorkout();
      await fetchWorkouts();
    } catch (e) {
      console.log('Generate error:', e);
    } finally {
      setGenerating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return Colors.primary;
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
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
          { paddingTop: insets.top + 16, paddingBottom: 110 },
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Plans</Text>
          <Text style={styles.headerSubtitle}>
            {workouts.length} personalized routines logged
          </Text>
        </View>

        {/* Generate new workout button */}
        <TouchableOpacity
          style={styles.generateButton}
          activeOpacity={0.88}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.generateIcon}>⚡</Text>
              <Text style={styles.generateText}>Generate AI Workout Plan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Workout list */}
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyText}>
              Tap the button above to generate your first personalized routine!
            </Text>
          </View>
        ) : (
          <View style={styles.workoutList}>
            {workouts.map((workout) => (
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
                <View style={styles.workoutHeader}>
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
                </View>

                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutDesc} numberOfLines={2}>
                  {workout.description || 'Personalized AI fitness session'}
                </Text>

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
      </ScrollView>
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
  screenContainer: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: '#6B7280' },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  generateIcon: { fontSize: 18 },
  generateText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  workoutList: { gap: 14 },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutDateBadge: {
    backgroundColor: '#ECEEF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  workoutDate: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  completedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedPillText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  activePill: {
    backgroundColor: 'rgba(250, 90, 71, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activePillText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111216',
    marginBottom: 4,
  },
  workoutDesc: { fontSize: 13, color: '#6B7280', marginBottom: 14, lineHeight: 18 },
  workoutFooter: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  workoutMeta: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  difficultyText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111216' },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 280 },
});
