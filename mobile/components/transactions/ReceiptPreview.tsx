import React, { useState } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius as radiusTokens, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from '@/components/ui/Text';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { ReceiptUpload } from '@/types/api';

/**
 * ReceiptPreview — how a justificatif is presented on an expense.
 *
 * Improves on the previous plain filename link without changing behaviour: the
 * same URL is opened with the platform browser/viewer, but the receipt is now
 * shown as an actual preview (image thumbnail when the upload is an image, a
 * document tile otherwise) with its size, type and upload date, plus an
 * explicit "Ouvrir" affordance.
 */

interface ReceiptPreviewProps {
  receipt: ReceiptUpload;
  onError?: (message: string) => void;
}

/** Absolute URL of an upload, derived from the API base URL (same rule as before). */
export function resolveUploadUrl(path: string): string {
  const base = (process.env.EXPO_PUBLIC_API_URL || '')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
  return `${base}${path}`;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ receipt, onError }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [failed, setFailed] = useState(false);

  const url = resolveUploadUrl(receipt.url);
  const isImage = (receipt.contentType || '').startsWith('image/');
  const showImage = isImage && !failed;

  const open = () => {
    Linking.openURL(url).catch(() => onError?.("Impossible d'ouvrir le justificatif"));
  };

  return (
    <PressableScale onPress={open} scaleTo={1} pressedOpacity={0.75} accessibilityLabel="Ouvrir le justificatif">
      <GlassSurface variant="subtle" elevation="none" padding="none">
        <View style={styles.row}>
          {showImage ? (
            <Image
              source={{ uri: url }}
              style={[styles.thumbnail, { backgroundColor: colors.inset, borderColor: colors.border }]}
              resizeMode="cover"
              onError={() => setFailed(true)}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                styles.fileTile,
                { backgroundColor: colors.accentSoft, borderColor: colors.border },
              ]}
            >
              <Ionicons name="document-text-outline" size={22} color={colors.accent} />
            </View>
          )}

          <View style={styles.info}>
            <AppText variant="bodySmall" numberOfLines={1}>
              {receipt.filename}
            </AppText>
            <View style={styles.metaRow}>
              {!!formatBytes(receipt.size) && (
                <Chip label={formatBytes(receipt.size)} tone="neutral" />
              )}
              <AppText variant="captionSmall" tone="muted" numberOfLines={1}>
                {new Date(receipt.uploadedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </AppText>
            </View>
          </View>

          <View style={styles.openAffordance}>
            <Ionicons name="open-outline" size={18} color={colors.accent} />
          </View>
        </View>
      </GlassSurface>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radiusTokens.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fileTile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md - 4,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
  },
  openAffordance: {
    marginLeft: spacing.sm,
  },
});
