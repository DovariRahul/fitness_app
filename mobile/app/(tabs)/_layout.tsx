import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import { HomeIcon, DumbbellIcon, BarChartIcon, UserIcon } from '../../components/Icons';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabMeta: Record<string, { label: string; icon: (focused: boolean) => React.ReactNode }> = {
    index: {
      label: 'Home',
      icon: (focused) => <HomeIcon size={20} color={focused ? '#FFFFFF' : '#8E8E93'} />,
    },
    workouts: {
      label: 'Plans',
      icon: (focused) => <DumbbellIcon size={20} color={focused ? '#FFFFFF' : '#8E8E93'} />,
    },
    progress: {
      label: 'Stats',
      icon: (focused) => <BarChartIcon size={20} color={focused ? '#FFFFFF' : '#8E8E93'} />,
    },
    profile: {
      label: 'Profile',
      icon: (focused) => <UserIcon size={20} color={focused ? '#FFFFFF' : '#8E8E93'} />,
    },
  };

  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const meta = tabMeta[route.name] || {
            label: route.name,
            icon: () => null,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-${route.name}`}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              {isFocused ? (
                <View style={styles.activePill}>
                  {meta.icon(true)}
                  <Text style={styles.activeLabel}>{meta.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveIconWrapper}>
                  {meta.icon(false)}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="workouts" options={{ title: 'Workouts' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161618',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inactiveIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
