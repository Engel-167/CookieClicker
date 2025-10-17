// Authentication Module
class AuthSystem {
    constructor() {
        this.USERS_KEY = 'cookieClicker_users';
        this.CURRENT_USER_KEY = 'cookieClicker_currentUser';
    }

    // Get all users from localStorage
    getAllUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Hash password (simple hash for demo - in production use proper hashing)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Sign up a new user
    signup(username, password) {
        // Validate input
        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const users = this.getAllUsers();

        // Check if user already exists
        if (users[username]) {
            return { success: false, message: 'Username already exists' };
        }

        // Create new user
        users[username] = {
            password: this.hashPassword(password),
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

        this.saveUsers(users);
        return { success: true, message: 'Account created successfully!' };
    }

    // Login user
    login(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        const users = this.getAllUsers();
        const user = users[username];

        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Invalid username or password' };
        }

        // Set current user
        localStorage.setItem(this.CURRENT_USER_KEY, username);
        return { success: true, message: 'Login successful!', username };
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    // Get current logged in user
    getCurrentUser() {
        return localStorage.getItem(this.CURRENT_USER_KEY);
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Get user's game data
    getUserGameData(username) {
        const users = this.getAllUsers();
        const user = users[username];
        return user ? user.gameData : null;
    }

    // Save user's game data
    saveUserGameData(username, gameData) {
        const users = this.getAllUsers();
        if (users[username]) {
            users[username].gameData = {
                ...gameData,
                lastSaved: new Date().toISOString()
            };
            this.saveUsers(users);
            return true;
        }
        return false;
    }
}

// Export the auth system
const authSystem = new AuthSystem();
