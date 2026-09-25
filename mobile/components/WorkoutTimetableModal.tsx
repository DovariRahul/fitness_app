import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

export interface TimetableDay {
  day: string;
  shortDay: string;
  isRest: boolean;
  targetFocus: string;
  time: string;
  duration: number;
  notes?: string;
}

export const DEFAULT_TIMETABLE: TimetableDay[] = [
  { day: 'Monday', shortDay: 'Mon', isRest: false, targetFocus: 'Push (Chest & Triceps)', time: '07:00 AM', duration: 45 },
  { day: 'Tuesday', shortDay: 'Tue', isRest: false, targetFocus: 'Pull (Back & Biceps)', time: '07:00 AM', duration: 45 },
  { day: 'Wednesday', shortDay: 'Wed', isRest: false, targetFocus: 'Legs & Core', time: '07:00 AM', duration: 50 },
  { day: 'Thursday', shortDay: 'Thu', isRest: true, targetFocus: 'Active Recovery & Mobility', time: '07:30 AM', duration: 30 },
  { day: 'Friday', shortDay: 'Fri', isRest: false, targetFocus: 'Upper Body Power', time: '07:00 AM', duration: 45 },
  { day: 'Saturday', shortDay: 'Sat', isRest: false, targetFocus: 'HIIT & Core Conditioning', time: '08:30 AM', duration: 40 },
  { day: 'Sunday', shortDay: 'Sun', isRest: true, targetFocus: 'Rest & Full Recovery', time: '09:00 AM', duration: 0 },
];

export const PRESET_SPLITS = [
  {
    id: 'ppl',
    title: 'Push / Pull / Legs (PPL)',
    icon: '💪',
    days: [
      { day: 'Monday', shortDay: 'Mon', isRest: false, targetFocus: 'Push (Chest, Delts, Triceps)', time: '07:00 AM', duration: 50 },
      { day: 'Tuesday', shortDay: 'Tue', isRest: false, targetFocus: 'Pull (Back, Lats, Biceps)', time: '07:00 AM', duration: 50 },
      { day: 'Wednesday', shortDay: 'Wed', isRest: false, targetFocus: 'Legs, Calves & Core', time: '07:00 AM', duration: 50 },
      { day: 'Thursday', shortDay: 'Thu', isRest: true, targetFocus: 'Rest & Stretch', time: '08:00 AM', duration: 20 },
      { day: 'Friday', shortDay: 'Fri', isRest: false, targetFocus: 'Push (Upper Hypertrophy)', time: '07:00 AM', duration: 45 },
      { day: 'Saturday', shortDay: 'Sat', isRest: false, targetFocus: 'Pull & Legs Combo', time: '08:30 AM', duration: 55 },
      { day: 'Sunday', shortDay: 'Sun', isRest: true, targetFocus: 'Rest & Recovery', time: '09:00 AM', duration: 0 },
    ],
  },
  {
    id: 'upper_lower',
    title: 'Upper / Lower Split',
    icon: '⚡',
    days: [
      { day: 'Monday', shortDay: 'Mon', isRest: false, targetFocus: 'Upper Body Strength', time: '07:00 AM', duration: 50 },
      { day: 'Tuesday', shortDay: 'Tue', isRest: false, targetFocus: 'Lower Body Strength', time: '07:00 AM', duration: 50 },
      { day: 'Wednesday', shortDay: 'Wed', isRest: true, targetFocus: 'Active Recovery & Walk', time: '07:30 AM', duration: 30 },
      { day: 'Thursday', shortDay: 'Thu', isRest: false, targetFocus: 'Upper Body Hypertrophy', time: '07:00 AM', duration: 45 },
      { day: 'Friday', shortDay: 'Fri', isRest: false, targetFocus: 'Lower Body Hypertrophy', time: '07:00 AM', duration: 45 },
      { day: 'Saturday', shortDay: 'Sat', isRest: false, targetFocus: 'Core & Cardio Blast', time: '08:00 AM', duration: 35 },
      { day: 'Sunday', shortDay: 'Sun', isRest: true, targetFocus: 'Full Rest Day', time: '09:00 AM', duration: 0 },
    ],
  },
  {
    id: 'full_body',
    title: 'Full Body (3-Days)',
    icon: '🔥',
    days: [
      { day: 'Monday', shortDay: 'Mon', isRest: false, targetFocus: 'Full Body Workout A', time: '07:00 AM', duration: 50 },
      { day: 'Tuesday', shortDay: 'Tue', isRest: true, targetFocus: 'Rest / Light Walk', time: '07:30 AM', duration: 20 },
      { day: 'Wednesday', shortDay: 'Wed', isRest: false, targetFocus: 'Full Body Workout B', time: '07:00 AM', duration: 50 },
      { day: 'Thursday', shortDay: 'Thu', isRest: true, targetFocus: 'Rest & Mobility', time: '07:30 AM', duration: 25 },
      { day: 'Friday', shortDay: 'Fri', isRest: false, targetFocus: 'Full Body Workout C', time: '07:00 AM', duration: 50 },
      { day: 'Saturday', shortDay: 'Sat', isRest: false, targetFocus: 'Light Cardio & Core', time: '08:30 AM', duration: 30 },
      { day: 'Sunday', shortDay: 'Sun', isRest: true, targetFocus: 'Full Rest Day', time: '09:00 AM', duration: 0 },
    ],
  },
  {
    id: 'cardio_tone',
    title: 'Cardio & Fat Burn',
    icon: '🏃',
    days: [
      { day: 'Monday', shortDay: 'Mon', isRest: false, targetFocus: 'HIIT Cardio & Abs', time: '06:30 AM', duration: 35 },
      { day: 'Tuesday', shortDay: 'Tue', isRest: false, targetFocus: 'Total Body Toning', time: '06:30 AM', duration: 40 },
      { day: 'Wednesday', shortDay: 'Wed', isRest: true, targetFocus: 'Yoga & Recovery', time: '07:00 AM', duration: 30 },
      { day: 'Thursday', shortDay: 'Thu', isRest: false, targetFocus: 'Interval Sprint / Cycle', time: '06:30 AM', duration: 40 },
      { day: 'Friday', shortDay: 'Fri', isRest: false, targetFocus: 'Core & Upper Circuit', time: '06:30 AM', duration: 35 },
      { day: 'Saturday', shortDay: 'Sat', isRest: false, targetFocus: 'Outdoor Run or Hike', time: '08:00 AM', duration: 50 },
      { day: 'Sunday', shortDay: 'Sun', isRest: true, targetFocus: 'Rest & Recharge', time: '09:00 AM', duration: 0 },
    ],
  },
];

const QUICK_FOCUS_OPTIONS = [
  'Push (Chest & Triceps)',
  'Pull (Back & Biceps)',
  'Legs & Core',
  'Shoulders & Arms',
  'Full Body Blast',
  'HIIT & Cardio',
  'Core & Mobility',
  'Active Recovery',
];

const TIME_OPTIONS = ['06:00 AM', '07:00 AM', '08:00 AM', '12:30 PM', '05:30 PM', '06:30 PM', '08:00 PM'];
const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90];

export const TIMETABLE_STORAGE_KEY = '@user_workout_timetable';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved?: (timetable: TimetableDay[]) => void;
}

export default function WorkoutTimetableModal({ visible, onClose, onSaved }: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.max(540, Math.min(screenHeight * 0.9, 740));

  const [timetable, setTimetable] = useState<TimetableDay[]>(DEFAULT_TIMETABLE);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [editingDay, setEditingDay] = useState<TimetableDay | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Determine current day of week index (Monday = 0, Sunday = 6)
  const currentDayIndex = (() => {
    const day = new Date().getDay(); // 0 is Sun, 1 is Mon...
    return day === 0 ? 6 : day - 1;
  })();

  // Load from AsyncStorage
  useEffect(() => {
    if (visible) {
      loadTimetable();
      setSelectedDayIndex(currentDayIndex);
      setSavedSuccess(false);
    }
  }, [visible]);

  const loadTimetable = async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMETABLE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 7) {
          setTimetable(parsed);
          setEditingDay({ ...parsed[currentDayIndex] });
          return;
        }
      }
      setTimetable(DEFAULT_TIMETABLE);
      setEditingDay({ ...DEFAULT_TIMETABLE[currentDayIndex] });
    } catch {
      setTimetable(DEFAULT_TIMETABLE);
      setEditingDay({ ...DEFAULT_TIMETABLE[currentDayIndex] });
    }
  };

  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index);
    setEditingDay({ ...timetable[index] });
  };

  const handleApplyPreset = (preset: typeof PRESET_SPLITS[0]) => {
    setTimetable(preset.days);
    setEditingDay({ ...preset.days[selectedDayIndex] });
  };

  const handleUpdateEditingDay = (field: keyof TimetableDay, value: any) => {
    if (!editingDay) return;
    const updated = { ...editingDay, [field]: value };
    setEditingDay(updated);

    // Also update current timetable in memory
    setTimetable((prev) => {
      const next = [...prev];
      next[selectedDayIndex] = updated;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetable));
      setSavedSuccess(true);
      onSaved?.(timetable);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save timetable.');
    }
  };

  const activeDay = editingDay || timetable[selectedDayIndex];

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
              <Text style={modal.headerTitle}>Workout Timetable</Text>
              <Text style={modal.headerSubtitle}>Weekly training schedule & splits</Text>
            </View>
            <View style={modal.headerBadge}>
              <Text style={modal.headerBadgeText}>📅 7-Day Plan</Text>
            </View>
          </View>

          {/* Main Content Area */}
          <ScrollView
            style={modal.body}
            contentContainerStyle={modal.bodyScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1-Tap Split Presets */}
            <View style={sec.container}>
              <Text style={sec.title}>⚡ Quick Split Presets</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={sec.presetScroll}
              >
                {PRESET_SPLITS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={sec.presetPill}
                    activeOpacity={0.8}
                    onPress={() => handleApplyPreset(p)}
                  >
                    <Text style={sec.presetIcon}>{p.icon}</Text>
                    <Text style={sec.presetText}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 7-Day Week Selector Pills */}
            <View style={sec.container}>
              <Text style={sec.title}>🗓️ Select Day of the Week</Text>
              <View style={sec.daysRow}>
                {timetable.map((d, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  const isToday = currentDayIndex === idx;
                  return (
                    <TouchableOpacity
                      key={d.day}
                      style={[
                        sec.dayCard,
                        isSelected && sec.dayCardSelected,
                        d.isRest && !isSelected && sec.dayCardRest,
                      ]}
                      onPress={() => handleSelectDay(idx)}
                      activeOpacity={0.8}
                    >
                      {isToday && <View style={sec.todayDot} />}
                      <Text style={[sec.dayCardShort, isSelected && sec.dayCardShortActive]}>
                        {d.shortDay}
                      </Text>
                      <Text style={sec.dayCardIcon}>{d.isRest ? '🛌' : '💪'}</Text>
                      <Text
                        style={[
                          sec.dayCardLabel,
                          isSelected && sec.dayCardLabelActive,
                          d.isRest && sec.dayCardLabelRest,
                        ]}
                      >
                        {d.isRest ? 'Rest' : `${d.duration}m`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selected Day Customizer Card */}
            {activeDay && (
              <View style={sec.activeDayCard}>
                <View style={sec.activeDayHeader}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={sec.activeDayTitle}>{activeDay.day}</Text>
                      {currentDayIndex === selectedDayIndex && (
                        <View style={sec.todayBadge}>
                          <Text style={sec.todayBadgeText}>TODAY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={sec.activeDaySubtitle}>
                      {activeDay.isRest ? 'Scheduled rest day' : `Workout session · ${activeDay.time}`}
                    </Text>
                  </View>

                  {/* Rest Day Toggle */}
                  <TouchableOpacity
                    style={[sec.restToggle, activeDay.isRest && sec.restToggleActive]}
                    activeOpacity={0.8}
                    onPress={() => handleUpdateEditingDay('isRest', !activeDay.isRest)}
                  >
                    <Text style={sec.restToggleText}>
                      {activeDay.isRest ? '🛌 Rest Day' : '💪 Workout Day'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* If Not Rest Day: Focus, Time, Duration */}
                {!activeDay.isRest ? (
                  <>
                    {/* Target Focus */}
                    <Text style={sec.fieldLabel}>🎯 Workout Target / Split</Text>
                    <TextInput
                      style={sec.input}
                      value={activeDay.targetFocus}
                      onChangeText={(txt) => handleUpdateEditingDay('targetFocus', txt)}
                      placeholder="e.g. Chest & Triceps"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />

                    {/* Quick Focus Choices */}
                    <View style={sec.quickWrap}>
                      {QUICK_FOCUS_OPTIONS.map((opt) => {
                        const active = activeDay.targetFocus === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[sec.quickPill, active && sec.quickPillActive]}
                            onPress={() => handleUpdateEditingDay('targetFocus', opt)}
                            activeOpacity={0.75}
                          >
                            <Text style={[sec.quickPillText, active && sec.quickPillTextActive]}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Workout Time */}
                    <Text style={[sec.fieldLabel, { marginTop: 14 }]}>⏰ Preferred Time</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {TIME_OPTIONS.map((t) => {
                        const active = activeDay.time === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[sec.timePill, active && sec.timePillActive]}
                            onPress={() => handleUpdateEditingDay('time', t)}
                            activeOpacity={0.8}
                          >
                            <Text style={[sec.timePillText, active && sec.timePillTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Duration */}
                    <Text style={[sec.fieldLabel, { marginTop: 14 }]}>⏱ Duration (minutes)</Text>
                    <View style={sec.durationRow}>
                      {DURATION_OPTIONS.map((mins) => {
                        const active = activeDay.duration === mins;
                        return (
                          <TouchableOpacity
                            key={mins}
                            style={[sec.durCard, active && sec.durCardActive]}
                            onPress={() => handleUpdateEditingDay('duration', mins)}
                            activeOpacity={0.8}
                          >
                            <Text style={[sec.durCardText, active && sec.durCardTextActive]}>
                              {mins}m
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <View style={sec.restBanner}>
                    <Text style={sec.restBannerIcon}>🧘</Text>
                    <Text style={sec.restBannerTitle}>Recovery & Muscle Growth</Text>
                    <Text style={sec.restBannerDesc}>
                      Rest days let your muscle fibers repair and synthesize new protein. Stay hydrated and aim for 8+ hours of sleep!
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Weekly Overview Summary */}
            <View style={sec.summaryCard}>
              <Text style={sec.summaryTitle}>📊 Weekly Summary</Text>
              <View style={sec.summaryRow}>
                <View style={sec.summaryItem}>
                  <Text style={sec.summaryVal}>
                    {timetable.filter((d) => !d.isRest).length}
                  </Text>
                  <Text style={sec.summaryLbl}>Workouts</Text>
                </View>
                <View style={sec.summaryItem}>
                  <Text style={sec.summaryVal}>
                    {timetable.filter((d) => d.isRest).length}
                  </Text>
                  <Text style={sec.summaryLbl}>Rest Days</Text>
                </View>
                <View style={sec.summaryItem}>
                  <Text style={sec.summaryVal}>
                    {timetable.reduce((acc, d) => acc + (d.isRest ? 0 : d.duration), 0)}m
                  </Text>
                  <Text style={sec.summaryLbl}>Total Time</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Save Button */}
          <TouchableOpacity
            style={[modal.saveBtn, savedSuccess && modal.saveBtnSuccess]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={modal.saveBtnText}>
              {savedSuccess ? '✓ Timetable Saved!' : 'Save Weekly Timetable'}
            </Text>
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
    backgroundColor: 'rgba(250, 90, 71, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 71, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  headerBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
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
  saveBtn: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnSuccess: {
    backgroundColor: '#10B981',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const sec = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  presetScroll: {
    gap: 8,
    paddingRight: 10,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  presetIcon: { fontSize: 14 },
  presetText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayCard: {
    width: '13.2%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  dayCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(250,90,71,0.15)',
  },
  dayCardRest: {
    opacity: 0.65,
  },
  todayDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  dayCardShort: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  dayCardShortActive: { color: '#FFFFFF' },
  dayCardIcon: { fontSize: 13, marginBottom: 3 },
  dayCardLabel: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  dayCardLabelActive: { color: '#FFFFFF' },
  dayCardLabelRest: { color: 'rgba(255,255,255,0.4)' },

  activeDayCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  activeDayTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  activeDaySubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  todayBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  restToggle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  restToggleActive: {
    backgroundColor: 'rgba(107, 114, 128, 0.25)',
    borderColor: 'rgba(107, 114, 128, 0.5)',
  },
  restToggleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickPillActive: {
    backgroundColor: 'rgba(250,90,71,0.2)',
    borderColor: Colors.primary,
  },
  quickPillText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  quickPillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  timePill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timePillActive: {
    backgroundColor: 'rgba(250,90,71,0.2)',
    borderColor: Colors.primary,
  },
  timePillText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  timePillTextActive: { color: '#FFFFFF', fontWeight: '800' },

  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  durCard: {
    width: '15%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  durCardActive: {
    backgroundColor: 'rgba(250,90,71,0.2)',
    borderColor: Colors.primary,
  },
  durCardText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  durCardTextActive: { color: '#FFFFFF', fontWeight: '800' },

  restBanner: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 6,
  },
  restBannerIcon: { fontSize: 32, marginBottom: 8 },
  restBannerTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  restBannerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  summaryLbl: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});
