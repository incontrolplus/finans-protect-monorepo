import React from 'react';
import { motion } from 'framer-motion';
import { Palette, RefreshCw, Check } from 'lucide-react';
import { useTheme, themes } from '../context/ThemeContext';

export default function ThemeSettings() {
  const { currentThemeName, isInverted, changeTheme, toggleInvert, resetTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-400" />
          Color Theme
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(themes).map(([key, theme]) => (
            <ThemeCard
              key={key}
              name={theme.name}
              colors={theme.colors}
              isActive={currentThemeName === key && !isInverted}
              onClick={() => changeTheme(key)}
            />
          ))}
        </div>
      </div>

      {/* Invert Toggle */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-effect p-4 rounded-lg cursor-pointer"
        onClick={toggleInvert}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Invert Colors</h3>
            <p className="text-sm text-dark-400">
              Reverse gradient directions for a different look
            </p>
          </div>
          <div className={`relative w-14 h-7 rounded-full transition-colors ${
            isInverted ? 'bg-primary-500' : 'bg-dark-700'
          }`}>
            <motion.div
              animate={{ x: isInverted ? 28 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={resetTheme}
        className="w-full glass-effect hover:bg-white/10 p-4 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Reset to Default Theme</span>
      </motion.button>

      {/* Preview */}
      <div className="glass-effect p-6 rounded-lg space-y-4">
        <h3 className="font-semibold mb-4">Theme Preview</h3>

        <div className="space-y-3">
          {/* Primary Button Preview */}
          <div className="btn-primary text-center">
            Primary Button
          </div>

          {/* Secondary Button Preview */}
          <div className="btn-secondary text-center">
            Secondary Button
          </div>

          {/* Card Preview */}
          <div className="card">
            <h4 className="font-semibold mb-2">Sample Card</h4>
            <p className="text-sm text-dark-400">
              This is how your cards will look with the current theme.
            </p>
          </div>

          {/* Input Preview */}
          <input
            type="text"
            placeholder="Input field preview"
            className="input-field"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ name, colors, isActive, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative glass-effect p-4 rounded-lg cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-primary-500' : 'hover:bg-white/10'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* Theme name */}
      <h4 className="font-semibold mb-3 text-sm">{name}</h4>

      {/* Color preview */}
      <div className="space-y-2">
        {/* Primary gradient */}
        <div
          className="h-6 rounded"
          style={{
            background: `linear-gradient(to right, ${colors.primary.from}, ${colors.primary.to})`
          }}
        />

        {/* Secondary gradient */}
        <div
          className="h-4 rounded"
          style={{
            background: `linear-gradient(to right, ${colors.secondary.from}, ${colors.secondary.to})`
          }}
        />

        {/* Background gradient (smaller) */}
        <div
          className="h-3 rounded"
          style={{
            background: `linear-gradient(to right, ${colors.background.from}, ${colors.background.via}, ${colors.background.to})`
          }}
        />
      </div>
    </motion.div>
  );
}
