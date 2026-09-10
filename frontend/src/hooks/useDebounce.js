// src/hooks/useDebounce.js
// A custom hook that delays updating a value until the user stops typing.
//
// HOW IT WORKS:
// 1. You pass in a value (e.g., what the user typed) and a delay (e.g., 300ms)
// 2. Every time the value changes, a timer starts
// 3. If the value changes AGAIN before the timer finishes, the old timer is cancelled
// 4. Only when the user STOPS typing for 300ms does the debounced value update
//
// WHY:
// Without debouncing, typing "Mumbai" triggers 6 state updates (M, Mu, Mum, Mumb, Mumba, Mumbai).
// Each update re-filters the list. With debouncing, only ONE update happens — after the user pauses.

import { useState, useEffect } from "react";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Start a timer that will update the debounced value after `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // CLEANUP: If `value` changes before the timer finishes, cancel the old timer.
    // This is React's useEffect cleanup function — it runs before the next effect.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
