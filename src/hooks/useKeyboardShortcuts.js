/**
 * useKeyboardShortcuts - keyboard navigation for FarmSim
 * 
 * Number keys 1-9 switch to the first 9 tabs.
 * W = water all, H = harvest all, F = fertilize all, T = treat diseases.
 * Disabled when focused on text inputs or when setting is toggled off.
 */
import { useEffect, useCallback } from 'react';

const TAB_KEYS = {
    '1': 'farming',
    '2': 'inventory',
    '3': 'shop',
    '4': 'buildings',
    '5': 'research',
    '6': 'genetics',
    '7': 'weather',
    '8': 'pets',
    '9': 'livestock',
};

/**
 * @param {Object} options
 * @param {boolean} options.enabled - Whether shortcuts are active
 * @param {(tabId: string) => void} options.onTabChange - Tab switch callback
 * @param {(action: string) => void} [options.onBulkAction] - Bulk action callback (optional)
 */
export function useKeyboardShortcuts({ enabled, onTabChange, onBulkAction }) {
    const handleKeyDown = useCallback((e) => {
        if (!enabled) return;

        // Ignore when typing in inputs/textareas/contenteditable
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
            return;
        }

        // Ignore if modifier keys are held (Ctrl, Meta, Alt)
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key;

        // Tab switching: 1-9
        const tabId = TAB_KEYS[key];
        if (tabId) {
            e.preventDefault();
            onTabChange(tabId);
            return;
        }

        // Bulk actions (uppercase or lowercase)
        if (onBulkAction) {
            const lower = key.toLowerCase();
            switch (lower) {
                case 'w':
                    e.preventDefault();
                    onBulkAction('water');
                    return;
                case 'h':
                    e.preventDefault();
                    onBulkAction('harvest');
                    return;
                case 'f':
                    e.preventDefault();
                    onBulkAction('fertilize');
                    return;
                case 't':
                    e.preventDefault();
                    onBulkAction('treat');
                    return;
            }
        }
    }, [enabled, onTabChange, onBulkAction]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
