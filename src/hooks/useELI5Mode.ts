
import { useState, useEffect, useCallback } from 'react';

const ELI5_STORAGE_KEY = 'gamecraft-eli5-mode';

export const useELI5Mode = () => {
  const [isELI5Mode, setIsELI5Mode] = useState<boolean>(false);

  // Load ELI5 preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ELI5_STORAGE_KEY);
      if (saved !== null) {
        setIsELI5Mode(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load ELI5 mode preference:', error);
    }
  }, []);

  // Save ELI5 preference to localStorage
  const toggleELI5Mode = useCallback((enabled: boolean) => {
    setIsELI5Mode(enabled);
    try {
      localStorage.setItem(ELI5_STORAGE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save ELI5 mode preference:', error);
    }
  }, []);

  return {
    isELI5Mode,
    toggleELI5Mode,
  };
};
