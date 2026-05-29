# Changelog

## [v0.7.7]

### Fixed
- Fixed dropdown selector behaviour for rolled and standard arrays in the ability score generator.
- Removed tagline from mobile hamburger menu.

## [v0.7.6]

### Added
- Dedicated Skill & Saving Throw panel displaying available skill points and choices for both Class and Background.
- Vibrant, class-matching colors across your skills, saving throws, and HP Calculator elements.
- Interactive skill badges—simply click skill badges to instantly toggle your character's proficiencies.
- Clean, neutral grey styling for Custom classes in the HP Breakdown to keep multi-class selections visually distinct.
- Under-the-hood optimization of color formatting code to keep the application fast and responsive.
- Completely redesigned, mobile-friendly navigation header that scales seamlessly down to the narrowest mobile viewports.
- Fluid, interactive hamburger menu button that smoothly spins, scales, and morphs into a crisp close 'X' icon.
- Premium glassmorphic slide-down navigation drawer featuring touch-friendly, color-themed feature rows with active highlights and continuous breathing pulse animations.
- Dynamic sliding micro-animations for the custom `StepperInput` that slides values left or right on decrement or increment.
- Smooth slide-highlight box in custom `Tabs` that slides gracefully to active tabs using real-time DOM tracking.
- Elegant fade-in/slide-down and slide-up/fade-out transitions for adding or removing multi-class rows in the HP Calculator.
- "Maximize Space" sitewide appearance option that hides footers, page titles, and margins to maximize visible area.

### Changed
- Custom classes are now always available to select as many times as you like in multi-class layouts.
- The HP Calculator now defaults to the Custom class when loading the page for a clean initial setup.
- Sleek, cohesive styling for unrecognized classes in multi-class breakdowns to prevent conflicting color themes.
- Desktop header navigation tabs styled with sleek capsule active state highlights and refined outline borders.
- HP Breakdown class color indicators are now dynamically resolved from core class definitions rather than deterministic arrays.

### Fixed
- Missing Background settings for Rolled Stats & Point Buy
- Reorganized Settings panel hierarchy for a cleaner and more intuitive tool configuration experience.

## [v0.7.5]

### Updated
- Renamed 'Stat Generator' to 'Ability Score'

### Fixed
- Page load times by minifying.
- Issues outlined by the Lighthouse report.

## [v0.7.4]

### Fixed
- Fixed pseudo-randomness by replacing Math.Random() by Random-js package 

## [v0.7.3]

### Added
- Import & Export functionality for DMs Dice Roller

### Fixed
- Character level not preserved in the Skills & saving throws section when sharing via link.
- Reset button in rolled assignments tab not unsetting dropdowns in production builds.
- Dropdown menu animation on smaller screens.

## [v0.7.2]

### Added
- GPLv3 LICENSE

### Fixed
- Cleaned up the sourcecode
- Updated Packages and fixed vulnerability issues

## [v0.7.1]

### Fixed
- Skills & saving throw dropdown behaviour
- Unused advance share setting removed from code

### Added
- Breakdown panel redesign
- HP Breakdown toggle to settings
- Rolled HP arrow indicator showing deviation from average

## [v0.7.0]

### Fixed
- Inconsistent result for rolled HP links
- Skills not loading via share link
- Custom class not being selected when added

### Added
- Toggle to disable share prompt
