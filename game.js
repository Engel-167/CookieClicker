// Game Logic Module
class CookieGame {
    constructor() {
        this.cookies = 0;
        this.totalClicks = 0;
        this.allTimeCookies = 0;
        this.cookiesPerSecond = 0;
        this.upgrades = {};
        
        // Define available upgrades
        this.upgradeDefinitions = [
            {
                id: 'cursor',
                name: 'Cursor',
                icon: '👆',
                baseCost: 15,
                cps: 0.1,
                description: 'Auto-clicks the cookie'
            },
            {
                id: 'grandma',
                name: 'Grandma',
                icon: '👵',
                baseCost: 100,
                cps: 1,
                description: 'A nice grandma to bake cookies'
            },
            {
                id: 'farm',
                name: 'Farm',
                icon: '🚜',
                baseCost: 1100,
                cps: 8,
                description: 'Grows cookie plants'
            },
            {
                id: 'mine',
                name: 'Mine',
                icon: '⛏️',
                baseCost: 12000,
                cps: 47,
                description: 'Mines cookie dough'
            },
            {
                id: 'factory',
                name: 'Factory',
                icon: '🏭',
                baseCost: 130000,
                cps: 260,
                description: 'Produces cookies en masse'
            },
            {
                id: 'bank',
                name: 'Bank',
                icon: '🏦',
                baseCost: 1400000,
                cps: 1400,
                description: 'Generates cookie assets'
            },
            {
                id: 'temple',
                name: 'Temple',
                icon: '🛕',
                baseCost: 20000000,
                cps: 7800,
                description: 'Summons cookie gods'
            },
            {
                id: 'wizard',
                name: 'Wizard Tower',
                icon: '🧙',
                baseCost: 330000000,
                cps: 44000,
                description: 'Transmutes cookies from thin air'
            }
        ];

        // Initialize upgrades
        this.upgradeDefinitions.forEach(upgrade => {
            this.upgrades[upgrade.id] = 0;
        });

        this.gameInterval = null;
    }

    // Click the cookie
    clickCookie() {
        this.cookies++;
        this.totalClicks++;
        this.allTimeCookies++;
        this.updateDisplay();
        this.saveGame();
    }

    // Calculate cost of next upgrade
    getUpgradeCost(upgradeId) {
        const upgrade = this.upgradeDefinitions.find(u => u.id === upgradeId);
        if (!upgrade) return 0;
        
        const owned = this.upgrades[upgradeId];
        return Math.floor(upgrade.baseCost * Math.pow(1.15, owned));
    }

    // Buy an upgrade
    buyUpgrade(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);
        
        if (this.cookies >= cost) {
            this.cookies -= cost;
            this.upgrades[upgradeId]++;
            this.calculateCPS();
            this.updateDisplay();
            this.saveGame();
            return true;
        }
        return false;
    }

    // Calculate cookies per second
    calculateCPS() {
        let total = 0;
        this.upgradeDefinitions.forEach(upgrade => {
            const owned = this.upgrades[upgrade.id];
            total += owned * upgrade.cps;
        });
        this.cookiesPerSecond = total;
    }

    // Generate cookies per second
    generateCookies() {
        if (this.cookiesPerSecond > 0) {
            const perTick = this.cookiesPerSecond / 10; // 10 ticks per second
            this.cookies += perTick;
            this.allTimeCookies += perTick;
            this.updateDisplay();
        }
    }

    // Start game loop
    startGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        this.gameInterval = setInterval(() => {
            this.generateCookies();
        }, 100); // Update 10 times per second

        // Auto-save every 5 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 5000);
    }

    // Stop game loop
    stopGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Load game from saved data
    loadGame(gameData) {
        if (gameData) {
            this.cookies = gameData.cookies || 0;
            this.totalClicks = gameData.totalClicks || 0;
            this.allTimeCookies = gameData.allTimeCookies || 0;
            this.cookiesPerSecond = gameData.cookiesPerSecond || 0;
            this.upgrades = gameData.upgrades || {};
            
            // Ensure all upgrades exist
            this.upgradeDefinitions.forEach(upgrade => {
                if (this.upgrades[upgrade.id] === undefined) {
                    this.upgrades[upgrade.id] = 0;
                }
            });
            
            this.calculateCPS();
        }
    }

    // Save game
    async saveGame() {
        const username = authSystem.getCurrentUser();
        if (username) {
            const gameData = {
                cookies: this.cookies,
                totalClicks: this.totalClicks,
                allTimeCookies: this.allTimeCookies,
                cookiesPerSecond: this.cookiesPerSecond,
                upgrades: this.upgrades
            };
            await authSystem.saveUserGameData(username, gameData);
        }
    }

    // Format numbers
    formatNumber(num) {
        if (num >= 1000000000000) {
            return (num / 1000000000000).toFixed(2) + 'T';
        } else if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return Math.floor(num).toString();
    }

    // Update display
    updateDisplay() {
        document.getElementById('cookieCount').textContent = this.formatNumber(this.cookies);
        document.getElementById('cookiesPerSecond').textContent = this.formatNumber(this.cookiesPerSecond);
        document.getElementById('totalClicks').textContent = this.formatNumber(this.totalClicks);
        document.getElementById('allTimeCookies').textContent = this.formatNumber(this.allTimeCookies);

        // Update upgrade buttons
        this.upgradeDefinitions.forEach(upgrade => {
            const cost = this.getUpgradeCost(upgrade.id);
            const btn = document.getElementById(`upgrade-${upgrade.id}`);
            if (btn) {
                btn.disabled = this.cookies < cost;
                const item = btn.closest('.upgrade-item');
                if (item) {
                    if (this.cookies >= cost) {
                        item.classList.add('affordable');
                    } else {
                        item.classList.remove('affordable');
                    }
                }
            }
        });
    }

    // Render upgrades
    renderUpgrades() {
        const upgradesList = document.getElementById('upgradesList');
        upgradesList.innerHTML = '';

        this.upgradeDefinitions.forEach(upgrade => {
            const cost = this.getUpgradeCost(upgrade.id);
            const owned = this.upgrades[upgrade.id];

            const upgradeItem = document.createElement('div');
            upgradeItem.className = 'upgrade-item';
            upgradeItem.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">
                        <span>${upgrade.icon}</span>
                        <span>${upgrade.name}</span>
                    </span>
                    <span class="upgrade-count">${owned}</span>
                </div>
                <div class="upgrade-info">
                    ${upgrade.description}<br>
                    <span class="upgrade-cost">Cost: ${this.formatNumber(cost)} cookies</span><br>
                    <small>+${upgrade.cps} CPS each</small>
                </div>
                <button class="upgrade-btn" id="upgrade-${upgrade.id}">Buy</button>
            `;

            upgradesList.appendChild(upgradeItem);

            // Add click listener
            document.getElementById(`upgrade-${upgrade.id}`).addEventListener('click', () => {
                this.buyUpgrade(upgrade.id);
            });
        });
    }
}

// Export game instance
const cookieGame = new CookieGame();
