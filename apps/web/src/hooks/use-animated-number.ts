"use client";

/**
 * Displays the latest target immediately.
 * (Kept as a hook so SlotCountdown / callers stay stable if we reintroduce motion later.)
 */
export function useAnimatedNumber(target: number, _durationMs = 500) {
  void _durationMs;
  return target;
}
