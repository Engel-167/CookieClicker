// Authentication Module
class AuthSystem {
    constructor() {
        this.CURRENT_USER_KEY = 'cookieClicker_currentUser';
        this.API_BASE_URL = window.location.origin; // Use same origin as the page
    }

    // Sign up a new user
    async signup(username, password) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Login user
    async login(username, password) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                // Set current user in localStorage (for session management)
                localStorage.setItem(this.CURRENT_USER_KEY, username);
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
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
    async getUserGameData(username) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/gamedata/${username}`);
            const data = await response.json();
            
            if (data.success) {
                return data.gameData;
            }
            return null;
        } catch (error) {
            console.error('Get game data error:', error);
            return null;
        }
    }

    // Save user's game data
    async saveUserGameData(username, gameData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/gamedata/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData)
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Save game data error:', error);
            return false;
        }
    }
}

// Export the auth system
const authSystem = new AuthSystem();
