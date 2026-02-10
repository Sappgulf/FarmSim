/**
 * useKeyboardShortcuts - keyboard navigation for FarmSim
 *
 * Number keys 1-9 switch to the first 9 tabs.
 * W = water all, H = harvest all, F = fertilize all, T = treat diseases.
 * Ctrl/Cmd+S = quick save, Space = pause/resume (when wired).
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

const TEXT_INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * @param {Object} options
 * @param {boolean} options.enabled - Whether shortcuts are active
 * @param {(tabId: string) => void} options.onTabChange - Tab switch callback
 * @param {(action: string) => void} [options.onBulkAction] - Bulk action callback (optional)
 * @param {() => void} [options.onQuickSave] - Ctrl/Cmd+S callback (optional)
 * @param {() => void} [options.onTogglePause] - Space callback (optional)
 */
export function useKeyboardShortcuts({ enabled, onTabChange, onBulkAction, onQuickSave, onTogglePause }) {
    const handleKeyDown = useCallback((e) => {
        if (!enabled) return;

        const target = e.target;
        const tag = target?.tagName;
        const isTextField = (tag && TEXT_INPUT_TAGS.has(tag)) || Boolean(target?.isContentEditable);

        // Quick save: Ctrl/Cmd + S (allow Ctrl/Cmd, block Alt).
        if (
            onQuickSave &&
            (e.ctrlKey || e.metaKey) &&
            !e.altKey &&
            (e.key === 's' || e.key === 'S')
        ) {
            if (isTextField) return;
            if (e.repeat) return;
            e.preventDefault();
            onQuickSave();
            return;
        }

        // Ignore when typing in inputs/textareas/contenteditable
        if (isTextField) return;

        // Avoid repeated firing when keys are held down.
        if (e.repeat) return;

        // Ignore if modifier keys are held (Ctrl, Meta, Alt)
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key;

        // Pause/resume: Space (avoid stealing space from focused buttons/links)
        if (onTogglePause && (e.code === 'Space' || key === ' ')) {
            if (tag === 'BUTTON' || tag === 'A') return;
            e.preventDefault();
            onTogglePause();
            return;
        }

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
    }, [enabled, onTabChange, onBulkAction, onQuickSave, onTogglePause]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
