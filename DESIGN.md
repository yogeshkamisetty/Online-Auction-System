---
name: Technical Precision 2.0
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4d4636'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7f7663'
  outline-variant: '#d1c5b0'
  surface-tint: '#755b00'
  primary: '#755b00'
  on-primary: '#ffffff'
  primary-container: '#ffd45f'
  on-primary-container: '#755b00'
  inverse-primary: '#ebc24f'
  secondary: '#406185'
  on-secondary: '#ffffff'
  secondary-container: '#b3d4ff'
  on-secondary-container: '#3b5c80'
  tertiary: '#b22a21'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffcdc6'
  on-tertiary-container: '#b22a21'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf91'
  primary-fixed-dim: '#ebc24f'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#594400'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#a8c9f3'
  on-secondary-fixed: '#001d36'
  on-secondary-fixed-variant: '#27496c'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#900e0c'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  meta-table:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system embodies the intersection of high-stakes asset liquidation and advanced financial technology. The brand personality is authoritative, precise, and elite—designed to evoke the confidence of a Swiss private bank and the editorial prestige of a global auction house. 

The aesthetic strategy blends **Modern Corporate** reliability with **Glassmorphism** for utility layers and **Minimalism** for content presentation. It prioritizes clarity for high-velocity bidding environments while maintaining a luxurious atmosphere through expansive whitespace, razor-sharp typography, and a "Technical Precision" ethos where every pixel feels intentional and engineered.

## Colors
This design system utilizes a disciplined **60-30-10** distribution to maintain editorial balance. 

- **Surface (60%):** #F8F9FA forms the primary canvas. This high-key environment ensures that luxury product photography and data visualizations remain the focal point.
- **Structural (30%):** #012C4E (Deep Midnight) provides the "technical" weight. Use this for navigation, headers, and footers to ground the interface.
- **Prestige (10%):** #FFD45F (Vibrant Gold) is reserved for critical actions, elite tier markers, and "Active Bid" states, offering higher visibility than previous iterations.

Functional accents are used sparingly: **Deep Emerald** for real-time bid pulses and **Electric Crimson** (#961410) for AI-driven investment insights, urgent alerts, and exclusive curated collections.

## Typography
The typographic scale is designed for both "Big Moment" editorial impact and "Small Data" technical utility. 

**Geist** is the voice of authority; headlines should always use tight tracking (-2% to -4%) to create a dense, modern aesthetic. **Inter** handles the heavy lifting for descriptions and interface labels, providing a neutral, highly readable foundation. **JetBrains Mono** is utilized strictly for micro-metadata, lot numbers, time-stamps, and blockchain hashes, reinforcing the "Technical Precision" of the platform.

## Layout & Spacing
The system follows a strict **8px grid**. Layouts should be structured on a 12-column fluid grid for desktop, transitioning to a 4-column grid for mobile.

- **Margins:** Use 24px (lg) margins on mobile and 40px (xl) margins on desktop to maintain an airy, editorial feel.
- **Rhythm:** Vertical rhythm is maintained by using multiples of 8px. Use 16px (md) for internal card padding and 24px (lg) for section spacing.
- **Data Density:** In dashboards or auction lists, the spacing can collapse to 4px (xs) and 8px (base) to allow for high-density information viewing without losing the professional structure.

## Elevation & Depth
Depth is used to signify "The Technical Overlay."

- **Layers:** Use **Tonal Layers** for the primary interface—different shades of White and Neutral Gray to separate content blocks.
- **Glassmorphism:** Reserved exclusively for temporary states: modals, dropdown menus, and hover-state quick-view panels. These should feature a 12px backdrop blur and a subtle 1px white border at 10% opacity.
- **Shadows:** Avoid heavy, muddy shadows. Use sharp, high-contrast borders for card definition. For elevated elements, use a "Hard/Soft" shadow combo: a tight 2px shadow for definition and a wide, 15% opacity Deep Midnight shadow for presence.

## Shapes
The shape language is "Soft-Mechanical." 

The system uses a 4px (Soft) base radius for standard inputs and small buttons, scaling up to 8px for cards and containers. This provides a "clicky," modern feel that stops short of being overly playful or consumer-grade. Interactive elements should feel like precision-machined tools.

## Components
- **Buttons:** Primary buttons use #FFD45F with black text for high-contrast accessibility. Secondary buttons use #012C4E with white text. Ghost buttons use a 1px border. All buttons have a 4px radius and a subtle "inner-glow" gradient to provide a tactile, premium feel.
- **KPI Cards:** Feature high-contrast borders, Deep Midnight typography for values, and Deep Emerald animated sparklines for real-time price action.
- **Input Fields:** Use a 1px border (#E5E7EB) that shifts to #FFD45F on focus. Labels use JetBrains Mono for a technical look.
- **Skeleton Loaders:** Use a "Shimmer" effect that moves from #F3F4F6 to #E5E7EB, mimicking the light reflection on brushed metal.
- **Product Photography:** Must be high-resolution, using consistent studio lighting with neutral backgrounds. No flat illustrations are permitted; use geometric glass textures with subtle gradients to fill empty states.
- **Chips/Status:** Live auctions use Deep Emerald pills with white JetBrains Mono text to signal urgency and uptime.
