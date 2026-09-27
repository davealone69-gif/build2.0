/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F7F3EA',
    tint: '#FF6B35',

    // Core surfaces
    background: '#121212',
    foreground: '#F7F3EA',

    // Cards / elevated surfaces
    card: '#1C1B1A',
    cardForeground: '#F7F3EA',

    // Primary action color (buttons, links, active states)
    primary: '#FF6B35',
    primaryForeground: '#17110D',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#272321',
    secondaryForeground: '#F7F3EA',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#242321',
    mutedForeground: '#A9A39B',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#2B332D',
    accentForeground: '#A8E6BF',

    // Destructive actions (delete, error states)
    destructive: '#F05D5E',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#393632',
    input: '#393632',
  },

  dark: {
    text: '#F7F3EA',
    tint: '#FF6B35',
    background: '#121212',
    foreground: '#F7F3EA',
    card: '#1C1B1A',
    cardForeground: '#F7F3EA',
    primary: '#FF6B35',
    primaryForeground: '#17110D',
    secondary: '#272321',
    secondaryForeground: '#F7F3EA',
    muted: '#242321',
    mutedForeground: '#A9A39B',
    accent: '#2B332D',
    accentForeground: '#A8E6BF',
    destructive: '#F05D5E',
    destructiveForeground: '#FFFFFF',
    border: '#393632',
    input: '#393632',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
