import { Alert, Platform } from 'react-native';

/**
 * react-native-web ships an Alert.alert that does nothing, so every confirmation / error dialog was silently skipped
 * on the web build (e.g. "Nothing logged", "Delete template?", "Save as template?"). This replaces it with the
 * browser's own dialogs. Import this file once, before any screen is used.
 */
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  type Btn = { text?: string; onPress?: (v?: string) => void; style?: string };
  (Alert as any).alert = (title: string, message?: string, buttons?: Btn[]) => {
    const text = message ? `${title}\n\n${message}` : title;
    const list = buttons ?? [];
    const actions = list.filter((b) => b.style !== 'cancel');
    const cancel = list.find((b) => b.style === 'cancel');
    if (list.length <= 1 && !cancel) {
      window.alert(text);
      list[0]?.onPress?.();
      return;
    }
    if (actions.length === 0) {
      window.alert(text);
      cancel?.onPress?.();
      return;
    }
    // One confirm per action button (OK = run it); declining all of them runs the cancel button.
    for (const a of actions) {
      const q = actions.length > 1 ? `${text}\n\n→ ${a.text ?? 'OK'}?` : text;
      if (window.confirm(q)) {
        a.onPress?.();
        return;
      }
    }
    cancel?.onPress?.();
  };
}
export {};
