---
name: KaratBox Luxury Light
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4d4635'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#444546'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
This design system embodies "Illuminated Opulence." It transitions from a heavy, nocturnal luxury to a bright, gallery-esque aesthetic that feels expansive and high-end. The target audience consists of high-net-worth individuals and collectors who value clarity, precision, and the warmth of precious metals. 

The style is **Minimalist-Luxury**, utilizing vast white space to frame content like high-end jewelry. By removing dark backgrounds, we lean into a "boutique" feel where the gold accents serve as focal points rather than mere highlights. The emotional response is one of exclusivity, trustworthiness, and sophisticated modernity.

## Colors
The palette is anchored by **Luminous Gold (#D4AF37)**, used strategically for calls to action, progress indicators, and premium markers. 

- **Surface Primary**: #FFFFFF (Pure White) for the main canvas.
- **Surface Secondary**: #F9F9F9 (Off-white) for subtle section differentiation.
- **Surface Tertiary**: #F4F4F4 (Light Grey) for input fields and containers.
- **Text Primary**: #1A1A1A (Near Black) ensures maximum legibility and a grounded feel.
- **Text Secondary**: #717171 (Medium Grey) for metadata and placeholder text.
- **Accents**: Gold is the only chromatic color allowed, ensuring the brand identity remains concentrated and potent.

## Typography
Montserrat provides a geometric, modern foundation that feels both architectural and accessible. 

- **Headlines**: Use heavy weights (600-700) with slight negative letter-spacing to create a "locked-in," impactful look. 
- **Body Text**: Maintain generous line-height (1.5-1.6) to enhance the feeling of "breathable" luxury.
- **Labels**: Small labels and overlines should use uppercase with increased tracking (+0.05em) to mimic the engraving found on luxury goods.
- **Coloration**: All headings must be #1A1A1A. Gold should be used sparingly for specific typographic links or "member-only" badges.

## Layout & Spacing
The layout follows a **Fixed-Width Grid** on desktop to maintain a curated, editorial feel. 

- **Grid**: A 12-column system with 24px gutters.
- **Whitespace**: Utilize large vertical margins (64px+) between sections to prevent the UI from feeling "cluttered" or "discount."
- **Mobile**: Scale margins down to 20px, but maintain the 8px base spacing unit for all component internals.
- **Alignment**: Elements should be strictly aligned to the grid to project a sense of order and institutional stability.

## Elevation & Depth
In this light mode, depth is achieved through **Tonal Layering** and **Ambient Shadows** rather than high-contrast overlaps.

- **Soft Elevation**: Use very diffused, low-opacity shadows (Color: #000000, Opacity: 4%, Blur: 20px) for cards to make them float gently above the white background.
- **Tonal Depth**: Use #F4F4F4 for background containers (like sidebars or footers) to create structural hierarchy without relying on heavy borders.
- **Interactions**: On hover, gold-accented elements may increase in shadow depth slightly to provide tactile feedback.

## Shapes
The design system uses a **Rounded (8px)** base to soften the geometric nature of the Montserrat typeface. 

- **Buttons/Inputs**: 8px (0.5rem) corner radius.
- **Cards/Modules**: 16px (1rem) corner radius for a friendlier, modern-premium feel.
- **Icons**: Should feature slightly rounded caps and joins to match the UI's radius philosophy.

## Components
- **Buttons**:
  - **Primary**: Solid Gold (#D4AF37) with White (#FFFFFF) text. High-contrast, bold, and authoritative.
  - **Secondary**: Transparent with a 2px Gold border and Gold text.
- **Inputs**: Use #F4F4F4 backgrounds with a 1px border that turns Gold on focus. Placeholders should be in Text Secondary (#717171).
- **Cards**: Pure White (#FFFFFF) background with the defined "Soft Elevation" shadow. No borders, or a very faint 1px #F4F4F4 border.
- **Chips/Badges**: Light Gold wash (10% opacity) with solid Gold text for status indicators.
- **Lists**: Use subtle 1px dividers in #F4F4F4. Increase vertical padding (16px+) for list items to maintain the premium, airy aesthetic.
- **Selection Controls**: Checkboxes and Radio buttons use Gold for the "selected" state.