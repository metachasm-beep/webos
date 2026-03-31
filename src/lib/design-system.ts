/**
 * WebOS AI — Neural Design Registry
 * This registry orchestrates color palettes (OKLCH), typography pairings,
 * and layout tokens across the entire synthesis canvas.
 */

export interface DesignTheme {
  id: string;
  label: string;
  primary: string;   // oklch
  accent: string;    // oklch
  bg: string;        // oklch
  headingFont: string; // CSS Var
  bodyFont: string;    // CSS Var
  radius: string;      // px
  glassIntensity: number; // 0-100
}

export const PRESET_THEMES: Record<string, DesignTheme> = {
  emerald: {
    id: "emerald",
    label: "Emerald Synthesis",
    primary: "oklch(0.75 0.15 150)",
    accent: "oklch(0.85 0.1 190)",
    bg: "oklch(0.05 0.01 150)",
    headingFont: "var(--font-heading-modern)",
    bodyFont: "var(--font-body-modern)",
    radius: "24px",
    glassIntensity: 20
  },
  sapphire: {
    id: "sapphire",
    label: "Sapphire Protocol",
    primary: "oklch(0.65 0.2 250)",
    accent: "oklch(0.75 0.15 190)",
    bg: "oklch(0.05 0.01 250)",
    headingFont: "var(--font-heading-modern)",
    bodyFont: "var(--font-body-modern)",
    radius: "24px",
    glassIntensity: 25
  },
  ruby: {
    id: "ruby",
    label: "Ruby Matrix",
    primary: "oklch(0.6 0.25 20)",
    accent: "oklch(0.7 0.15 40)",
    bg: "oklch(0.05 0.01 20)",
    headingFont: "var(--font-heading-elegant)",
    bodyFont: "var(--font-body-modern)",
    radius: "16px",
    glassIntensity: 15
  },
  obsidian: {
    id: "obsidian",
    label: "Pure Obsidian",
    primary: "oklch(0.98 0 0)", // White/Silver text
    accent: "oklch(0.6 0 0)",
    bg: "oklch(0.02 0 0)",
    headingFont: "var(--font-heading-classic)",
    bodyFont: "var(--font-body-modern)",
    radius: "0px",
    glassIntensity: 10
  }
};

export const TYPOGRAPHY_PAIRINGS = {
  classic: { 
    id: "classic",
    heading: 'var(--font-heading-classic)', 
    body: 'var(--font-body-classic)', 
    label: "Classic Serif" 
  },
  modern: { 
    id: "modern",
    heading: 'var(--font-heading-modern)', 
    body: 'var(--font-body-modern)', 
    label: "Modern Sans" 
  },
  elegant: { 
    id: "elegant",
    heading: 'var(--font-heading-elegant)', 
    body: 'var(--font-body-elegant)', 
    label: "Elegant Display" 
  }
};

/**
 * Utility to generate a dynamic theme from brand colors using OKLCH
 */
export function generateNeuralTheme(brandPrimary: string, intent: string): DesignTheme {
  // TODO: Implement more advanced color theory logic here
  return {
    id: "dynamic-" + Date.now(),
    label: "Neural " + intent,
    primary: brandPrimary,
    accent: "oklch(0.7 0.1 200)", // Complementary logic
    bg: "oklch(0.05 0.01 240)",
    headingFont: "var(--font-heading-modern)",
    bodyFont: "var(--font-body-modern)",
    radius: "20px",
    glassIntensity: 20
  };
}
