# GM's Toolkit

![Header](./.github/header.png)

## About

GM's Toolkit is a powerful web application designed to streamline game management for Game Masters.

### Features
- **HP Calculator**: Track party HP, temporary HP, and status effects for the whole table.
- **Stat Generator**: Create characters with Point Buy, Standard Array, or advanced dice rolling logic.
- **Dice Roller**: High-density DM dice roller with custom groups and Daggerheart (2d12) support.

## HP Calculator

Manage your party's health, temporary hit points, and death saves in one compact, efficient interface.

- HP Calculation with Multiclass support
    
    ![HP Input](./.github//features/hp-calculator-input.png)
- Rolled HP Results with differnce indicator against the average HP for the class combination
    
    ![HP Output](./.github/features/hp-calculator-output.png)

- Ability to share rolled stats with verifiable Name, No. of Rerolls, Time, and the dice roll results.

<!-- > Insert image of share modal -->
    
## Stat Generator
Generate balanced characters with real-time point tracking or use advanced rolling mechanics.

- Point buy with class & background section for suggested stat allocation.
    ![Point Buy](./.github/features/point-buy.png)

- Rolled Stats with suffled & manual score allocation options.

    ![Rolled Stats](./.github/features/rolled-stats.png)

- Standard Array with PHB Suggested Points Allocation based on class.

    ![Standard Array](./.github/features/standard-array.png)


## DM Dice Roller

A specialized tool for DMs needing quick, high-density dice rolls. Features custom grouping, advantage/disadvantage toggles, and specific support for the Daggerheart RPG system.

- Preset Rolls with groups for easy access to frequently used dice combinations or custom dice rolls for different creatures.
- Also supports Rolling with advantage and disadvantage 

    ![Dice Preset Groups](./.github/features/dm-roller-groups.png)
    ![Add Dice](./.github/features/add-dice.png)
    ![Quick Add Dice](./.github/features/quick-add-dice.png)    


| **Detailed** | **Compact** |
| :---: | :---: |
| ![Dice Roll History Detailed](./.github/features/dm-roller-log-expanded.png) | ![Dice Roll History Compact](./.github/features/dm-roller-log-compact.png) |



- Partial Support for Daggerheart, can be turned on in the settings, more comming soon!
    
    ![](./.github/features/dm-roller-daggerheart-hope-fear.png)

# TODO

- Share modal component, also display the time of rolled HP
- Encrypted URL for tamper-proof sharing.
- Share & Reset button, for Rolled Stats

