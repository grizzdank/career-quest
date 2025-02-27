# Career Quest Game Implementation Guide

This document outlines how to implement and customize the Career Quest game for your portfolio website.

## Project Structure

```
your-website/
├── index.html            # Main HTML with game canvas
├── js/                   # JavaScript modules directory
│   ├── main.js           # Entry point that initializes the game
│   ├── core/             # Core game systems
│   │   ├── GameEngine.js # Main game loop and state management
│   │   ├── AssetLoader.js # Handles loading of sprites, backgrounds, and audio
│   │   ├── EntityManager.js # Manages game entities
│   │   ├── Renderer.js   # Handles all rendering operations
│   │   └── UIManager.js  # Manages UI elements like debug overlay
│   └── entities/         # Game entity classes
│       ├── Player.js     # Player character
│       ├── JiraMonster.js # JIRA ticket enemy
│       ├── ZombieManager.js # Manager enemy
│       ├── Meeting.js    # Meeting enemy
│       └── Arrow.js      # Projectile weapon
├── assets/               # Game assets directory
│   ├── sprites/          # Character and object sprites
│   │   ├── player.png
│   │   ├── jiraMonster.png
│   │   ├── zombieManager.png
│   │   ├── meeting.png
│   │   └── arrow.png
│   ├── backgrounds/      # Background images
│   │   ├── title-bg.png
│   │   └── game-bg.png
│   ├── sounds/           # Game sound effects
│   └── music/            # Background music
└── README.md             # Documentation
```

## Sprite Implementation

The game is configured to use colored rectangles as placeholders for most sprites, with special handling for the `jiraMonster` sprite. To add real sprites:

1. Create the `assets/sprites/` directory structure
2. Add your sprite images with these exact filenames:
   - `player.png` - Your character
   - `jiraMonster.png` - JIRA ticket enemy
   - `zombieManager.png` - Manager enemy
   - `meeting.png` - Meeting enemy
   - `arrow.png` - Projectile

3. The game will automatically attempt to load these sprites. If loading fails, it will fall back to colored placeholders.

## Modular Architecture

The game uses a modular architecture with ES6 modules:

1. **Core Modules**:
   - `GameEngine.js`: Manages the game loop, state, and coordinates other systems
   - `AssetLoader.js`: Handles loading and management of sprites, backgrounds, and audio
   - `EntityManager.js`: Creates, updates, and manages all game entities
   - `Renderer.js`: Handles all rendering operations based on game state
   - `UIManager.js`: Manages UI elements like the debug overlay and mute button

2. **Entity Classes**:
   - `Player.js`: Player character with movement and attack capabilities
   - `JiraMonster.js`: Enemy that moves horizontally and can be defeated with code arrows
   - `ZombieManager.js`: Enemy that moves erratically and occasionally jumps
   - `Meeting.js`: Enemy that moves slowly but can float upward
   - `Arrow.js`: Player's weapon that moves horizontally

## Debugging Features

The game includes built-in debugging tools:

1. **Debug Overlay**: Press 'D' to toggle a debug overlay that shows:
   - Current game state
   - FPS
   - Player position
   - Entity count
   - Asset loading status
   - Sprite information
   - Error log

2. **Console Logging**: Detailed logging for asset loading and entity creation
3. **Bounding Boxes**: Option to show entity collision boundaries

## Artwork Creation

For authentic retro game vibes, create pixel art sprites for:

1. Player character: Represent yourself in professional attire
2. Enemies:
   - JIRA Ticket Monsters: Ticket-shaped creatures
   - Middle Manager Zombies: Slow-moving bureaucratic figures
   - Meetings: Circular clock-like enemies that multiply
3. Projectiles: Code snippet arrows, presentation slides, etc.
4. Background elements: Office environment, tech company buildings

You can create these using:
- Piskel (https://www.piskelapp.com/) - Free online sprite editor
- Aseprite - Professional pixel art tool ($20)
- Or commission a pixel artist on Fiverr/Upwork

## Coding Challenges

The game includes a simple coding challenge system. You can customize the challenges in the `GameEngine.js` file:

```javascript
startCodingChallenge() {
  this.gameState = 'coding';
  this.codingChallenge = {
    prompt: "Write a function that returns the sum of two numbers:",
    expectedOutput: "function add(a, b) { return a + b; }",
    userCode: ""
  };
}
```

Create real-world relevant coding challenges for your field:
1. Simple function implementations
2. Algorithm puzzles
3. Debugging exercises
4. Design pattern implementations

## Technical Improvements

To enhance the game further:

1. Add sprite animation frames
2. Implement more sophisticated collision detection
3. Create a level design system using tilemaps
4. Add sound effects and background music
5. Implement a save system to remember progress
6. Create a more robust code editor for coding challenges

## Performance Considerations

- Use sprite sheets to reduce HTTP requests
- Implement object pooling for projectiles and effects
- Consider canvas scaling for high-DPI displays
- Add a lower-quality mode for mobile devices

## Integration With Portfolio

- Host the game files alongside your portfolio website
- Add a link to your portfolio from the game's completion screen
- Consider adding analytics to track engagement
- Use the game as a showcase of your JavaScript skills