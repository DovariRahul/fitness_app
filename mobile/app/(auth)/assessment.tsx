import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import Colors from '../../constants/colors';
import Layout from '../../constants/layout';
import { FitnessLevel, FitnessGoal, Equipment } from '../../types';

const GOALS: { label: string; value: FitnessGoal; icon: string }[] = [
  { label: 'Weight Loss', value: 'weight_loss', icon: '🔥' },
  { label: 'Muscle Gain', value: 'muscle_gain', icon: '💪' },
  { label: 'Strength', value: 'strength', icon: '🏋️' },
  { label: 'Endurance', value: 'endurance', icon: '🏃' },
  { label: 'General Fitness', value: 'general_fitness', icon: '⚡' },
];

const LEVELS: { label: string; value: FitnessLevel; desc: string }[] = [
  { label: 'Beginner', value: 'beginner', desc: 'New to exercise or returning after a long break' },
  { label: 'Intermediate', value: 'intermediate', desc: '6+ months of consistent training' },
  { label: 'Advanced', value: 'advanced', desc: '2+ years of serious training' },
];

const EQUIPMENT: { label: string; value: Equipment; icon: string }[] = [
  { label: 'No Equipment', value: 'none', icon: '🙌' },
  { label: 'Dumbbells', value: 'dumbbells', icon: '🏋️' },
  { label: 'Barbell', value: 'barbell', icon: '🏗️' },
  { label: 'Resistance Bands', value: 'resistance_bands', icon: '🔗' },
  { label: 'Pull-up Bar', value: 'pull_up_bar', icon: '🔩' },
  { label: 'Kettlebell', value: 'kettlebell', icon: '⚙️' },
];

export default function AssessmentScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Form state
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [level, setLevel] = useState<FitnessLevel | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>(['none']);
  const [time, setTime] = useState('30');

  const totalSteps = 4;

  const toggleEquipment = (item: Equipment) => {
    if (item === 'none') {
      setEquipment(['none']);
    } else {
      const newEquip = equipment.filter(e => e !== 'none');
      if (newEquip.includes(item)) {
        const filtered = newEquip.filter(e => e !== item);
        setEquipment(filtered.length > 0 ? filtered : ['none']);
      } else {
        setEquipment([...newEquip, item]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!goal || !level) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      await userService.submitAssessment({
        age: parseInt(age) || 25,
        height_cm: parseFloat(height) || 170,
        weight_kg: parseFloat(weight) || 70,
        fitness_goal: goal,
        fitness_level: level,
        available_time_minutes: parseInt(time) || 30,
        available_equipment: equipment,
        workout_experience_months: 0,
        preferred_workout_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        has_medical_concerns: false,
      });
      await refreshUser();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return age && height && weight;
      case 1: return goal !== null;
      case 2: return level !== null;
      case 3: return equipment.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📋 Basic Info</Text>
            <Text style={styles.stepDesc}>Tell us about yourself</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="175"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Workout Time (min)</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="30"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🎯 Fitness Goal</Text>
            <Text style={styles.stepDesc}>What do you want to achieve?</Text>
            <View style={styles.optionsList}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.optionCard, goal === g.value && styles.optionCardSelected]}
                  onPress={() => setGoal(g.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{g.icon}</Text>
                  <Text style={[styles.optionText, goal === g.value && styles.optionTextSelected]}>
                    {g.label}
                  </Text>
                  {goal === g.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📊 Fitness Level</Text>
            <Text style={styles.stepDesc}>How would you rate your current fitness?</Text>
            <View style={styles.optionsList}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.value}
                  style={[styles.optionCard, level === l.value && styles.optionCardSelected]}
                  onPress={() => setLevel(l.value)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionText, level === l.value && styles.optionTextSelected]}>
                      {l.label}
                    </Text>
                    <Text style={styles.optionDesc}>{l.desc}</Text>
                  </View>
                  {level === l.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🏋️ Equipment</Text>
            <Text style={styles.stepDesc}>What equipment do you have access to?</Text>
            <View style={styles.optionsList}>
              {EQUIPMENT.map((e) => (
                <TouchableOpacity
                  key={e.value}
                  style={[styles.optionCard, equipment.includes(e.value) && styles.optionCardSelected]}
                  onPress={() => toggleEquipment(e.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{e.icon}</Text>
                  <Text style={[styles.optionText, equipment.includes(e.value) && styles.optionTextSelected]}>
                    {e.label}
                  </Text>
                  {equipment.includes(e.value) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${((step + 1) / totalSteps) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>Step {step + 1} of {totalSteps}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButtonWrapper, !canProceed() && styles.buttonDisabled]}
          onPress={() => {
            if (step < totalSteps - 1) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={!canProceed() || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.nextButtonText, !canProceed() && { color: '#E5E7EB' }]}>
                {step < totalSteps - 1 ? 'Continue' : 'Get Started'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  progressContainer: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#26262B', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primary },
  progressText: { fontSize: 12, color: '#8E8E93', marginTop: 8, textAlign: 'right' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  stepDesc: { fontSize: 15, color: '#9CA3AF', marginBottom: 24 },
  inputGroup: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginLeft: 4 },
  input: {
    backgroundColor: '#1C1C1E', borderRadius: 14,
    padding: 16, fontSize: 16, color: '#FFFFFF',
    borderWidth: 1, borderColor: '#2E2E34',
  },
  row: { flexDirection: 'row' },
  optionsList: { gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1E', borderRadius: 16,
    padding: 16, borderWidth: 1.5, borderColor: '#26262B',
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(250, 90, 71, 0.1)' },
  optionIcon: { fontSize: 24, marginRight: 12 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  optionTextSelected: { color: Colors.primary },
  optionDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  checkmark: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  bottomBar: {
    flexDirection: 'row', padding: 20, paddingBottom: 36, gap: 12,
    backgroundColor: '#121214',
  },
  backButton: {
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14,
    backgroundColor: '#1C1C1E', justifyContent: 'center',
  },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  nextButtonWrapper: { flex: 1 },
  nextButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.6 },
});
