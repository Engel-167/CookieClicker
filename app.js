// Main Application Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (authSystem.isLoggedIn()) {
            this.showGame();
        } else {
            this.showAuth();
        }

        // Set up event listeners
        this.setupAuthListeners();
        this.setupGameListeners();
    }

    setupAuthListeners() {
        // Toggle between login and signup forms
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('signupForm').classList.remove('hidden');
            this.clearMessages();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signupForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            this.clearMessages();
        });

        // Login form submission
        document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            this.showMessage('loginMessage', 'Logging in...', 'success');
            
            const result = await authSystem.login(username, password);
            this.showMessage('loginMessage', result.message, result.success ? 'success' : 'error');

            if (result.success) {
                setTimeout(() => {
                    this.showGame();
                }, 500);
            }
        });

        // Signup form submission
        document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPassword) {
                this.showMessage('signupMessage', 'Passwords do not match', 'error');
                return;
            }

            this.showMessage('signupMessage', 'Creating account...', 'success');

            const result = await authSystem.signup(username, password);
            this.showMessage('signupMessage', result.message, result.success ? 'success' : 'error');

            if (result.success) {
                // Auto-login after signup
                const loginResult = await authSystem.login(username, password);
                if (loginResult.success) {
                    setTimeout(() => {
                        this.showGame();
                    }, 500);
                } else {
                    this.showMessage('signupMessage', 'Account created! Please login.', 'success');
                    document.getElementById('signupForm').classList.add('hidden');
                    document.getElementById('loginForm').classList.remove('hidden');
                }
            }
        });
    }

    setupGameListeners() {
        // Cookie click
        document.getElementById('cookieButton').addEventListener('click', () => {
            cookieGame.clickCookie();
            this.animateCookie();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout? Your progress is saved.')) {
                cookieGame.saveGame();
                cookieGame.stopGame();
                authSystem.logout();
                this.showAuth();
                this.resetForms();
            }
        });
    }

    showAuth() {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
    }

    async showGame() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');

        const username = authSystem.getCurrentUser();
        document.getElementById('currentUser').textContent = `Welcome, ${username}!`;

        // Load game data
        const gameData = await authSystem.getUserGameData(username);
        cookieGame.loadGame(gameData);
        cookieGame.renderUpgrades();
        cookieGame.updateDisplay();
        cookieGame.startGame();
    }

    showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
    }

    clearMessages() {
        document.getElementById('loginMessage').style.display = 'none';
        document.getElementById('signupMessage').style.display = 'none';
    }

    resetForms() {
        document.getElementById('loginFormElement').reset();
        document.getElementById('signupFormElement').reset();
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        this.clearMessages();
    }

    animateCookie() {
        const cookieButton = document.getElementById('cookieButton');
        cookieButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cookieButton.style.transform = '';
        }, 100);
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
