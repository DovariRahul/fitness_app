import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = user?.profile;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to logout?');
      if (confirm) {
        await logout();
        router.replace('/(auth)/login');
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]);
    }
  };

  const goalLabels: Record<string, string> = {
    weight_loss: '🔥 Weight Loss',
    muscle_gain: '💪 Muscle Gain',
    strength: '🏋️ Strength',
    endurance: '🏃 Endurance',
    general_fitness: '⚡ General Fitness',
  };

  const levelLabels: Record<string, string> = {
    beginner: '🟢 Beginner',
    intermediate: '🟡 Intermediate',
    advanced: '🔴 Advanced',
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Athlete Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userHeroCard}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg}
          />
          <Text style={styles.userName}>{user?.name || 'Talan Levin'}</Text>
          <Text style={styles.userEmail}>
            {user?.email || 'demo.athlete@example.com'}
          </Text>

          <View style={styles.proTag}>
            <Text style={styles.proTagText}>PRO ATHLETE</Text>
          </View>
        </View>

        {/* Fitness Profile Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Metrics</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Age', value: `${profile?.age || 25} yrs` },
              { label: 'Height', value: `${profile?.height_cm || 175} cm` },
              { label: 'Weight', value: `${profile?.weight_kg || 72} kg` },
              {
                label: 'Session Duration',
                value: `${profile?.available_time_minutes || 30}m`,
              },
            ].map((item, i) => (
              <View key={i} style={styles.metricCard}>
                <Text style={styles.metricNum}>{item.value}</Text>
                <Text style={styles.metricLbl}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals & Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.cardBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fitness Goal</Text>
              <Text style={styles.infoValue}>
                {goalLabels[profile?.fitness_goal || 'muscle_gain'] || 'Muscle Gain'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience Level</Text>
              <Text style={styles.infoValue}>
                {levelLabels[profile?.fitness_level || 'intermediate'] || 'Intermediate'}
              </Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Equipment</Text>
              <Text style={styles.infoValue}>
                {(profile?.available_equipment || ['dumbbells', 'none']).join(', ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/(auth)/assessment')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuTitle}>📋 Retake Fitness Assessment</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 18 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.5,
  },
  userHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  proTag: {
    backgroundColor: 'rgba(250, 90, 71, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  proTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111216',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 2,
  },
  metricLbl: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111216',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111216',
  },
  menuChevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
