import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { BACKDROP_BLUR_SUPPORTED } from '@/theme/platform';
import { AppText } from './Text';
import { PressableScale } from './PressableScale';

/**
 * SelectField — a bottom-sheet picker.
 *
 * Deliberately dependency-free (no platform picker module) so the same sheet
 * behaves identically on iOS, Android and web. The sheet itself is a glass
 * surface: grabber handle, blurred backdrop where supported, and rows with an
 * accent checkmark on the current value.
 */

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Sélectionner...',
  error,
  helperText,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;
  const [visible, setVisible] = useState(false);
  const selected = options.find((opt) => opt.value === value);
  const hasError = !!error;

  return (
    <View style={style}>
      {label && (
        <AppText
          variant="bodySmall"
          tone={hasError ? 'expense' : 'secondary'}
          style={styles.label}
        >
          {label}
        </AppText>
      )}

      <PressableScale
        onPress={() => setVisible(true)}
        accessibilityLabel={label ?? placeholder}
        accessibilityHint="Ouvre la liste des valeurs"
        pressedOpacity={0.75}
        contentStyle={[
          styles.selector,
          {
            backgroundColor: colors.insetRaised,
            borderColor: hasError ? colors.expense : colors.border,
          },
        ]}
      >
        <AppText variant="body" tone={selected ? 'default' : 'muted'} numberOfLines={1} style={styles.selectorText}>
          {selected ? selected.label : placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={17} color={colors.textMuted} />
      </PressableScale>

      {error ? (
        <AppText variant="caption" tone="expense" style={styles.helper}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)}>
            {BACKDROP_BLUR_SUPPORTED ? (
              <BlurView intensity={18} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
            )}
          </Pressable>

          <View style={[styles.sheetWrapper]}>
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.surface, borderColor: colors.border },
                shadows.floating,
              ]}
            >
              <View style={[styles.grabber, { backgroundColor: colors.border }]} />

              <View style={styles.sheetHeader}>
                <AppText variant="h4" numberOfLines={1} style={styles.sheetTitle}>
                  {label ?? placeholder}
                </AppText>
                <PressableScale
                  onPress={() => setVisible(false)}
                  accessibilityLabel="Fermer"
                  hitSlop={8}
                >
                  <View style={[styles.closeButton, { backgroundColor: colors.inset }]}>
                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                  </View>
                </PressableScale>
              </View>

              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => {
                  const isSelected = item.value === value;
                  const isLast = index === options.length - 1;
                  return (
                    <PressableScale
                      onPress={() => {
                        onSelect(item.value);
                        setVisible(false);
                      }}
                      pressedOpacity={0.6}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.option}>
                        <AppText
                          variant="body"
                          tone={isSelected ? 'accent' : 'default'}
                          numberOfLines={1}
                          style={styles.optionText}
                        >
                          {item.label}
                        </AppText>
                        {isSelected && <Ionicons name="checkmark" size={19} color={colors.accent} />}
                        {!isLast && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                      </View>
                    </PressableScale>
                  );
                }}
                ListEmptyComponent={
                  <AppText variant="bodySmall" tone="muted" center style={styles.empty}>
                    Aucune option disponible
                  </AppText>
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm - 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radiusTokens.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  selectorText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  helper: {
    marginTop: spacing.xs + 2,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sheet: {
    borderRadius: radiusTokens.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    maxHeight: '72%',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radiusTokens.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
  },
  sheetTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: radiusTokens.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  optionText: {
    flex: 1,
    marginRight: spacing.sm,
    ...typography.body,
  },
  separator: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    paddingVertical: spacing.xl,
  },
});
