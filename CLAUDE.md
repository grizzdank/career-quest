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
- All game entities should extend the base `Entity` class (in `js/sim.js`)
- Enemy types: 'creep', 'sync', 'ticket', 'subticket', 'zombie', 'boss'; tower types: 'no', 'brief', 'async', 'ai'
- Maintain consistent sprite naming in assets/sprites directory

### Error Handling
- Use try/catch with async code
- Log errors with console.error including context information
- Provide fallbacks for loading failures (e.g., placeholder sprites)

### Project Structure
- The game is the tower defense at the repo root: data in js/config.js, rules in js/sim.js (no DOM), drawing in js/render.js, input and UI in js/main.js
- Plain script tags, no ES modules and no build step, so `open index.html` keeps working
- The original 2025 shooter lives in classic/ and is not maintained
- Store assets in appropriate subdirectories (sprites, backgrounds, audio)
- Implementation notes and specifications in documents/