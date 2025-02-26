// Career Quest: The Job Hunt RPG
// Concept Document

GAME OVERVIEW:
-------------
"Career Quest" is a retro-style browser game showcasing your skills and personality
while you battle through the challenges of modern job hunting. The aesthetic is inspired
by early 90s games like Prince of Persia and Carmen Sandiego, with pixel art and
chiptune music.

CHARACTERS:
----------
- Player Character: You as a job-seeking hero, with customizable abilities based on your real skills
- Enemies:
  * Project Manager Meetings (slow-moving but multiply if not dealt with quickly)
  * JIRA Ticket Monsters (come in swarms, each requiring specific skills to defeat)
  * Middle Manager Zombies (block progress unless you show the right credentials)
  * The Legacy Code Beast (final boss - requires refactoring to defeat)

GAMEPLAY MECHANICS:
-----------------
1. Skill-Based Weapons:
   - Code Snippets: Player types actual small code fragments to create arrows
   - Portfolio Items: Collectibles that become special abilities
   - Resume Powerups: Unlock new areas and abilities

2. Interactive Elements:
   - Coding Challenges: Mini-games where correct solutions create tools/weapons
   - Interview Questions: Dialog-based challenges that affect game progression
   - Portfolio Puzzles: Arrange your achievements to unlock doors

3. Progression:
   - Multiple "companies" as levels
   - Each level showcases different skills/achievements
   - Secret areas reveal more about your personality/hobbies

TECHNICAL IMPLEMENTATION:
-----------------------
- Canvas-based game engine with vanilla JavaScript (no external libraries)
- Responsive design that works on desktop/mobile
- Persistent save state using localStorage
- Simple code editor for the coding challenges
- Achievement system tied to real portfolio items

ART STYLE:
---------
- 16-bit pixel art reminiscent of SNES/Genesis era
- Limited color palette (12-16 colors)
- Character sprites with minimal but expressive animations
- Thematic environments based on different workplace settings

SOUND:
-----
- Chiptune background music
- Retro sound effects for actions
- Special victory tunes for completing challenges

INTEGRATION WITH PORTFOLIO:
-------------------------
- Completing the game reveals your full resume
- Easter eggs lead to detailed project descriptions
- "Contact" powerup opens actual contact form
- Achievements unlock real portfolio pieces