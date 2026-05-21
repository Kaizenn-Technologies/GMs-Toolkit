<div align="center">
    <picture> 
        <source media="(prefers-color-scheme: dark)" srcset="./.github/branding/gm-toolkit-logo-white-glow.png" />
        <source media="(prefers-color-scheme: light)" srcset="./.github/branding/gm-toolkit-logo-black-glow.png" />
        <img alt="GM's Toolkit" src="./.github/branding/gm-toolkit-logo-black-glow.png" width="20%" />
    </picture>
<h1><a href="https://gm-toolkit.xyz/">GM's Toolkit</a></h1>
Live now @ <a href="https://gm-toolkit.xyz/">gm-toolkit.xyz</a>
</div>

GM's Toolkit is a minimalist web application designed to replace older D&D 5e tools with a faster, cleaner experience tailored for 5.5e (2024).

- **HP Calculator**: Calculate or roll your character’s HP with full multiclass support and custom class handling.
- **Ability Scores**: Allocate or roll ability scores using Point Buy, Standard Array, or dice rolls, with suggested values based on class and background. Includes support for skills, saving throws, and expertise.
- **Dice Roller**: A feature-rich dice roller with presets, groups, combined rolls, advantage/disadvantage, quick dice inputs, and custom configurations. Feature to Import & Export Dice configurations. Also has Daggerheart's Hope & Fear (2d12) support.
- **Shareable & Verifiable Results**: Share character data and rolls via URL or QR code, with built-in verification.

<details>
<summary><h2>Project Screenshots</h2></summary>

## HP

A flexible HP calculator supporting multiclassing, custom classes, and shareable, verifiable rolled HP results


| **Class Picker** | **HP Breakdown** |
| :---: | :---: |
| HP Calculation with Multiclass & custom classes support | Rolled HP Results with differnce indicator against the average HP for the class combination |
|![HP Input](./.github/screenshots/hp-class-picker.png)|![HP Output](./.github/screenshots/hp-breakdown.png) |
  

| **Class Picker** | **HP Breakdown** |
| :---: | :---: |
| Share Rolled HP via URL or QR Code. | Verification |
|![HP Output](./.github/screenshots/hp-share-prompt.png)| ![HP Output](./.github/screenshots/verification-panel.png) |

## Ability Scores

Generate balanced characters with real-time point tracking or use advanced rolling mechanics.

- Point buy with class & background section for suggested stat allocation.
    ![Point Buy](./.github/screenshots/point-buy.png)

- Rolled Stats with suffled & manual score allocation options.

    ![Rolled Stats](./.github/screenshots/rolled_stats.png)

- Standard Array with PHB suggested points allocation based on class.

    ![Standard Array](./.github/screenshots/standard-array.png)

### Skills & Saving Throws

- Assign Skills & Saving throws proficiency or expertiese.

    ![Skills & Saving Throws](./.github/screenshots/skills%20&%20saving%20throws.png)


## DM Dice Roller

A specialized tool for DMs needing quick, high-density dice rolls. Features custom grouping, advantage/disadvantage toggles, and specific support for the Daggerheart RPG system.

- Preset rolls with groups for easy access to frequently used dice combinations or custom dice rolls for different creatures.
- Also supports rolling with advantage and disadvantage 
    
    ![Dice Preset Groups](./.github/screenshots/dices.png)
    ![Quick Add Dice](./.github/screenshots/quick-add-dice.png)    
    ![Import](./.github/screenshots/import.png)

### Dice Roll History

| **Detailed** | **Compact** |
| :---: | :---: |
| ![Dice Roll History Detailed](./.github/screenshots/dm-roller-log-expanded.png) | ![Dice Roll History Compact](./.github/screenshots/dm-roller-log-compact.png) |

- Partial Support for Daggerheart, can be turned on in the settings, more comming soon!
    
    ![](./.github/screenshots/dm-roller-daggerheart-hope-fear.png)

</details>

<!-- ## Future Enhancements

- Better Landing Page
- Serverside encrypted URLs for tamper-proof sharing. -->

## How to run locally

1. Make sure you have Node.js and Bun installed
1. Run `bun install` to install the dependencies
1. Run `bun run dev` to start the development server

## Contributions, Support, Feature Request & Bug Reports

Please join our [discord server](https://discord.gg/nBzSVyHfMy)