# Career Quest - The Job Hunt RPG

A simple 2D game built with vanilla JavaScript where you navigate through the corporate landscape, battling meetings, JIRA tickets, and zombie managers.

## Modular Architecture

The game has been refactored to use a modular architecture for better maintainability and organization:

### Core Modules

- **GameEngine.js**: Main game loop and state management
- **AssetLoader.js**: Handles loading of sprites, backgrounds, and audio
- **EntityManager.js**: Manages game entities (player, enemies, projectiles)
- **Renderer.js**: Handles all rendering operations
- **UIManager.js**: Manages UI elements like debug overlay and mute button

### Entity Classes

- **Player.js**: Player character with movement and attack capabilities
- **JiraMonster.js**: Enemy that moves horizontally and can be defeated with code arrows
- **ZombieManager.js**: Enemy that moves erratically and occasionally jumps
- **Meeting.js**: Enemy that moves slowly but can float upward
- **Arrow.js**: Player's weapon that moves horizontally

## How to Run

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Use arrow keys to move and jump
4. Press SPACE to create code weapons
5. Press D to toggle debug overlay

## Debug Features

- Press D to toggle the debug overlay
- Debug overlay shows:
  - Game state
  - FPS
  - Player position
  - Entity count
  - Asset loading status
  - Sprite information
  - Error log

## Known Issues

- JiraMonster sprite may not load correctly in some cases
- Performance may degrade with many entities on screen

## Future Improvements

- Implement a component-based entity system
- Add more enemy types
- Improve collision detection
- Add sound effects
- Add more levels and challenges