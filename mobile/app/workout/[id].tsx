import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import {
  BackArrowIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  MoreHorizontalIcon,
  PlayIcon,
  CheckIcon,
} from '../../components/Icons';
import workoutService from '../../services/workoutService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_DETAILS: Record<string, any> = {
  default: {
    category: 'CARDIO',
    title: 'Beginner HIIT Workout',
    meta: '10 min • 2 Sets • 30 sec rest between sets',
    calories: '500 KCal',
    exercisesCount: '10',
    instructor: {
      name: 'Kaiya Press',
      title: 'Fitness Instructor with 3y+ experience',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    heroImage:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80',
    description:
      'High-intensity interval training (HIIT) is a type of cardio that alternates short bursts of intense activity with periods of rest or low-intensity activity. The intense activity, or "work" period, is designed to elevate your heart rate and accelerate cardiovascular stamina.',
    exercises: [
      { name: 'Squat Jump', sets: '2 Sets', reps: '12 reps', duration: '45s' },
      { name: 'High Knees', sets: '2 Sets', reps: '20 reps', duration: '45s' },
      { name: 'Mountain Climbers', sets: '2 Sets', reps: '20 reps', duration: '45s' },
      { name: 'Burpees', sets: '2 Sets', reps: '10 reps', duration: '45s' },
      { name: 'Plank Jacks', sets: '2 Sets', reps: '15 reps', duration: '45s' },
      { name: 'Jumping Jacks', sets: '2 Sets', reps: '25 reps', duration: '45s' },
    ],
  },
};

export default function WorkoutDetailScreen() {
  const { id, title: queryTitle, category: queryCategory } = useLocalSearchParams<{
    id: string;
    title?: string;
    category?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  useEffect(() => {
    async function loadPlan() {
      if (id && id !== 'trending-1' && id !== 'trending-2' && id !== 'demo-active-1') {
        try {
          setLoading(true);
          const res = await workoutService.getWorkoutById(id);
          if (res && res.title) {
            setPlanData(res);
          }
        } catch (e) {
          console.log('Error fetching workout detail:', e);
        } finally {
          setLoading(false);
        }
      }
    }
    loadPlan();
  }, [id]);

  const detail = SAMPLE_DETAILS[id || 'default'] || SAMPLE_DETAILS.default;

  const displayCategory = planData?.exercises?.[0]?.exercise?.category?.toUpperCase() || queryCategory || detail.category;
  const displayTitle = planData?.title || queryTitle || detail.title;
  const displayCalories = planData?.estimated_calories_burned ? `${planData.estimated_calories_burned} KCal` : detail.calories;
  const displayExercisesCount = planData?.exercises?.length ? `${planData.exercises.length}` : detail.exercisesCount;
  const displayExercises = planData?.exercises?.map((e: any) => ({
    name: e.exercise?.name || 'Exercise',
    sets: `${e.sets || 2} Sets`,
    reps: `${e.reps || 12} reps`,
    duration: `${e.duration_sec || 45}s`,
  })) || detail.exercises;

  const handleStartWorkout = () => {
    router.push({
      pathname: '/workout-session',
      params: { planId: id || 'current' },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Section (Dark Theme) */}
        <View style={styles.heroSection}>
          <Image source={{ uri: detail.heroImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          {/* Top Nav Bar */}
          <View style={[styles.topNavBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.navCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BackArrowIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topNavRight}>
              <TouchableOpacity
                style={styles.navCircleBtn}
                onPress={() => setIsBookmarked(!isBookmarked)}
                activeOpacity={0.7}
              >
                {isBookmarked ? (
                  <BookmarkFilledIcon size={20} color={Colors.primary} />
                ) : (
                  <BookmarkIcon size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.navCircleBtn} activeOpacity={0.7}>
                <MoreHorizontalIcon size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Workout Overview Header */}
          <View style={styles.overviewHeader}>
            <Text style={styles.categoryBadge}>{displayCategory}</Text>
            <Text style={styles.workoutMainTitle}>{displayTitle}</Text>
            <Text style={styles.workoutSubMeta}>{detail.meta}</Text>

            {/* Stat Boxes matching screenshot */}
            <View style={styles.statsBoxesRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total burned calories</Text>
                <Text style={styles.statNumber}>{displayCalories}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total exercises</Text>
                <Text style={styles.statNumber}>{displayExercisesCount}</Text>
              </View>
            </View>

            {/* Instructor Profile Card */}
            <View style={styles.instructorRow}>
              <Image
                source={{ uri: detail.instructor.avatar }}
                style={styles.instructorImg}
              />
              <View style={styles.instructorText}>
                <Text style={styles.instructorName}>{detail.instructor.name}</Text>
                <Text style={styles.instructorTitle}>{detail.instructor.title}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* White Rounded Bottom Sheet */}
        <View style={styles.whiteSheet}>
          <Text style={styles.sheetSectionTitle}>Description Plan</Text>
          <Text style={styles.descText} numberOfLines={expandedDesc ? undefined : 3}>
            {detail.description}
          </Text>
          <TouchableOpacity
            onPress={() => setExpandedDesc(!expandedDesc)}
            activeOpacity={0.7}
            style={styles.viewMoreBtn}
          >
            <Text style={styles.viewMoreText}>
              {expandedDesc ? 'View Less' : 'View More'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.sheetSectionTitle, { marginTop: 24, marginBottom: 14 }]}>
            Exercises
          </Text>

          {/* Exercise Items */}
          <View style={styles.exercisesList}>
            {displayExercises.map((ex: any, idx: number) => (
              <View key={idx} style={styles.exerciseItemRow}>
                <View style={styles.exerciseIdxPill}>
                  <Text style={styles.exerciseIdxText}>{idx + 1}</Text>
                </View>

                <View style={styles.exerciseDetailCol}>
                  <Text style={styles.exerciseNameText}>{ex.name}</Text>
                  <Text style={styles.exerciseMetaText}>
                    {ex.sets} • {ex.reps}
                  </Text>
                </View>

                <View style={styles.playMiniBtn}>
                  <PlayIcon size={14} color="#8E8E93" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar matching screenshot */}
      <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.planTypeContainer}>
            <Text style={styles.planTypeLabel}>Plan Access</Text>
            <Text style={styles.planTypeValue}>Free Plan</Text>
          </View>

          <TouchableOpacity
            style={styles.startWorkoutBtn}
            onPress={handleStartWorkout}
            activeOpacity={0.88}
          >
            <PlayIcon size={16} color="#FFFFFF" />
            <Text style={styles.startWorkoutBtnText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#121214',
    paddingBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 320,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroOverlay: {
    width: '100%',
    height: 320,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 160,
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 12,
  },
  navCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(28, 28, 30, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewHeader: {
    paddingHorizontal: 20,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  workoutMainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  workoutSubMeta: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  statsBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#202024',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1A1A1E',
    borderRadius: 18,
    padding: 12,
  },
  instructorImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#333',
  },
  instructorText: {
    flex: 1,
  },
  instructorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  instructorTitle: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // White Rounded Bottom Sheet
  whiteSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 350,
  },
  sheetSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111216',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  viewMoreBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exerciseIdxPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  exerciseIdxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  exerciseDetailCol: {
    flex: 1,
  },
  exerciseNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111216',
    marginBottom: 2,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  playMiniBtn: {
    padding: 8,
  },

  // Sticky Bottom Action Bar
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTypeContainer: {
    justifyContent: 'center',
  },
  planTypeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  planTypeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111216',
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startWorkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
