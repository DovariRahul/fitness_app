import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import workoutService from '../../services/workoutService';
import Colors from '../../constants/colors';
import { SearchIcon, BellIcon } from '../../components/Icons';
import { WorkoutPlan } from '../../types';
import {
  EXERCISE_CATEGORIES,
  ALL_EXERCISES,
  QUICK_10_MIN_WORKOUT,
  ExerciseItem,
} from '../../constants/exercisesData';
import ExerciseDetailModal from '../../components/ExerciseDetailModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isMobile = width < 768;
  const isSmallPhone = width < 375;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [todayPlan, setTodayPlan] = useState<WorkoutPlan | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const plan = await workoutService.getTodayWorkout().catch(() => null);
      if (plan && typeof plan === 'object' && 'title' in plan) {
        setTodayPlan(plan as WorkoutPlan);
      }
    } catch (e) {
      console.log('Error loading home data:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const displayName = user?.name || 'Talan Levin';
  const displayAvatar =
    user?.avatar_url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  // Filter exercises based on selected category
  const filteredExercises = useMemo(() => {
    if (activeCategory === 'popular') {
      return ALL_EXERCISES.filter((ex) => ex.isPopular);
    }
    if (activeCategory === 'no_equipment') {
      return ALL_EXERCISES.filter((ex) => ex.isNoEquipment);
    }
    return ALL_EXERCISES.filter((ex) => ex.category === activeCategory);
  }, [activeCategory]);

  const handleOpenExercise = (ex: ExerciseItem) => {
    setSelectedExercise(ex);
    setModalVisible(true);
  };

  const handleStartWorkout = () => {
    const planId = todayPlan?.id || 'demo-active-1';
    router.push({
      pathname: '/workout/[id]',
      params: { id: planId },
    });
  };

  const handleStartQuickWorkout = () => {
    router.push({
      pathname: '/workout-session',
      params: {
        plan_id: 'quick-10-min',
        custom_title: QUICK_10_MIN_WORKOUT.title,
      },
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return '#10B981';
      case 'Intermediate':
        return '#F59E0B';
      case 'Advanced':
        return '#EF4444';
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (isMobile ? 12 : 20),
            paddingBottom: 130, // Space for floating bottom tab bar
            paddingHorizontal: isMobile ? (isSmallPhone ? 12 : 16) : 24,
          },
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
          {/* ── Header ── */}
          <View style={styles.headerRow}>
            <View style={styles.userInfoWrapper}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              <View style={styles.userTextWrapper}>
                <Text style={styles.greetingText}>Good Morning 👋</Text>
                <Text style={styles.readyText} numberOfLines={1}>
                  Ready for today's workout, {displayName.split(' ')[0]}?
                </Text>
              </View>
            </View>

            <View style={styles.headerIconsRow}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/workouts')}
              >
                <SearchIcon size={18} color="#111216" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.7}>
                <BellIcon size={18} color="#111216" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Today's Workout Hero Banner ── */}
          <TouchableOpacity
            style={styles.todayCard}
            activeOpacity={0.92}
            onPress={handleStartWorkout}
          >
            <View style={styles.todayCardBackgroundGlow} />

            <View style={styles.todayCardTop}>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeFire}>🔥</Text>
                <Text style={styles.todayBadgeText}>TODAY'S WORKOUT</Text>
              </View>
              <View style={styles.todayMetaBadge}>
                <Text style={styles.todayMetaBadgeText}>
                  {todayPlan?.estimated_duration_min || 30} min •{' '}
                  {todayPlan?.difficulty
                    ? todayPlan.difficulty.toUpperCase()
                    : 'BEGINNER'}
                </Text>
              </View>
            </View>

            <Text style={styles.todayTitle} numberOfLines={1}>
              {todayPlan?.title || 'Full Body Adaptive Power'}
            </Text>

            <Text style={styles.todaySubtitle} numberOfLines={2}>
              {todayPlan?.description ||
                'Personalized session crafted to maximize calorie burn and progressive muscle recruitment.'}
            </Text>

            <View style={styles.todayDetailsRow}>
              <View style={styles.todayDetailItem}>
                <Text style={styles.todayDetailNumber}>
                  {todayPlan?.exercises?.length || 6}
                </Text>
                <Text style={styles.todayDetailLabel}>Exercises</Text>
              </View>

              <View style={styles.todayDetailDivider} />

              <View style={styles.todayDetailItem}>
                <Text style={styles.todayDetailNumber}>
                  {todayPlan?.estimated_duration_min || 30}m
                </Text>
                <Text style={styles.todayDetailLabel}>Duration</Text>
              </View>

              <View style={styles.todayDetailDivider} />

              <View style={styles.todayDetailItem}>
                <Text style={styles.todayDetailNumber}>🔥 250</Text>
                <Text style={styles.todayDetailLabel}>Est. kcal</Text>
              </View>
            </View>

            {/* Start Button */}
            <View style={styles.todayStartBtn}>
              <Text style={styles.todayStartBtnText}>START WORKOUT ▶</Text>
            </View>
          </TouchableOpacity>

          {/* ── Explore Exercises Categories ── */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Explore Exercises</Text>
              <Text style={styles.sectionSubtitle}>
                Browse library by target muscle group
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/workouts')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewPlansText}>All Plans →</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            {EXERCISE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterPill,
                    isActive && styles.filterPillActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterPillIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive && styles.filterPillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Exercise Grid Cards (Clean, compact, image + little info) ── */}
          <View style={styles.gridContainer}>
            {filteredExercises.map((exercise) => {
              const itemWidth =
                numColumns === 2
                  ? '48.5%'
                  : numColumns === 3
                  ? '31.5%'
                  : '23.5%';

              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseCard, { width: itemWidth }]}
                  activeOpacity={0.88}
                  onPress={() => handleOpenExercise(exercise)}
                >
                  {/* Thumbnail Image */}
                  <View style={styles.exerciseImageWrap}>
                    <Image
                      source={{ uri: exercise.image }}
                      style={styles.exerciseImage}
                    />
                    {/* Difficulty Badge */}
                    <View
                      style={[
                        styles.exerciseDiffBadge,
                        {
                          backgroundColor: getDifficultyColor(
                            exercise.difficulty
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.exerciseDiffText}>
                        {exercise.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Little Information on Home Page */}
                  <View style={styles.exerciseCardBody}>
                    <Text style={styles.exerciseCardName} numberOfLines={1}>
                      {exercise.name}
                    </Text>

                    <Text style={styles.exerciseCardTarget} numberOfLines={1}>
                      {exercise.target}
                    </Text>

                    <View style={styles.exerciseCardFooter}>
                      <Text style={styles.exerciseCardProtocol}>
                        {exercise.recommended.split('•')[0] || '3 sets'}
                      </Text>

                      {/* AI Alternative pill */}
                      <View style={styles.aiAltPill}>
                        <Text style={styles.aiAltPillText}>💡 AI Alt</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── ⚡ 10-Minute Quick Workout Section ── */}
          <View style={styles.quickWorkoutSection}>
            <View style={styles.quickWorkoutCard}>
              <View style={styles.quickWorkoutHeader}>
                <View style={styles.quickBadge}>
                  <Text style={styles.quickBadgeIcon}>⚡</Text>
                  <Text style={styles.quickBadgeTitle}>10-MINUTE QUICK WORKOUT</Text>
                </View>
                <Text style={styles.quickCaloriesBadge}>🔥 110 kcal</Text>
              </View>

              <Text style={styles.quickWorkoutTitle}>
                {QUICK_10_MIN_WORKOUT.title}
              </Text>
              <Text style={styles.quickWorkoutSubtitle}>
                {QUICK_10_MIN_WORKOUT.subtitle}
              </Text>

              {/* 6 Quick Exercise Routine Badges */}
              <View style={styles.quickExerciseChipsContainer}>
                {QUICK_10_MIN_WORKOUT.exercises.map((item, idx) => (
                  <View key={idx} style={styles.quickExerciseChip}>
                    <Text style={styles.quickChipNum}>{idx + 1}</Text>
                    <Text style={styles.quickChipName}>{item.name}</Text>
                    <Text style={styles.quickChipSpec}>{item.spec}</Text>
                  </View>
                ))}
              </View>

              {/* Start Quick Workout Button */}
              <TouchableOpacity
                style={styles.quickStartBtn}
                activeOpacity={0.88}
                onPress={handleStartQuickWorkout}
              >
                <Text style={styles.quickStartBtnText}>
                  START QUICK WORKOUT ⚡
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Exercise Detail Modal (Full Description + AI Alternatives) ── */}
      <ExerciseDetailModal
        visible={modalVisible}
        exercise={selectedExercise}
        onClose={() => setModalVisible(false)}
        onSelectExercise={(alt) => setSelectedExercise(alt)}
        onStartExercise={() => {
          setModalVisible(false);
          router.push({
            pathname: '/workout-session',
            params: {
              plan_id: selectedExercise?.id || 'exercise-single',
              custom_title: selectedExercise?.name,
            },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  // ── Header Row ──
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  userTextWrapper: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.3,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // ── Today's Workout Card ──
  todayCard: {
    backgroundColor: '#16171B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 26,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  todayCardBackgroundGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(250,90,71,0.15)',
  },
  todayCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250,90,71,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(250,90,71,0.3)',
  },
  todayBadgeFire: {
    fontSize: 12,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  todayMetaBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayMetaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  todayTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  todaySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 19,
    marginBottom: 16,
  },
  todayDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202127',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  todayDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  todayDetailNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  todayDetailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  todayDetailDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  todayStartBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  todayStartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // ── Explore Section ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  viewPlansText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    paddingBottom: 2,
  },

  // ── Filter Pills ──
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#ECEEF2',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterPillIcon: {
    fontSize: 13,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // ── Exercise Grid (Home page shows only little info + image) ──
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 28,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseImageWrap: {
    position: 'relative',
    height: 115,
    backgroundColor: '#E5E7EB',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exerciseDiffBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  exerciseDiffText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  exerciseCardBody: {
    padding: 10,
  },
  exerciseCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  exerciseCardTarget: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  exerciseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  exerciseCardProtocol: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  aiAltPill: {
    backgroundColor: 'rgba(250,90,71,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiAltPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },

  // ── ⚡ 10-Minute Quick Workout Section ──
  quickWorkoutSection: {
    marginBottom: 10,
  },
  quickWorkoutCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  quickWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  quickBadgeIcon: {
    fontSize: 12,
  },
  quickBadgeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  quickCaloriesBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickWorkoutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  quickWorkoutSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  quickExerciseChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  quickExerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickChipNum: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  quickChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickChipSpec: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  quickStartBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStartBtnText: {
    color: '#111216',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
