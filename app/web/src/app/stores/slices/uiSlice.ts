import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeLanguage } from '@/lib/i18n';

// Palette interface
interface AppearancePalette {
  mode?: string;
  divider?: string;
  text?: {
    primary?: string;
    secondary?: string;
    disabled?: string;
  };
  common?: {
    black?: string;
    white?: string;
  };
  primary?: {
    light?: string;
    main?: string;
    dark?: string;
    contrastText?: string;
  };
  secondary?: {
    light?: string;
    main?: string;
    dark?: string;
    contrastText?: string;
  };
  background?: {
    paper?: string;
    default?: string;
  };
  error?: {
    light?: string;
    main?: string;
    dark?: string;
  };
  status?: {
    danger?: string;
  };
}

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  // Store palettes for theme switching
  lightPalette: AppearancePalette | null;
  darkPalette: AppearancePalette | null;
}

// Initialize from localStorage
const getInitialTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('theme');
  return stored === 'dark' ? 'dark' : 'light';
};

const getInitialLanguage = (): 'en' | 'ar' => {
  const stored = localStorage.getItem('language') || localStorage.getItem('i18nextLng');
  return stored === 'ar' ? 'ar' : 'en';
};

const initialState: UiState = {
  sidebarOpen: true,
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  lightPalette: null,
  darkPalette: null,
};

// Apply initial theme
if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', initialState.theme === 'dark');
  document.documentElement.lang = initialState.language;
  document.documentElement.dir = initialState.language === 'ar' ? 'rtl' : 'ltr';
}

// Helper function to reset CSS variables to defaults
function resetCSSVariables() {
  const root = document.documentElement;
  
  // Remove all custom properties set by appearance settings
  const propsToReset = [
    '--primary', '--primary-foreground', '--primary-light', '--primary-dark',
    '--secondary', '--secondary-foreground', '--secondary-light', '--secondary-dark',
    '--muted', '--muted-foreground', '--accent', '--accent-foreground',
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--destructive', '--destructive-foreground',
    '--destructive-light', '--border', '--input', '--ring', '--text-disabled',
  ];
  
  propsToReset.forEach(prop => {
    root.style.removeProperty(prop);
  });
}

// Helper function to apply palette colors to CSS variables
function applyPaletteToCSS(palette: AppearancePalette | null, _mode: 'light' | 'dark') {
  const root = document.documentElement;
  
  // First reset to let CSS defaults take over
  resetCSSVariables();
  
  // If no palette, CSS defaults will be used
  if (!palette) return;
  
  // Primary colors
  if (palette.primary?.main) {
    const hsl = convertHexToHSL(palette.primary.main);
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
  }
  if (palette.primary?.contrastText) {
    root.style.setProperty('--primary-foreground', convertHexToHSL(palette.primary.contrastText));
  }
  if (palette.primary?.light) {
    root.style.setProperty('--primary-light', convertHexToHSL(palette.primary.light));
  }
  if (palette.primary?.dark) {
    root.style.setProperty('--primary-dark', convertHexToHSL(palette.primary.dark));
  }
  
  // Secondary colors
  if (palette.secondary?.main) {
    const hsl = convertHexToHSL(palette.secondary.main);
    root.style.setProperty('--secondary', hsl);
    root.style.setProperty('--muted', hsl);
    root.style.setProperty('--accent', hsl);
  }
  if (palette.secondary?.contrastText) {
    const hsl = convertHexToHSL(palette.secondary.contrastText);
    root.style.setProperty('--secondary-foreground', hsl);
    root.style.setProperty('--accent-foreground', hsl);
  }
  if (palette.secondary?.light) {
    root.style.setProperty('--secondary-light', convertHexToHSL(palette.secondary.light));
  }
  if (palette.secondary?.dark) {
    root.style.setProperty('--secondary-dark', convertHexToHSL(palette.secondary.dark));
  }
  
  // Background colors
  if (palette.background?.default) {
    root.style.setProperty('--background', convertHexToHSL(palette.background.default));
  }
  if (palette.background?.paper) {
    const hsl = convertHexToHSL(palette.background.paper);
    root.style.setProperty('--card', hsl);
    root.style.setProperty('--popover', hsl);
  }
  
  // Text colors
  if (palette.text?.primary) {
    const hsl = convertHexToHSL(palette.text.primary);
    root.style.setProperty('--foreground', hsl);
    root.style.setProperty('--card-foreground', hsl);
    root.style.setProperty('--popover-foreground', hsl);
  }
  if (palette.text?.secondary) {
    root.style.setProperty('--muted-foreground', convertHexToHSL(palette.text.secondary));
  }
  if (palette.text?.disabled) {
    root.style.setProperty('--text-disabled', convertHexToHSL(palette.text.disabled));
  }
  
  // Error/Destructive colors
  if (palette.error?.main) {
    root.style.setProperty('--destructive', convertHexToHSL(palette.error.main));
  }
  if (palette.error?.light) {
    root.style.setProperty('--destructive-light', convertHexToHSL(palette.error.light));
  }
  
  // Border/Divider
  if (palette.divider) {
    const hsl = convertHexToHSL(palette.divider);
    root.style.setProperty('--border', hsl);
    root.style.setProperty('--input', hsl);
  }
}

// Helper to convert hex to HSL format for CSS variables
function convertHexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle short hex format
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    // Set theme and apply the correct palette
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', action.payload === 'dark');
        localStorage.setItem('theme', action.payload);
        
        // Apply the correct palette for this mode
        const palette = action.payload === 'dark' ? state.darkPalette : state.lightPalette;
        applyPaletteToCSS(palette, action.payload);
      }
    },
    setLanguage: (state, action: PayloadAction<'en' | 'ar'>) => {
      state.language = action.payload;
      changeLanguage(action.payload);
    },
    // Store palettes for later use when switching themes
    setAppearancePalettes: (state, action: PayloadAction<{
      lightPalette?: AppearancePalette | null;
      darkPalette?: AppearancePalette | null;
    }>) => {
      if (action.payload.lightPalette !== undefined) {
        state.lightPalette = action.payload.lightPalette;
      }
      if (action.payload.darkPalette !== undefined) {
        state.darkPalette = action.payload.darkPalette;
      }
    },
    // Apply theme with palette and store palettes
    applyAppearanceTheme: (state, action: PayloadAction<{
      mode: 'light' | 'dark';
      palette?: AppearancePalette | null;
      lightPalette?: AppearancePalette | null;
      darkPalette?: AppearancePalette | null;
    }>) => {
      state.theme = action.payload.mode;
      
      // Store palettes if provided
      if (action.payload.lightPalette !== undefined) {
        state.lightPalette = action.payload.lightPalette;
      }
      if (action.payload.darkPalette !== undefined) {
        state.darkPalette = action.payload.darkPalette;
      }
      
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', action.payload.mode === 'dark');
        localStorage.setItem('theme', action.payload.mode);
        
        // Apply dynamic CSS variables from appearance settings
        const paletteToApply = action.payload.palette ?? 
          (action.payload.mode === 'dark' ? action.payload.darkPalette : action.payload.lightPalette) ??
          (action.payload.mode === 'dark' ? state.darkPalette : state.lightPalette);
        
        applyPaletteToCSS(paletteToApply, action.payload.mode);
      }
    },
    // Clear all custom appearance settings
    clearAppearanceSettings: (state) => {
      state.lightPalette = null;
      state.darkPalette = null;
      if (typeof document !== 'undefined') {
        resetCSSVariables();
      }
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setTheme, 
  setLanguage, 
  setAppearancePalettes,
  applyAppearanceTheme,
  clearAppearanceSettings,
} = uiSlice.actions;
