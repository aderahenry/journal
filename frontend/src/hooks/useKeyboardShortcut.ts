import { useEffect, useCallback } from 'react';

type KeyCombination = string[];
type ShortcutCallback = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  keys: KeyCombination;
  callback: ShortcutCallback;
  description?: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcut = (shortcuts: ShortcutConfig[]) => {
  const isKeyComboPressed = useCallback(
    (event: KeyboardEvent, keys: KeyCombination) => {
      const pressedKeys = new Set<string>();

      if (event.ctrlKey) pressedKeys.add('Control');
      if (event.shiftKey) pressedKeys.add('Shift');
      if (event.altKey) pressedKeys.add('Alt');
      if (event.metaKey) pressedKeys.add('Meta');
      pressedKeys.add(event.key);

      return keys.every((key) => pressedKeys.has(key));
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const { keys, callback, preventDefault } of shortcuts) {
        if (isKeyComboPressed(event, keys)) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
          break;
        }
      }
    },
    [shortcuts, isKeyComboPressed]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutDescriptions = useCallback(() => {
    return shortcuts.reduce<Record<string, string>>((acc, { keys, description }) => {
      if (description) {
        acc[keys.join(' + ')] = description;
      }
      return acc;
    }, {});
  }, [shortcuts]);

  return {
    getShortcutDescriptions,
  };
}; 