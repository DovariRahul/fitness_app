import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import Colors from '../constants/colors';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

const GOALS = [
  { id: 'muscle_gain', label: '💪 Muscle Gain' },
  { id: 'weight_loss', label: '🔥 Weight Loss' },
  { id: 'strength', label: '🏋️ Strength' },
  { id: 'endurance', label: '🏃 Endurance' },
  { id: 'general_fitness', label: '⚡ General' },
];

const LEVELS = [
  { id: 'beginner', label: '🌱 Beginner' },
  { id: 'intermediate', label: '🌿 Intermediate' },
  { id: 'advanced', label: '🌳 Advanced' },
];

const DURATIONS = [15, 30, 45, 60];

export default function EditProfileModal({ visible, onClose, onProfileUpdated }: Props) {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile;

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '25');
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? String(profile.height_cm) : '175');
  const [weightKg, setWeightKg] = useState(profile?.weight_kg ? String(profile.weight_kg) : '72');
  const [goal, setGoal] = useState(profile?.fitness_goal || 'muscle_gain');
  const [level, setLevel] = useState(profile?.fitness_level || 'intermediate');
  const [duration, setDuration] = useState(profile?.available_time_minutes || 30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.profile?.age ? String(user.profile.age) : '25');
      setHeightCm(user.profile?.height_cm ? String(user.profile.height_cm) : '175');
      setWeightKg(user.profile?.weight_kg ? String(user.profile.weight_kg) : '72');
      setGoal(user.profile?.fitness_goal || 'muscle_gain');
      setLevel(user.profile?.fitness_level || 'intermediate');
      setDuration(user.profile?.available_time_minutes || 30);
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        age: parseInt(age, 10) || 25,
        height_cm: parseFloat(heightCm) || 175,
        weight_kg: parseFloat(weightKg) || 72,
        fitness_goal: goal,
        fitness_level: level,
        available_time_minutes: duration,
      };

      await userService.updateProfile(payload);
      await refreshUser();

      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }

      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Edit Athlete Profile</Text>
              <Text style={styles.headerSubtitle}>Update your metrics and fitness goals</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Metrics Row: Age, Height, Weight */}
            <View style={styles.metricsRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Age (yrs)</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  placeholder="72"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Fitness Goal */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Fitness Goal</Text>
              <View style={styles.pillsRow}>
                {GOALS.map((g) => {
                  const active = goal === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setGoal(g.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Fitness Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experience Level</Text>
              <View style={styles.pillsRow}>
                {LEVELS.map((l) => {
                  const active = level === l.id;
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setLevel(l.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {l.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Session Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Workout Duration</Text>
              <View style={styles.pillsRow}>
                {DURATIONS.map((d) => {
                  const active = duration === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setDuration(d)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        ⏱ {d} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.88}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile Changes ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.9,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '800',
  },
  body: {
    maxHeight: 460,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
    color: '#111216',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
