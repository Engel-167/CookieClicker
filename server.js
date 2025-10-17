const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // Create users file if it doesn't exist
    try {
        await fs.access(USERS_FILE);
    } catch {
        await fs.writeFile(USERS_FILE, JSON.stringify({}));
    }
}

// Read users from file
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return {};
    }
}

// Write users to file
async function writeUsers(users) {
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
}

// API Routes

// Sign up endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        if (username.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username must be at least 3 characters' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        const users = await readUsers();

        // Check if user exists
        if (users[username]) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        users[username] = {
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            gameData: {
                cookies: 0,
                totalClicks: 0,
                allTimeCookies: 0,
                cookiesPerSecond: 0,
                upgrades: {},
                lastSaved: new Date().toISOString()
            }
        };

        await writeUsers(users);

        res.json({ 
            success: true, 
            message: 'Account created successfully!',
            username 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during signup' 
        });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        const users = await readUsers();
        const user = users[username];

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Login successful!',
            username,
            gameData: user.gameData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Get user's game data
app.get('/api/gamedata/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const users = await readUsers();
        const user = users[username];

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            gameData: user.gameData 
        });
    } catch (error) {
        console.error('Get game data error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error retrieving game data' 
        });
    }
});

// Save user's game data
app.post('/api/gamedata/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const gameData = req.body;

        const users = await readUsers();

        if (!users[username]) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        users[username].gameData = {
            ...gameData,
            lastSaved: new Date().toISOString()
        };

        await writeUsers(users);

        res.json({ 
            success: true, 
            message: 'Game data saved successfully' 
        });
    } catch (error) {
        console.error('Save game data error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error saving game data' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
    await ensureDataDir();
    app.listen(PORT, () => {
        console.log(`🍪 Cookie Clicker Server running on http://localhost:${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`🎮 Open http://localhost:${PORT} in your browser to play!`);
    });
}

startServer().catch(console.error);
