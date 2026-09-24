import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Colors from '../constants/colors';
import { ExerciseItem, ALL_EXERCISES } from '../constants/exercisesData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  exercise: ExerciseItem | null;
  onClose: () => void;
  onSelectExercise?: (exercise: ExerciseItem) => void;
  onStartExercise?: (exercise: ExerciseItem) => void;
}

export default function ExerciseDetailModal({
  visible,
  exercise,
  onClose,
  onSelectExercise,
  onStartExercise,
}: Props) {
  const [selectedAltTab, setSelectedAltTab] = useState<'easier' | 'harder' | 'variation'>('easier');

  if (!exercise) return null;

  const currentAlt = exercise.aiAlternative[selectedAltTab];
  const matchingAltExercise = ALL_EXERCISES.find(
    (e) => e.name.toLowerCase() === currentAlt.name.toLowerCase()
  );

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Exercise Image Header */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: exercise.image }} style={styles.bannerImage} />
              <View style={styles.imageOverlay}>
                <View
                  style={[
                    styles.diffBadge,
                    { backgroundColor: getDifficultyColor(exercise.difficulty) },
                  ]}
                >
                  <Text style={styles.diffBadgeText}>{exercise.difficulty}</Text>
                </View>

                {exercise.isNoEquipment && (
                  <View style={styles.noEqBadge}>
                    <Text style={styles.noEqBadgeText}>🏠 No Equipment</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title & Muscle Group */}
            <View style={styles.headerInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>TARGET:</Text>
                <View style={styles.targetPill}>
                  <Text style={styles.targetPillText}>{exercise.target}</Text>
                </View>
              </View>
            </View>

            {/* Recommended Sets / Reps Card */}
            <View style={styles.recommendedCard}>
              <View style={styles.recIconWrap}>
                <Text style={styles.recIcon}>⏱</Text>
              </View>
              <View style={styles.recTextWrap}>
                <Text style={styles.recLabel}>Recommended Protocol</Text>
                <Text style={styles.recValue}>{exercise.recommended}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Description</Text>
              <Text style={styles.descriptionText}>{exercise.description}</Text>
            </View>

            {/* Tips / Checklist */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Technique & Form Tips</Text>
              <View style={styles.tipsList}>
                {exercise.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <View style={styles.tipBullet}>
                      <Text style={styles.tipBulletText}>✓</Text>
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── 💡 AI Alternative Section ── */}
            <View style={styles.aiSection}>
              <View style={styles.aiHeaderRow}>
                <View style={styles.aiSparkleIconWrap}>
                  <Text style={styles.aiSparkleIcon}>💡</Text>
                </View>
                <View>
                  <Text style={styles.aiSectionTitle}>AI Alternative Suggestions</Text>
                  <Text style={styles.aiSectionSubtitle}>Adaptive variations based on your fitness level</Text>
                </View>
              </View>

              {/* Alternative Tabs */}
              <View style={styles.altTabsRow}>
                <TouchableOpacity
                  style={[
                    styles.altTab,
                    selectedAltTab === 'easier' && styles.altTabActive,
                  ]}
                  onPress={() => setSelectedAltTab('easier')}
                >
                  <Text
                    style={[
                      styles.altTabText,
                      selectedAltTab === 'easier' && styles.altTabTextActive,
                    ]}
                  >
                    🟢 Easier
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.altTab,
                    selectedAltTab === 'harder' && styles.altTabActive,
                  ]}
                  onPress={() => setSelectedAltTab('harder')}
                >
                  <Text
                    style={[
                      styles.altTabText,
                      selectedAltTab === 'harder' && styles.altTabTextActive,
                    ]}
                  >
                    🔴 Challenging
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.altTab,
                    selectedAltTab === 'variation' && styles.altTabActive,
                  ]}
                  onPress={() => setSelectedAltTab('variation')}
                >
                  <Text
                    style={[
                      styles.altTabText,
                      selectedAltTab === 'variation' && styles.altTabTextActive,
                    ]}
                  >
                    🔄 Variation
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Alt Card */}
              <View style={styles.altCard}>
                <View style={styles.altCardHeader}>
                  <Text style={styles.altName}>{currentAlt.name}</Text>
                  {matchingAltExercise && (
                    <TouchableOpacity
                      style={styles.viewAltBtn}
                      onPress={() => onSelectExercise && onSelectExercise(matchingAltExercise)}
                    >
                      <Text style={styles.viewAltBtnText}>View →</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.altReason}>{currentAlt.reason}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              {onStartExercise && (
                <TouchableOpacity
                  style={styles.startBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    onStartExercise(exercise);
                  }}
                >
                  <Text style={styles.startBtnText}>Start This Exercise ▶</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
                <Text style={styles.dismissBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
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
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  noEqBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  noEqBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerInfo: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111216',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  targetPill: {
    backgroundColor: 'rgba(250,90,71,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  targetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  recommendedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 16,
  },
  recIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recIcon: {
    fontSize: 18,
  },
  recTextWrap: {
    flex: 1,
  },
  recLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  recValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111216',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111216',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tipBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tipBulletText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    fontWeight: '500',
  },
  aiSection: {
    backgroundColor: '#16171B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  aiSparkleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(250,90,71,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSparkleIcon: {
    fontSize: 18,
  },
  aiSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiSectionSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  altTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  altTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altTabActive: {
    backgroundColor: Colors.primary,
  },
  altTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  altTabTextActive: {
    color: '#FFFFFF',
  },
  altCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  altCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  altName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAltBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  viewAltBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  altReason: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
  },
  actionButtonsRow: {
    gap: 10,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dismissBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
});
