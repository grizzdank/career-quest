# Career Quest Development Guidelines

## Build/Test Commands
```
# Open the game locally
open index.html

# Test in browser debug mode
open -a "Google Chrome" index.html --args --auto-open-devtools-for-tabs
```

## Code Style Guidelines

### HTML/CSS
- Use 2-space indentation
- Follow BEM naming for CSS classes
- Maintain responsive design patterns (mobile-first)

### JavaScript
- Use modern ES6+ syntax with async/await for promises
- Class-based architecture for game entities
- Descriptive variable names in camelCase
- Method names should be verb-first (e.g., `loadSprites()`, `handleKeyDown()`)

### Game Entities
- All game entities should extend the base `Entity` class
- Entity types: 'player', 'jiraMonster', 'zombieManager', 'meeting', 'arrow'
- Maintain consistent sprite naming in assets/sprites directory

### Error Handling
- Use try/catch with async code
- Log errors with console.error including context information
- Provide fallbacks for loading failures (e.g., placeholder sprites)

### Project Structure
- Keep main game logic in career-quest.js
- Store assets in appropriate subdirectories (sprites, backgrounds, audio)
- Implementation notes and specifications in documents/