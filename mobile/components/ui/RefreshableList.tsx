import React from 'react';
import { ScrollView, RefreshControl, ViewStyle } from 'react-native';

interface RefreshableListProps {
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const RefreshableList: React.FC<RefreshableListProps> = ({
  children,
  refreshing,
  onRefresh,
  contentContainerStyle,
  style,
}) => {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={contentContainerStyle}
      style={style}
      // Taps on buttons inside the list register on first touch even while
      // the keyboard is up (inline forms on the list screens).
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};