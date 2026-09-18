import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import workoutService from '../../services/workoutService';
import progressService from '../../services/progressService';
import Colors from '../../constants/colors';
import {
  SearchIcon,
  BellIcon,
  MoreHorizontalIcon,
  FlameIcon,
} from '../../components/Icons';
import { WorkoutPlan } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = ['All', 'Strength Training', 'Cardio', 'Flexibility', 'HIIT'];

const SAMPLE_TRENDING = [
  {
    id: 'trending-1',
    category: 'CARDIO',
    title: 'Beginner HIIT Workout',
    duration: '10 min',
    sets: '2 Sets',
    rest: '30 sec rest between sets',
    exercisesCount: 5,
    calories: 500,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    instructor: {
      name: 'Kaiya Press',
      title: 'Fitness Instructor with 3y+ experience',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    description:
      'High-intensity interval training (HIIT) is a type of cardio that alternates short bursts of intense activity with periods of rest or low-intensity activity. The intense activity, or "work" period, is designed to elevate your heart rate rapidly.',
    exercises: [
      { name: 'Squat Jump', sets: 2, reps: '12 reps', duration: '45 sec' },
      { name: 'Mountain Climbers', sets: 2, reps: '20 reps', duration: '45 sec' },
      { name: 'Burpees', sets: 2, reps: '10 reps', duration: '45 sec' },
      { name: 'High Knees', sets: 2, reps: '30 reps', duration: '45 sec' },
      { name: 'Plank Jacks', sets: 2, reps: '15 reps', duration: '45 sec' },
    ],
  },
  {
    id: 'trending-2',
    category: 'STRENGTH TRAINING',
    title: 'Beginner Hand Exercise',
    duration: '10 min',
    sets: '2 Sets',
    rest: '45 sec rest between sets',
    exercisesCount: 5,
    calories: 171,
    image:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    instructor: {
      name: 'Marcus Brody',
      title: 'Senior Strength & Conditioning Coach',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    description:
      'Targeted forearm, grip, and upper arm mobility drills created for building functional joint health and wrist endurance.',
    exercises: [
      { name: 'Wrist Curls', sets: 2, reps: '15 reps', duration: '40 sec' },
      { name: 'Dumbbell Hammer Curls', sets: 2, reps: '12 reps', duration: '45 sec' },
      { name: 'Plate Pinch Hold', sets: 2, reps: '30 sec', duration: '30 sec' },
    ],
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState('All');
  const [todayPlan, setTodayPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const plan = await workoutService.getTodayWorkout().catch(() => null);
      if (plan && typeof plan === 'object' && 'title' in plan) {
        setTodayPlan(plan as WorkoutPlan);
      }
    } catch (e) {
      console.log('Error loading home data:', e);
    } finally {
      setLoading(false);
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

  const filteredTrending =
    activeCategory === 'All'
      ? SAMPLE_TRENDING
      : SAMPLE_TRENDING.filter((item) =>
          item.category.toLowerCase().includes(activeCategory.toLowerCase())
        );

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
        {/* Header matching screenshot */}
        <View style={styles.headerRow}>
          <View style={styles.userInfoWrapper}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            <View style={styles.userTextWrapper}>
              <Text style={styles.greetingText}>Good Morning 👋</Text>
              <Text style={styles.userNameText}>{displayName}</Text>
            </View>
          </View>

          <View style={styles.headerIconsRow}>
            <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.7}>
              <SearchIcon size={18} color="#111216" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.7}>
              <BellIcon size={18} color="#111216" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: My Active Plans */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Active Plans</Text>
          <TouchableOpacity style={styles.moreBtn} activeOpacity={0.6}>
            <MoreHorizontalIcon size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Active Plan Dark Card */}
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.activePlanCard}
          onPress={() => {
            const planId = todayPlan?.id || 'demo-active-1';
            router.push({
              pathname: '/workout/[id]',
              params: { id: planId },
            });
          }}
        >
          <View style={styles.activePlanContent}>
            {/* Exercise Thumbnail */}
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.planThumbnail}
            />

            {/* Plan Info */}
            <View style={styles.planInfo}>
              <Text style={styles.categoryTag}>
                {todayPlan?.title?.toLowerCase().includes('cardio')
                  ? 'CARDIO'
                  : 'STRENGTH TRAINING'}
              </Text>
              <Text style={styles.planTitle} numberOfLines={1}>
                {todayPlan?.title || 'Beginner Hand Exercise'}
              </Text>
              <Text style={styles.planMeta}>
                {todayPlan?.exercises?.length || 5} exercises • 2 sets •{' '}
                {todayPlan?.estimated_duration_min || 10} min
              </Text>
            </View>
          </View>

          {/* Metrics Row inside dark card */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Burned calories</Text>
              <Text style={styles.metricValue}>171 kcal</Text>
            </View>

            <View style={styles.metricBox}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.metricLabel}>Progress</Text>
                <Text style={styles.progressPercent}>68%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '68%' }]} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section: Trending Plans */}
        <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Trending Plans</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workouts')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs / Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Trending Workout Cards */}
        {filteredTrending.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.92}
            style={styles.trendingCard}
            onPress={() =>
              router.push({
                pathname: '/workout/[id]',
                params: {
                  id: item.id,
                  category: item.category,
                  title: item.title,
                },
              })
            }
          >
            {/* Card Hero Image */}
            <View style={styles.cardImageWrapper}>
              <Image source={{ uri: item.image }} style={styles.trendingImage} />
            </View>

            {/* Card Details */}
            <View style={styles.trendingDetails}>
              <View style={styles.trendingTextCol}>
                <Text style={styles.trendingCategory}>{item.category}</Text>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingMeta}>
                  {item.exercisesCount} moves • {item.sets} • {item.duration}
                </Text>
              </View>

              {/* Instructor Avatar Thumbnail */}
              <Image
                source={{ uri: item.instructor.avatar }}
                style={styles.instructorAvatar}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  userTextWrapper: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111216',
    letterSpacing: -0.2,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111216',
    letterSpacing: -0.3,
  },
  moreBtn: {
    padding: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Active Plan Card (Dark Charcoal)
  activePlanCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  activePlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  planThumbnail: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#2A2A2E',
  },
  planInfo: {
    flex: 1,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#26262B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#38383F',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },

  // Filter Pills
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#ECEEF2',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Trending Plans
  trendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  trendingTextCol: {
    flex: 1,
  },
  trendingCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  trendingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111216',
    marginBottom: 4,
  },
  trendingMeta: {
    fontSize: 13,
    color: '#71717A',
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
});
