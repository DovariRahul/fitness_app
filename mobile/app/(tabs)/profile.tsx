import React, { useState } from 'react';
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
import { EditIcon } from '../../components/Icons';
import EditProfileModal from '../../components/EditProfileModal';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [editModalVisible, setEditModalVisible] = useState(false);

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
          { paddingTop: insets.top + 16, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Athlete Profile</Text>
            <TouchableOpacity
              style={styles.headerEditBtn}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.75}
            >
              <EditIcon size={16} color={Colors.primary} />
              <Text style={styles.headerEditText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* User Hero Card */}
          <View style={styles.userHeroCard}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri:
                    user?.avatar_url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImg}
              />
            </View>

            <Text style={styles.userName}>{user?.name || 'Talan Levin'}</Text>
            <Text style={styles.userEmail}>
              {user?.email || 'demo.athlete@example.com'}
            </Text>

            <View style={styles.tagRow}>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>PRO ATHLETE</Text>
              </View>
            </View>

            {/* Edit Profile CTA Button */}
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.85}
            >
              <EditIcon size={16} color="#FFFFFF" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Fitness Metrics Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Fitness Metrics</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <Text style={styles.sectionEditLink}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsGrid}>
              {[
                { label: 'Age', value: `${profile?.age || 25} yrs` },
                { label: 'Height', value: `${profile?.height_cm || 175} cm` },
                { label: 'Weight', value: `${profile?.weight_kg || 72} kg` },
                {
                  label: 'Session Time',
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
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <Text style={styles.sectionEditLink}>Modify</Text>
              </TouchableOpacity>
            </View>

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

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuTitle}>✏️ Edit Profile & Metrics</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>

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
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.5,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(250,90,71,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ── User Hero Card ──
  userHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  tagRow: {
    marginBottom: 16,
  },
  proTag: {
    backgroundColor: '#ECEEF2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  proTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Sections ──
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111216',
  },
  sectionEditLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 4,
  },
  metricLbl: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Card Box
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
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
    textTransform: 'capitalize',
  },

  // Menu items
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111216',
  },
  menuChevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
