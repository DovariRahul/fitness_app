import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import progressService from '../../services/progressService';
import Colors from '../../constants/colors';
import { ProgressStats, WeeklyProgress } from '../../types';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [s, w] = await Promise.all([
        progressService.getStats().catch(() => null),
        progressService.getWeeklyProgress().catch(() => null),
      ]);
      setStats(s);
      setWeekly(w);
    } catch (e) {
      console.log('Progress fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            Activity metrics & performance analytics
          </Text>
        </View>

        {/* Stats Highlights */}
        <View style={styles.statsGrid}>
          <View style={styles.highlightCardDark}>
            <Text style={styles.highlightEmoji}>🔥</Text>
            <Text style={styles.highlightNumber}>{stats?.streak || 3}</Text>
            <Text style={styles.highlightLabel}>Day Streak</Text>
          </View>

          <View style={styles.highlightCardCoral}>
            <Text style={styles.highlightEmoji}>🎯</Text>
            <Text style={styles.highlightNumber}>
              {stats?.completion_rate ? `${stats.completion_rate}%` : '85%'}
            </Text>
            <Text style={styles.highlightLabel}>Completion Rate</Text>
          </View>
        </View>

        {/* Quick Stat Pills */}
        <View style={styles.statsRow}>
          {[
            {
              icon: '🏋️',
              value: stats?.completed_workouts || 12,
              label: 'Workouts',
            },
            {
              icon: '🔥',
              value: `${Math.round(stats?.total_calories || 1850)}`,
              label: 'Calories',
            },
            {
              icon: '⏱',
              value: `${Math.round(stats?.total_duration_minutes || 240)}m`,
              label: 'Time',
            },
          ].map((item, i) => (
            <View key={i} style={styles.statPillCard}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <Text style={styles.sectionValue}>
              {weekly?.workouts_this_week || 4} workouts completed
            </Text>
          </View>

          <View style={styles.chartContainer}>
            {(weekly?.days || [
              { day: 'Mon', completion: 80, is_today: false },
              { day: 'Tue', completion: 100, is_today: false },
              { day: 'Wed', completion: 60, is_today: false },
              { day: 'Thu', completion: 90, is_today: true },
              { day: 'Fri', completion: 0, is_today: false },
              { day: 'Sat', completion: 0, is_today: false },
              { day: 'Sun', completion: 0, is_today: false },
            ]).map((day, i) => {
              const hasActivity = day.completion > 0;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.barOuter}>
                    <View
                      style={[
                        styles.barInner,
                        {
                          height: `${Math.max(day.completion, 6)}%`,
                          backgroundColor: day.is_today
                            ? Colors.primary
                            : hasActivity
                            ? '#1C1C1E'
                            : '#E5E7EB',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      day.is_today && styles.dayLabelActive,
                    ]}
                  >
                    {day.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Motivational Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>⚡</Text>
          <Text style={styles.motivationTitle}>
            {(stats?.streak || 0) > 0
              ? `${stats?.streak} day streak! Keep pushing forward!`
              : 'You are on track! Keep up the great work!'}
          </Text>
          <Text style={styles.motivationText}>
            Consistent progressive workouts yield lasting results. Your body is adapting every single day.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  highlightCardDark: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  highlightCardCoral: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  highlightEmoji: { fontSize: 24, marginBottom: 4 },
  highlightNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statPillCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111216',
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111216' },
  sectionValue: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  chartCol: { flex: 1, alignItems: 'center', gap: 8 },
  barOuter: { flex: 1, width: '45%', justifyContent: 'flex-end' },
  barInner: { width: '100%', borderRadius: 6, minHeight: 6 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  dayLabelActive: { color: Colors.primary, fontWeight: '700' },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  motivationEmoji: { fontSize: 32, marginBottom: 6 },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111216',
    textAlign: 'center',
    marginBottom: 6,
  },
  motivationText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
});
