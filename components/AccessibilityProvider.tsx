'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
type FontFamily = 'Inter' | 'Roboto' | 'Poppins' | 'Open Sans' | 'Arial';

interface AccessibilitySettings {
  textSize: TextSize;
  fontFamily: FontFamily;
  highContrast: boolean;
  darkMode: boolean;
  eyeComfort: boolean;
  dyslexiaFriendly: boolean;
  compactMode: boolean;
  tableTextSize: number;
  tableRowSpacing: number;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetToFactory: () => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'medium',
  fontFamily: 'Inter',
  highContrast: false,
  darkMode: true,
  eyeComfort: false,
  dyslexiaFriendly: false,
  compactMode: false,
  tableTextSize: 14,
  tableRowSpacing: 16,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettingsState({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse accessibility settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings, isLoaded]);

  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;

    // Text Size
    const sizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--font-size-base', sizes[s.textSize]);

    // Font Family
    const fonts = {
      'Inter': 'var(--font-inter), sans-serif',
      'Roboto': 'var(--font-roboto), sans-serif',
      'Poppins': 'var(--font-poppins), sans-serif',
      'Open Sans': 'var(--font-open-sans), sans-serif',
      'Arial': 'Arial, sans-serif',
    };
    root.style.setProperty('--font-active', fonts[s.fontFamily]);

    // Modes
    root.setAttribute('data-high-contrast', s.highContrast.toString());
    root.setAttribute('data-eye-comfort', s.eyeComfort.toString());
    root.setAttribute('data-dyslexia-font', s.dyslexiaFriendly.toString());
    root.setAttribute('data-compact-mode', s.compactMode.toString());

    // Dark Mode
    if (s.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Table Settings
    root.style.setProperty('--font-size-table', `${s.tableTextSize}px`);
    root.style.setProperty('--table-row-spacing', `${s.tableRowSpacing}px`);
  };

  const setSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const resetToFactory = () => {
    setSettingsState(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ ...settings, setSettings, resetToFactory }}>
      <div className={settings.darkMode ? 'dark' : ''}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
