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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';
import workoutService from '../services/workoutService';
import { TIMETABLE_STORAGE_KEY, DEFAULT_TIMETABLE, TimetableDay } from './WorkoutTimetableModal';

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: number;
  target_muscle: string;
}

interface DayPlanConfig {
  day: string; // 'Monday', 'Tuesday', etc.
  shortDay: string; // 'Mon', 'Tue', etc.
  selected: boolean;
  time: string; // '07:00 AM'
  focus: string; // 'Chest & Triceps'
  duration: number; // 45
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: ExerciseItem[];
}

const ALL_DAYS: { day: string; short: string }[] = [
  { day: 'Monday', short: 'Mon' },
  { day: 'Tuesday', short: 'Tue' },
  { day: 'Wednesday', short: 'Wed' },
  { day: 'Thursday', short: 'Thu' },
  { day: 'Friday', short: 'Fri' },
  { day: 'Saturday', short: 'Sat' },
  { day: 'Sunday', short: 'Sun' },
];

const DEFAULT_EXERCISES_BY_FOCUS: Record<string, { name: string; sets: number; reps: number; target: string }[]> = {
  'Chest & Triceps': [
    { name: 'Standard Push-Ups', sets: 4, reps: 15, target: 'Chest' },
    { name: 'Incline Push-Ups', sets: 3, reps: 12, target: 'Upper Chest' },
    { name: 'Diamond Push-Ups', sets: 3, reps: 10, target: 'Triceps' },
    { name: 'Bench Dips', sets: 3, reps: 12, target: 'Triceps' },
  ],
  'Back & Biceps': [
    { name: 'Pull-Ups / Inverted Rows', sets: 4, reps: 8, target: 'Back' },
    { name: 'Superman Hold', sets: 3, reps: 12, target: 'Lower Back' },
    { name: 'Doorframe Rows', sets: 3, reps: 12, target: 'Lats' },
    { name: 'Bicep Curls (Band/Dumbbell)', sets: 3, reps: 12, target: 'Biceps' },
  ],
  'Legs & Core': [
    { name: 'Bodyweight Squats', sets: 4, reps: 15, target: 'Quads & Glutes' },
    { name: 'Walking Lunges', sets: 3, reps: 12, target: 'Hamstrings' },
    { name: 'Calf Raises', sets: 3, reps: 20, target: 'Calves' },
    { name: 'Forearm Plank', sets: 3, reps: 45, target: 'Core' },
  ],
  'Shoulders & Arms': [
    { name: 'Pike Push-Ups', sets: 3, reps: 10, target: 'Shoulders' },
    { name: 'Lateral Raises', sets: 3, reps: 15, target: 'Deltoids' },
    { name: 'Overhead Arm Pulses', sets: 3, reps: 20, target: 'Shoulders' },
    { name: 'Tricep Pushdowns / Dips', sets: 3, reps: 12, target: 'Triceps' },
  ],
  'Full Body Circuit': [
    { name: 'Burpees', sets: 3, reps: 10, target: 'Full Body' },
    { name: 'Bodyweight Squats', sets: 3, reps: 15, target: 'Legs' },
    { name: 'Push-Ups', sets: 3, reps: 12, target: 'Chest' },
    { name: 'Mountain Climbers', sets: 3, reps: 20, target: 'Core' },
  ],
  'Core & Cardio': [
    { name: 'Jumping Jacks', sets: 3, reps: 30, target: 'Cardio' },
    { name: 'Mountain Climbers', sets: 3, reps: 25, target: 'Core' },
    { name: 'Bicycle Crunches', sets: 3, reps: 20, target: 'Abs' },
    { name: 'Plank Shoulder Taps', sets: 3, reps: 16, target: 'Core' },
  ],
};

const POPULAR_FOCUS_LIST = [
  'Chest & Triceps',
  'Back & Biceps',
  'Legs & Core',
  'Shoulders & Arms',
  'Full Body Circuit',
  'Core & Cardio',
];

const POPULAR_EXERCISE_SUGGESTIONS = [
  'Push-Ups',
  'Pull-Ups',
  'Bodyweight Squats',
  'Walking Lunges',
  'Plank Hold',
  'Diamond Push-Ups',
  'Mountain Climbers',
  'Bench Dips',
  'Burpees',
  'Bicycle Crunches',
  'Calf Raises',
  'Pike Push-Ups',
  'Glute Bridges',
];

const QUICK_TIME_OPTIONS = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '12:30 PM',
  '05:30 PM',
  '06:30 PM',
  '08:00 PM',
];

const DURATION_OPTIONS = [20, 30, 45, 60, 75];

interface Props {
  visible: boolean;
  onClose: () => void;
  onWorkoutCreated: (newPlan?: any) => void;
}

export default function ManualWorkoutModal({ visible, onClose, onWorkoutCreated }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.max(540, Math.min(screenHeight * 0.9, 740));

  // Initialize 7 days
  const [dayConfigs, setDayConfigs] = useState<DayPlanConfig[]>(() =>
    ALL_DAYS.map((d, idx) => {
      const defaultFocuses = [
        'Chest & Triceps',
        'Back & Biceps',
        'Legs & Core',
        'Shoulders & Arms',
        'Full Body Circuit',
        'Core & Cardio',
        'Active Recovery',
      ];
      const focus = defaultFocuses[idx % defaultFocuses.length];
      const initialExercises = (DEFAULT_EXERCISES_BY_FOCUS[focus] || DEFAULT_EXERCISES_BY_FOCUS['Full Body Circuit']).map(
        (ex, i) => ({
          id: `${d.short}-${i}-${Date.now()}`,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          target_muscle: ex.target,
        })
      );

      // Default: Mon, Wed, Fri selected
      const isDefaultSelected = idx === 0 || idx === 2 || idx === 4;

      return {
        day: d.day,
        shortDay: d.short,
        selected: isDefaultSelected,
        time: '07:00 AM',
        focus,
        duration: 45,
        difficulty: 'intermediate',
        exercises: initialExercises,
      };
    })
  );

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [customExName, setCustomExName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When modal becomes visible, default activeDayIndex to the first selected day
  useEffect(() => {
    if (visible) {
      const firstSelected = dayConfigs.findIndex((d) => d.selected);
      setActiveDayIndex(firstSelected >= 0 ? firstSelected : 0);
      setCustomExName('');
      setSavedSuccess(false);
      setErrorMessage(null);
    }
  }, [visible]);

  // Toggle day selection
  const handleToggleDay = (index: number) => {
    setErrorMessage(null);
    setDayConfigs((prev) => {
      const next = [...prev];
      const current = next[index];
      next[index] = { ...current, selected: !current.selected };
      return next;
    });
    // Set as active day
    setActiveDayIndex(index);
  };

  // Quick Preset Split
  const handleApplyDayPreset = (preset: '3days' | '4days' | '5days' | 'all') => {
    setErrorMessage(null);
    setDayConfigs((prev) =>
      prev.map((d, idx) => {
        let isSelected = false;
        if (preset === '3days') isSelected = idx === 0 || idx === 2 || idx === 4; // Mon, Wed, Fri
        else if (preset === '4days') isSelected = idx === 0 || idx === 1 || idx === 3 || idx === 4; // Mon, Tue, Thu, Fri
        else if (preset === '5days') isSelected = idx >= 0 && idx <= 4; // Mon - Fri
        else if (preset === 'all') isSelected = true;

        return { ...d, selected: isSelected };
      })
    );
    setActiveDayIndex(0);
  };

  const activeDay = dayConfigs[activeDayIndex] || dayConfigs[0];

  // Update field of active day
  const handleUpdateActiveDay = (field: keyof DayPlanConfig, val: any) => {
    setDayConfigs((prev) => {
      const next = [...prev];
      next[activeDayIndex] = { ...next[activeDayIndex], [field]: val };
      return next;
    });
  };

  // Change focus and optionally auto-fill suggested exercises
  const handleSelectFocus = (newFocus: string) => {
    const suggested = DEFAULT_EXERCISES_BY_FOCUS[newFocus];
    const newExercises = suggested
      ? suggested.map((ex, i) => ({
          id: `${activeDay.shortDay}-${i}-${Date.now()}`,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          target_muscle: ex.target,
        }))
      : activeDay.exercises;

    setDayConfigs((prev) => {
      const next = [...prev];
      next[activeDayIndex] = {
        ...next[activeDayIndex],
        focus: newFocus,
        exercises: newExercises,
      };
      return next;
    });
  };

  // Add exercise to active day
  const handleAddExercise = (exerciseName?: string) => {
    const nameToAdd = (exerciseName || customExName).trim();
    if (!nameToAdd) return;

    const newEx: ExerciseItem = {
      id: `${activeDay.shortDay}-${Date.now()}-${Math.random()}`,
      name: nameToAdd,
      sets: 3,
      reps: 12,
      target_muscle: activeDay.focus,
    };

    setDayConfigs((prev) => {
      const next = [...prev];
      next[activeDayIndex] = {
        ...next[activeDayIndex],
        exercises: [...next[activeDayIndex].exercises, newEx],
      };
      return next;
    });

    if (!exerciseName) setCustomExName('');
  };

  // Remove exercise from active day
  const handleRemoveExercise = (exId: string) => {
    setDayConfigs((prev) => {
      const next = [...prev];
      next[activeDayIndex] = {
        ...next[activeDayIndex],
        exercises: next[activeDayIndex].exercises.filter((e) => e.id !== exId),
      };
      return next;
    });
  };

  // Update exercise sets / reps in active day
  const handleUpdateExerciseNumber = (exId: string, field: 'sets' | 'reps', val: number) => {
    setDayConfigs((prev) => {
      const next = [...prev];
      next[activeDayIndex] = {
        ...next[activeDayIndex],
        exercises: next[activeDayIndex].exercises.map((e) =>
          e.id === exId ? { ...e, [field]: val } : e
        ),
      };
      return next;
    });
  };

  // Submit and create plans for selected days
  const handleSaveAll = async () => {
    setErrorMessage(null);
    const selectedDays = dayConfigs.filter((d) => d.selected);
    if (selectedDays.length === 0) {
      setErrorMessage('Please select at least one workout day above.');
      return;
    }

    setSaving(true);
    try {
      // 1. Prepare exercises list, auto-fill fallback if any day was left without exercises
      const preparedDays = selectedDays.map((d) => {
        let exList = d.exercises;
        if (!exList || exList.length === 0) {
          const defaults =
            DEFAULT_EXERCISES_BY_FOCUS[d.focus] ||
            DEFAULT_EXERCISES_BY_FOCUS['Full Body Circuit'];
          exList = defaults.map((ex, i) => ({
            id: `${d.shortDay}-${i}-${Date.now()}`,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            target_muscle: ex.target,
          }));
        }
        return { ...d, exercises: exList };
      });

      // 2. Prepare structured workout plans
      const plansToCreate = preparedDays.map((d, i) => ({
        id: `man-${Date.now()}-${i}`,
        title: `${d.day}: ${d.focus}`,
        description: `Manual routine for ${d.day} at ${d.time}`,
        difficulty: d.difficulty,
        estimated_duration_min: d.duration,
        day: d.day,
        time: d.time,
        date: new Date().toISOString().split('T')[0],
        is_completed: false,
        ai_generated: false,
        goal: 'custom',
        exercises: d.exercises.map((e, idx) => ({
          exercise_id: `man-${d.shortDay.toLowerCase()}-${idx}`,
          exercise_name: e.name,
          sets: Number(e.sets) || 3,
          reps: Number(e.reps) || 12,
          order: idx + 1,
          target_muscle: e.target_muscle || d.focus,
        })),
      }));

      // 3. Save to local storage first so plans ALWAYS persist immediately
      try {
        const storedLocal = await AsyncStorage.getItem('@local_manual_workouts');
        const localList = storedLocal ? JSON.parse(storedLocal) : [];
        await AsyncStorage.setItem(
          '@local_manual_workouts',
          JSON.stringify([...plansToCreate, ...localList])
        );
      } catch (e) {
        console.log('Local storage save note:', e);
      }

      // 4. Update weekly timetable in AsyncStorage
      try {
        const stored = await AsyncStorage.getItem(TIMETABLE_STORAGE_KEY);
        const existingTimetable: TimetableDay[] = stored ? JSON.parse(stored) : DEFAULT_TIMETABLE;

        const updatedTimetable = existingTimetable.map((t) => {
          const matched = dayConfigs.find((c) => c.day === t.day);
          if (matched) {
            return {
              ...t,
              isRest: !matched.selected,
              targetFocus: matched.selected ? matched.focus : 'Rest & Recovery',
              time: matched.time,
              duration: matched.selected ? matched.duration : 0,
            };
          }
          return t;
        });

        await AsyncStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(updatedTimetable));
      } catch (err) {
        console.log('Timetable sync note:', err);
      }

      // 5. Attempt backend batch creation (if backend connected / token valid)
      try {
        await workoutService.createManualWorkoutBatch(plansToCreate);
      } catch (backendErr) {
        console.log('Backend sync note (saved locally):', backendErr);
      }

      // 6. Visual success & close
      setSavedSuccess(true);
      onWorkoutCreated();

      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      console.warn('Error saving workout routines:', err);
      setErrorMessage(err?.message || 'Could not save workout routines.');
      setSaving(false);
    }
  };

  const selectedCount = dayConfigs.filter((d) => d.selected).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View
          style={[
            modal.sheet,
            {
              height: sheetHeight,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Handle bar */}
          <View style={modal.handleBar} />

          {/* Header */}
          <View style={modal.header}>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
              <Text style={modal.closeIcon}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={modal.headerTitle}>Manual Workout Planner</Text>
              <Text style={modal.headerSubtitle}>
                Select days, schedule exercises & timings
              </Text>
            </View>
            <View style={modal.headerBadge}>
              <Text style={modal.headerBadgeText}>✍️ Days & Exercises</Text>
            </View>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            style={modal.body}
            contentContainerStyle={modal.bodyScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── STEP 1: CHOOSE DAYS ── */}
            <View style={sec.section}>
              <View style={sec.sectionTitleRow}>
                <Text style={sec.sectionTitle}>🗓️ 1. Choose Training Days</Text>
                <Text style={sec.sectionBadge}>{selectedCount} Selected</Text>
              </View>

              {/* 7-Day Chips Row */}
              <View style={sec.daysRow}>
                {dayConfigs.map((d, idx) => {
                  const isSelected = d.selected;
                  const isActive = activeDayIndex === idx;
                  return (
                    <TouchableOpacity
                      key={d.day}
                      style={[
                        sec.dayPill,
                        isSelected && sec.dayPillSelected,
                        isActive && sec.dayPillActive,
                      ]}
                      onPress={() => handleToggleDay(idx)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          sec.dayPillText,
                          isSelected && sec.dayPillTextSelected,
                          isActive && sec.dayPillTextActive,
                        ]}
                      >
                        {d.shortDay}
                      </Text>
                      <Text style={sec.dayPillStatus}>
                        {isSelected ? '✓' : '—'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick Split Presets */}
              <View style={sec.presetsRow}>
                <TouchableOpacity
                  style={sec.presetBtn}
                  onPress={() => handleApplyDayPreset('3days')}
                  activeOpacity={0.8}
                >
                  <Text style={sec.presetBtnText}>⚡ 3 Days (M/W/F)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={sec.presetBtn}
                  onPress={() => handleApplyDayPreset('4days')}
                  activeOpacity={0.8}
                >
                  <Text style={sec.presetBtnText}>⚡ 4 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={sec.presetBtn}
                  onPress={() => handleApplyDayPreset('5days')}
                  activeOpacity={0.8}
                >
                  <Text style={sec.presetBtnText}>⚡ 5 Days (M–F)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={sec.presetBtn}
                  onPress={() => handleApplyDayPreset('all')}
                  activeOpacity={0.8}
                >
                  <Text style={sec.presetBtnText}>⚡ All 7</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── STEP 2: CONFIGURE ACTIVE DAY (EXERCISES & TIME) ── */}
            <View style={sec.section}>
              <View style={sec.sectionTitleRow}>
                <Text style={sec.sectionTitle}>
                  ⚡ 2. Configure Day: {activeDay.day}
                </Text>
                <TouchableOpacity
                  style={[
                    sec.dayToggleTag,
                    activeDay.selected ? sec.dayToggleOn : sec.dayToggleOff,
                  ]}
                  onPress={() => handleToggleDay(activeDayIndex)}
                  activeOpacity={0.8}
                >
                  <Text style={sec.dayToggleText}>
                    {activeDay.selected ? '✓ Active Workout Day' : '😴 Rest Day'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Day Tabs Switcher */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={sec.activeDayTabs}
              >
                {dayConfigs.map((d, idx) => (
                  <TouchableOpacity
                    key={d.day}
                    style={[
                      sec.dayTab,
                      activeDayIndex === idx && sec.dayTabCurrent,
                      !d.selected && sec.dayTabUnselected,
                    ]}
                    onPress={() => setActiveDayIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        sec.dayTabText,
                        activeDayIndex === idx && sec.dayTabTextCurrent,
                      ]}
                    >
                      {d.shortDay}
                    </Text>
                    <Text style={sec.dayTabTime}>
                      {d.selected ? d.time : 'Rest'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Active Day Content */}
              {activeDay.selected ? (
                <View style={sec.dayCardContent}>
                  {/* Workout Time */}
                  <View style={sec.subSection}>
                    <Text style={sec.fieldLabel}>⏰ Workout Time for {activeDay.day}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={sec.timeScroll}
                    >
                      {QUICK_TIME_OPTIONS.map((t) => {
                        const isTimeActive = activeDay.time === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[sec.timePill, isTimeActive && sec.timePillActive]}
                            onPress={() => handleUpdateActiveDay('time', t)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                sec.timePillText,
                                isTimeActive && sec.timePillTextActive,
                              ]}
                            >
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Custom Time text input */}
                    <TextInput
                      style={sec.inputSmall}
                      placeholder="Or enter custom time (e.g. 06:45 AM)..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={activeDay.time}
                      onChangeText={(val) => handleUpdateActiveDay('time', val)}
                    />
                  </View>

                  {/* Workout Target / Split Focus */}
                  <View style={sec.subSection}>
                    <Text style={sec.fieldLabel}>🎯 Target Muscle / Focus</Text>
                    <TextInput
                      style={sec.input}
                      placeholder="e.g. Chest & Triceps"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={activeDay.focus}
                      onChangeText={(val) => handleUpdateActiveDay('focus', val)}
                    />

                    {/* Quick Focus Pills */}
                    <View style={sec.quickFocusWrap}>
                      {POPULAR_FOCUS_LIST.map((f) => {
                        const isFocusActive = activeDay.focus === f;
                        return (
                          <TouchableOpacity
                            key={f}
                            style={[
                              sec.quickFocusPill,
                              isFocusActive && sec.quickFocusPillActive,
                            ]}
                            onPress={() => handleSelectFocus(f)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                sec.quickFocusText,
                                isFocusActive && sec.quickFocusTextActive,
                              ]}
                            >
                              {f}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Duration Selector */}
                  <View style={sec.subSection}>
                    <Text style={sec.fieldLabel}>⏱ Duration (minutes)</Text>
                    <View style={sec.durationRow}>
                      {DURATION_OPTIONS.map((mins) => {
                        const isDurActive = activeDay.duration === mins;
                        return (
                          <TouchableOpacity
                            key={mins}
                            style={[sec.durBtn, isDurActive && sec.durBtnActive]}
                            onPress={() => handleUpdateActiveDay('duration', mins)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                sec.durText,
                                isDurActive && sec.durTextActive,
                              ]}
                            >
                              {mins}m
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* ── WHICH EXERCISES FOR THIS DAY ── */}
                  <View style={sec.subSection}>
                    <View style={sec.exHeader}>
                      <Text style={sec.fieldLabel}>
                        🏋️ Exercises for {activeDay.shortDay} ({activeDay.exercises.length})
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleSelectFocus(activeDay.focus)}
                        activeOpacity={0.7}
                      >
                        <Text style={sec.resetExLink}>↺ Auto-fill</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Exercise List */}
                    {activeDay.exercises.map((ex, idx) => (
                      <View key={ex.id} style={sec.exItemCard}>
                        <View style={sec.exOrderCircle}>
                          <Text style={sec.exOrderText}>{idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={sec.exItemTitle}>{ex.name}</Text>
                          <View style={sec.exCounterRow}>
                            <View style={sec.counterCol}>
                              <Text style={sec.counterLabel}>Sets:</Text>
                              <TextInput
                                style={sec.counterInput}
                                keyboardType="numeric"
                                value={String(ex.sets)}
                                onChangeText={(v) =>
                                  handleUpdateExerciseNumber(
                                    ex.id,
                                    'sets',
                                    parseInt(v, 10) || 1
                                  )
                                }
                              />
                            </View>
                            <View style={sec.counterCol}>
                              <Text style={sec.counterLabel}>Reps:</Text>
                              <TextInput
                                style={sec.counterInput}
                                keyboardType="numeric"
                                value={String(ex.reps)}
                                onChangeText={(v) =>
                                  handleUpdateExerciseNumber(
                                    ex.id,
                                    'reps',
                                    parseInt(v, 10) || 1
                                  )
                                }
                              />
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={sec.exDeleteBtn}
                          onPress={() => handleRemoveExercise(ex.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={sec.exDeleteText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Custom Exercise Input Bar */}
                    <View style={sec.addCustomRow}>
                      <TextInput
                        style={[sec.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="+ Enter exercise name..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={customExName}
                        onChangeText={setCustomExName}
                        onSubmitEditing={() => handleAddExercise()}
                      />
                      <TouchableOpacity
                        style={sec.addCustomBtn}
                        activeOpacity={0.8}
                        onPress={() => handleAddExercise()}
                      >
                        <Text style={sec.addCustomBtnText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Quick Exercise Chips */}
                    <Text style={[sec.fieldLabel, { marginTop: 12, marginBottom: 6 }]}>
                      Quick Add Suggestions:
                    </Text>
                    <View style={sec.chipsWrap}>
                      {POPULAR_EXERCISE_SUGGESTIONS.map((sug) => (
                        <TouchableOpacity
                          key={sug}
                          style={sec.chip}
                          activeOpacity={0.7}
                          onPress={() => handleAddExercise(sug)}
                        >
                          <Text style={sec.chipText}>+ {sug}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={sec.restCard}>
                  <Text style={sec.restIcon}>🛌</Text>
                  <Text style={sec.restTitle}>{activeDay.day} is marked as Rest Day</Text>
                  <Text style={sec.restSubtitle}>
                    Rest days allow muscles to recover and rebuild. Tap "Active Workout Day" above if you wish to add exercises for {activeDay.day}.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Inline Error Banner if any */}
          {errorMessage && (
            <View style={modal.errorBanner}>
              <Text style={modal.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* ── BOTTOM ACTION BUTTON ── */}
          <TouchableOpacity
            style={[
              modal.submitBtn,
              saving && modal.submitBtnDisabled,
              savedSuccess && modal.submitBtnSuccess,
            ]}
            disabled={saving}
            onPress={handleSaveAll}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={modal.submitBtnText}>
                {savedSuccess
                  ? '✓ Saved! Plans Created'
                  : `✓ Save & Create ${selectedCount} Workout Plans`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  headerBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  headerBadgeText: { color: '#60A5FA', fontSize: 11, fontWeight: '700' },
  body: {
    flex: 1,
    width: '100%',
  },
  bodyScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnSuccess: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

const sec = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  dayPill: {
    width: '13.2%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dayPillSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  dayPillActive: {
    borderColor: '#60A5FA',
    borderWidth: 2,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  dayPillTextSelected: {
    color: '#FFFFFF',
  },
  dayPillTextActive: {
    color: '#60A5FA',
  },
  dayPillStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  dayToggleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayToggleOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dayToggleOff: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.4)',
  },
  dayToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeDayTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayTab: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  dayTabCurrent: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  dayTabUnselected: {
    opacity: 0.4,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  dayTabTextCurrent: {
    color: '#FFFFFF',
  },
  dayTabTime: {
    fontSize: 9,
    color: '#60A5FA',
    marginTop: 2,
    fontWeight: '600',
  },
  dayCardContent: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  subSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  timeScroll: {
    gap: 8,
    marginBottom: 8,
  },
  timePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timePillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  timePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputSmall: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickFocusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickFocusPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickFocusPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  quickFocusText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  quickFocusTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  durBtn: {
    width: '18%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  durBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  durText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  durTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetExLink: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  exItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  exOrderCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exOrderText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
  },
  exItemTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  exCounterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  counterCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  counterInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  exDeleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  exDeleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  addCustomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addCustomBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  addCustomBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
  },
  restCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  restIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  restTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
