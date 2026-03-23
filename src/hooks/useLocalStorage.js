import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

// Custom hook for localStorage State
export function useLocalStorage(baseKey, initialValue) {
  const { user } = useUser();
  const prefix = user ? `${user.id}_` : '';
  const key = prefix + baseKey;

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export const storageKeys = {
  API_KEY: 'boardprep_api_key',
  AI_PROVIDER: 'boardprep_ai_provider', // 'groq' or 'openai'
  SCORES: 'boardprep_quiz_scores',
  BOOKMARKS: 'boardprep_bookmarks',
  PLANNER: 'boardprep_study_plans',
  PROGRESS: 'boardprep_progress',
};
