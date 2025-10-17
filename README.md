# Cookie Clicker Game

A fully functional Cookie Clicker game with user authentication, built entirely with HTML, CSS, and JavaScript. No PHP or server-side language required!

## Features

- **User Authentication**
  - User registration (Sign Up)
  - User login
  - Password hashing (basic client-side hashing)
  - Session management

- **Game Features**
  - Click the cookie to earn cookies
  - Multiple upgrade types (Cursor, Grandma, Farm, Mine, Factory, Bank, Temple, Wizard Tower)
  - Cookies per second (CPS) system
  - Auto-saving every 5 seconds
  - Game state persistence per user
  - Beautiful responsive UI

- **Data Storage**
  - All data stored in browser's localStorage
  - Each user has their own saved game data
  - Progress is automatically restored on login

## Installation on Red Hat httpd Server

1. **Copy files to your web server directory:**
   ```bash
   sudo cp -r /home/orbmod/Desktop/Custom/Web-projects/COOKIECLIEKER2/* /var/www/html/cookieclicker/
   ```

2. **Set proper permissions:**
   ```bash
   sudo chown -R apache:apache /var/www/html/cookieclicker/
   sudo chmod -R 755 /var/www/html/cookieclicker/
   ```

3. **Ensure httpd is running:**
   ```bash
   sudo systemctl start httpd
   sudo systemctl enable httpd
   ```

4. **Access the game:**
   Open your browser and navigate to:
   - `http://localhost/cookieclicker/`
   - Or `http://your-server-ip/cookieclicker/`

## File Structure

```
COOKIECLIEKER2/
├── index.html          # Main HTML file with auth and game UI
├── styles.css          # All styling for the application
├── auth.js             # Authentication system (login/signup)
├── game.js             # Game logic and mechanics
├── app.js              # Main application controller
└── README.md           # This file
```

## How It Works

### Authentication
- User data is stored in `localStorage` with the key `cookieClicker_users`
- Passwords are hashed using a simple client-side hash function
- Current user session is tracked in `cookieClicker_currentUser`

### Game Data
- Each user's game data includes:
  - Total cookies
  - Total clicks
  - All-time cookies
  - Cookies per second
  - Owned upgrades
  - Last saved timestamp
- Game auto-saves every 5 seconds and on every significant action
- Data persists between sessions

### Storage Format
All data is stored in browser's localStorage as JSON:
```javascript
{
  "username": {
    "password": "hashedPassword",
    "createdAt": "2025-10-16T...",
    "gameData": {
      "cookies": 1000,
      "totalClicks": 500,
      "allTimeCookies": 5000,
      "cookiesPerSecond": 10,
      "upgrades": {
        "cursor": 5,
        "grandma": 2,
        // ...
      },
      "lastSaved": "2025-10-16T..."
    }
  }
}
```

## Usage

1. **First Time:**
   - Click "Sign Up"
   - Create a username (min 3 characters)
   - Create a password (min 6 characters)
   - You'll be automatically logged in

2. **Returning Users:**
   - Enter your username and password
   - Click "Login"
   - Your game progress will be restored

3. **Playing:**
   - Click the big cookie to earn cookies
   - Buy upgrades to generate cookies automatically
   - Your progress is saved automatically
   - Click "Logout" when done (progress is saved)

## Browser Compatibility

Works in all modern browsers that support:
- localStorage API
- ES6 JavaScript
- CSS Grid and Flexbox

Tested on:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## Security Notes

⚠️ **Important:** This implementation uses client-side storage and basic hashing. For a production environment with real user data, you should:
- Use proper server-side authentication
- Implement secure password hashing (bcrypt, Argon2)
- Use HTTPS
- Implement CSRF protection
- Add rate limiting
- Use secure session management

This implementation is perfect for:
- Personal use
- Local network games
- Learning purposes
- Prototyping
- Single-player games with local progress

## Troubleshooting

**Game doesn't load:**
- Check browser console for errors
- Ensure JavaScript is enabled
- Clear browser cache and reload

**Progress not saving:**
- Check if localStorage is enabled in your browser
- Check browser storage quota
- Try a different browser

**Can't login after signup:**
- Ensure you're using the exact username and password
- Check for spaces in username/password
- Try clearing localStorage and creating a new account

## Credits

Created with ❤️ using vanilla JavaScript, HTML, and CSS.
No frameworks, no server-side code, just pure web technologies!
