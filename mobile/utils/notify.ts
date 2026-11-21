import { Alert, Platform } from 'react-native';

// Alert.alert is a no-op on react-native-web: no dialog is shown and its
// callbacks never fire, which silently breaks confirmation flows on web.
// These helpers route to window.alert/window.confirm on web and keep the
// native Alert behavior elsewhere.
export function confirmDialog(options: {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}): Promise<boolean> {
  const {
    title,
    message = '',
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    destructive = false,
  } = options;

  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

export function showError(message: string, title = 'Erreur'): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
