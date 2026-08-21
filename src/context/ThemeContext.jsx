import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Color themes with complete palettes
export const themes = {
  oceanic: {
    name: 'Oceanic Blue',
    colors: {
      primary: { from: '#0ea5e9', to: '#0284c7' },
      secondary: { from: '#06b6d4', to: '#0891b2' },
      accent: '#3b82f6',
      background: { from: '#0f172a', via: '#1e293b', to: '#0f172a' },
      glow: '#0ea5e9'
    }
  },
  sunset: {
    name: 'Sunset Purple',
    colors: {
      primary: { from: '#a855f7', to: '#9333ea' },
      secondary: { from: '#ec4899', to: '#db2777' },
      accent: '#f472b6',
      background: { from: '#1e1b2e', via: '#2d2640', to: '#1e1b2e' },
      glow: '#a855f7'
    }
  },
  emerald: {
    name: 'Emerald Forest',
    colors: {
      primary: { from: '#10b981', to: '#059669' },
      secondary: { from: '#34d399', to: '#10b981' },
      accent: '#6ee7b7',
      background: { from: '#0a1f1a', via: '#0f2f26', to: '#0a1f1a' },
      glow: '#10b981'
    }
  },
  amber: {
    name: 'Amber Glow',
    colors: {
      primary: { from: '#f59e0b', to: '#d97706' },
      secondary: { from: '#fbbf24', to: '#f59e0b' },
      accent: '#fcd34d',
      background: { from: '#1f1b0e', via: '#2d2617', to: '#1f1b0e' },
      glow: '#f59e0b'
    }
  },
  rose: {
    name: 'Rose Garden',
    colors: {
      primary: { from: '#f43f5e', to: '#e11d48' },
      secondary: { from: '#fb7185', to: '#f43f5e' },
      accent: '#fda4af',
      background: { from: '#1f0f14', via: '#2d1720', to: '#1f0f14' },
      glow: '#f43f5e'
    }
  },
  cyber: {
    name: 'Cyber Neon',
    colors: {
      primary: { from: '#00ff9f', to: '#00b8d4' },
      secondary: { from: '#ff0080', to: '#7928ca' },
      accent: '#00ffff',
      background: { from: '#0a0a0f', via: '#1a1a2e', to: '#0a0a0f' },
      glow: '#00ff9f'
    }
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('oceanic');
  const [isInverted, setIsInverted] = useState(false);
  const [customTheme, setCustomTheme] = useState(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('wallestars-theme');
    const savedInverted = localStorage.getItem('wallestars-inverted') === 'true';
    const savedCustom = localStorage.getItem('wallestars-custom-theme');

    if (savedTheme) setCurrentTheme(savedTheme);
    if (savedInverted) setIsInverted(savedInverted);
    if (savedCustom) setCustomTheme(JSON.parse(savedCustom));
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = customTheme || themes[currentTheme];
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors;

    if (isInverted) {
      // Invert colors
      root.style.setProperty('--color-primary-from', colors.primary.to);
      root.style.setProperty('--color-primary-to', colors.primary.from);
      root.style.setProperty('--color-secondary-from', colors.secondary.to);
      root.style.setProperty('--color-secondary-to', colors.secondary.from);
      root.style.setProperty('--color-bg-from', colors.background.to);
      root.style.setProperty('--color-bg-via', colors.background.via);
      root.style.setProperty('--color-bg-to', colors.background.from);
    } else {
      // Normal colors
      root.style.setProperty('--color-primary-from', colors.primary.from);
      root.style.setProperty('--color-primary-to', colors.primary.to);
      root.style.setProperty('--color-secondary-from', colors.secondary.from);
      root.style.setProperty('--color-secondary-to', colors.secondary.to);
      root.style.setProperty('--color-bg-from', colors.background.from);
      root.style.setProperty('--color-bg-via', colors.background.via);
      root.style.setProperty('--color-bg-to', colors.background.to);
    }

    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-glow', colors.glow);

    // Update Tailwind classes dynamically
    document.body.className = isInverted ? 'theme-inverted' : '';

  }, [currentTheme, isInverted, customTheme]);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    setCustomTheme(null);
    localStorage.setItem('wallestars-theme', themeName);
    localStorage.removeItem('wallestars-custom-theme');
  };

  const toggleInvert = () => {
    const newInverted = !isInverted;
    setIsInverted(newInverted);
    localStorage.setItem('wallestars-inverted', newInverted.toString());
  };

  const setCustomColors = (colors) => {
    setCustomTheme({ name: 'Custom', colors });
    localStorage.setItem('wallestars-custom-theme', JSON.stringify({ name: 'Custom', colors }));
  };

  const resetTheme = () => {
    setCurrentTheme('oceanic');
    setIsInverted(false);
    setCustomTheme(null);
    localStorage.removeItem('wallestars-theme');
    localStorage.removeItem('wallestars-inverted');
    localStorage.removeItem('wallestars-custom-theme');
  };

  const value = {
    currentTheme: customTheme || themes[currentTheme],
    currentThemeName: customTheme ? 'custom' : currentTheme,
    themes,
    isInverted,
    changeTheme,
    toggleInvert,
    setCustomColors,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
