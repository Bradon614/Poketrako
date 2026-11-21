import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FLOATING_TAB_BAR_HEIGHT,
  radius,
  spacing,
  typography,
  useTheme,
} from '@/theme';
import { GlassSurface } from '@/components/ui';

/**
 * Floating glass tab bar
 * ---------------------------------------------------------------------------
 * The navigation chrome deliberately floats above the content (Apple-style
 * "liquid glass" bar): a translucent pill with a real backdrop blur on iOS and
 * web, a hairline border, a specular top edge and a soft shadow. On Android the
 * same pill keeps the controlled translucent tint without the blur pass, which
 * keeps scrolling smooth on modest devices.
 *
 * Because the bar floats, every tab screen reserves `FLOATING_TAB_BAR_SPACE`
 * of bottom padding so the last row is never hidden behind it.
 */

/** Frosted backdrop of the bar (rendered behind the items by React Navigation). */
const TabBarBackground = () => (
  <GlassSurface
    variant="chrome"
    blur
    stretch
    cornerRadius={radius.xxl}
    elevation="none"
    padding="none"
    style={StyleSheet.absoluteFill}
  />
);

/** Stable identity: React Navigation calls this on every render. */
const TabBarScene = () => <TabBarBackground />;

/** Icon with a restrained scale-in when its tab becomes active. */
const TabBarIcon: React.FC<{
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color: string;
}> = ({ name, focused, color }) => {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.94,
      useNativeDriver: Platform.OS !== 'web',
      speed: 18,
      bounciness: 6,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Keep the pill clear of the home indicator / gesture bar.
  const bottomOffset = Math.max(insets.bottom, spacing.sm + 4);

  return (
    <Tabs
      // Transparent scene so each screen's own ambient background shows through.
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: bottomOffset,
          height: FLOATING_TAB_BAR_HEIGHT,
          borderRadius: radius.xxl,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          paddingBottom: 0,
          paddingTop: 0,
          overflow: 'hidden',
          ...theme.shadows.floating,
        },
        tabBarBackground: TabBarScene,
        tabBarItemStyle: {
          paddingVertical: spacing.sm,
          borderRadius: radius.xxl,
        },
        tabBarLabelStyle: {
          ...typography.tabLabel,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Dépenses',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={focused ? 'card' : 'card-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: 'Revenus',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={focused ? 'cash' : 'cash-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Catégories',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={focused ? 'pricetags' : 'pricetags-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
