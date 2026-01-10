import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('initial');
    });

    it('should return stored value if it exists', () => {
        window.localStorage.setItem('test-key', JSON.stringify('stored'));
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('stored');
    });

    it('should update localStorage when state changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
    });

    it('should support function updates', () => {
        const { result } = renderHook(() => useLocalStorage<number>('count-key', 0));

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);
        expect(window.localStorage.getItem('count-key')).toBe(JSON.stringify(1));
    });

    it('should sync across hooks in the same window (custom event)', async () => {
        const { result: result1 } = renderHook(() => useLocalStorage('sync-key', 'initial'));
        const { result: result2 } = renderHook(() => useLocalStorage('sync-key', 'initial'));

        act(() => {
            result1.current[1]('updated');
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        expect(result2.current[0]).toBe('updated');
    });
});
