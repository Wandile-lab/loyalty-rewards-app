// FreshPoint Loyalty System - JavaScript Application

class FreshPointApp {
    constructor() {
        this.users = new Map(); // Store user data in memory
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
    }

    bindEvents() {
        // Form switching
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Dashboard actions
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('checkinBtn').addEventListener('click', () => {
            this.handleCheckin();
        });

        // Free service buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('free-service-btn')) {
                this.redeemFreeService(e.target.dataset.service);
            }
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.closeModal();
            }
        });
    }

    showSignupForm() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    }

    showLoginForm() {
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const preferredService = document.getElementById('preferredService').value;

        if (!name || !email || !password || !preferredService) {
            this.showMessage('Please fill in all fields', 'error', 'checkinMessage');
            return;
        }

        if (this.users.has(email)) {
            this.showMessage('User already exists. Please login instead.', 'error', 'checkinMessage');
            return;
        }

        // Create new user
        const userData = {
            name: name,
            email: email,
            password: password, // In real app, this should be hashed
            preferredService: preferredService,
            points: 0,
            visits: [],
            joinDate: new Date().toISOString(),
            freeServicesAvailable: 0
        };

        this.users.set(email, userData);
        this.currentUser = userData;

        this.showModal('Account Created!', `Welcome ${name}! Your FreshPoint account has been created successfully.`);
        
        setTimeout(() => {
            this.closeModal();
            this.showDashboard();
        }, 2000);
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error', 'checkinMessage');
            return;
        }

        const userData = this.users.get(email);
        if (!userData || userData.password !== password) {
            this.showMessage('Invalid email or password', 'error', 'checkinMessage');
            return;
        }

        this.currentUser = userData;
        this.showDashboard();
    }

    handleLogout() {
        this.currentUser = null;
        this.showAuthSection();
        this.clearForms();
    }

    handleCheckin() {
        const serviceType = document.getElementById('serviceType').value;
        
        if (!serviceType) {
            this.showMessage('Please select a service type', 'error', 'checkinMessage');
            return;
        }

        if (!this.currentUser) {
            this.showMessage('Please login first', 'error', 'checkinMessage');
            return;
        }

        // Add visit to user's history
        const visit = {
            service: this.getServiceName(serviceType),
            date: new Date().toLocaleString(),
            points: 1
        };

        this.currentUser.visits.push(visit);
        this.currentUser.points += 1;

        // Check if user earned a free service
        if (this.currentUser.points % 5 === 0) {
            this.currentUser.freeServicesAvailable += 1;
            this.showModal('Congratulations! 🎉', `You've earned a free service! You now have ${this.currentUser.freeServicesAvailable} free service(s) available.`);
        } else {
            this.showMessage(`Check-in successful! You earned 1 point for your ${visit.service}.`, 'success', 'checkinMessage');
        }

        // Reset service selection
        document.getElementById('serviceType').value = '';
        
        // Update dashboard
        this.updateDashboard();

        // Clear message after 5 seconds
        setTimeout(() => {
            this.clearMessage('checkinMessage');
        }, 5000);
    }

    redeemFreeService(serviceType) {
        if (this.currentUser.freeServicesAvailable <= 0) {
            this.showMessage('No free services available', 'error', 'checkinMessage');
            return;
        }

        this.currentUser.freeServicesAvailable -= 1;
        
        const serviceName = this.getServiceName(serviceType);
        this.showModal('Service Redeemed! 🎊', `Your free ${serviceName} has been redeemed! Please visit our location to enjoy your complimentary service.`);
        
        // Add redeemed service to history
        const redemption = {
            service: `FREE ${serviceName}`,
            date: new Date().toLocaleString(),
            points: 0
        };
        this.currentUser.visits.push(redemption);
        
        this.updateDashboard();
    }

    showDashboard() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        
        this.updateWelcomeMessage();
        this.updateDashboard();
    }

    showAuthSection() {
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('auth-section').classList.remove('hidden');
    }

    updateWelcomeMessage() {
        const welcomeElement = document.getElementById('welcomeMessage');
        welcomeElement.textContent = `Hey ${this.currentUser.name}, Welcome to FreshPoint!`;
    }

    updateDashboard() {
        this.updatePointsDisplay();
        this.updateProgressBar();
        this.updateVisitHistory();
        this.updateFreeServiceCard();
    }

    updatePointsDisplay() {
        document.getElementById('currentPoints').textContent = this.currentUser.points;
    }

    updateProgressBar() {
        const visitsUntilReward = 5 - (this.currentUser.points % 5);
        const progress = ((this.currentUser.points % 5) / 5) * 100;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('visitsLeft').textContent = visitsUntilReward === 5 ? 5 : visitsUntilReward;
    }

    updateVisitHistory() {
        const visitList = document.getElementById('visitList');
        
        if (this.currentUser.visits.length === 0) {
            visitList.innerHTML = '<p class="no-visits">No visits yet. Check in to start earning rewards!</p>';
            return;
        }

        const recentVisits = this.currentUser.visits.slice(-5).reverse();
        visitList.innerHTML = recentVisits.map(visit => `
            <div class="visit-item">
                <div class="service">${visit.service}</div>
                <div class="date">${visit.date}</div>
            </div>
        `).join('');
    }

    updateFreeServiceCard() {
        const freeServiceCard = document.getElementById('freeServiceCard');
        
        if (this.currentUser.freeServicesAvailable > 0) {
            freeServiceCard.classList.remove('hidden');
            freeServiceCard.querySelector('p').textContent = 
                `You have ${this.currentUser.freeServicesAvailable} free service${this.currentUser.freeServicesAvailable > 1 ? 's' : ''} available!`;
        } else {
            freeServiceCard.classList.add('hidden');
        }
    }

    getServiceName(serviceType) {
        const serviceNames = {
            'haircut': 'Hair Cut',
            'facial': 'Facial Treatment',
            'massage': 'Massage Therapy',
            'manicure': 'Manicure/Pedicure',
            'styling': 'Hair Styling',
            'treatment': 'Special Treatment'
        };
        return serviceNames[serviceType] || serviceType;
    }

    showMessage(message, type, elementId) {
        const messageElement = document.getElementById(elementId);
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
    }

    clearMessage(elementId) {
        const messageElement = document.getElementById(elementId);
        messageElement.textContent = '';
        messageElement.className = 'message';
        messageElement.style.display = 'none';
    }

    showModal(title, message) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('successModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('successModal').classList.add('hidden');
    }

    clearForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        document.getElementById('serviceType').value = '';
        this.clearMessage('checkinMessage');
    }

    checkExistingSession() {
        // In a real application, you might check for saved session data
        // For demo purposes, we'll start fresh each time
        this.showAuthSection();
    }

    // Demo data for testing
    loadDemoData() {
        // Create a demo user for testing
        const demoUser = {
            name: 'John Doe',
            email: 'demo@freshpoint.com',
            password: 'demo123',
            preferredService: 'haircut',
            points: 3,
            visits: [
                {
                    service: 'Hair Cut',
                    date: new Date(Date.now() - 86400000 * 3).toLocaleString(),
                    points: 1
                },
                {
                    service: 'Facial Treatment',
                    date: new Date(Date.now() - 86400000 * 2).toLocaleString(),
                    points: 1
                },
                {
                    service: 'Massage Therapy',
                    date: new Date(Date.now() - 86400000).toLocaleString(),
                    points: 1
                }
            ],
            joinDate: new Date(Date.now() - 86400000 * 7).toISOString(),
            freeServicesAvailable: 0
        };

        this.users.set('demo@freshpoint.com', demoUser);
    }

    // Utility method to format dates nicely
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Add some animations for better UX
    animatePoints() {
        const pointsElement = document.getElementById('currentPoints');
        pointsElement.style.transform = 'scale(1.2)';
        pointsElement.style.color = '#28a745';
        
        setTimeout(() => {
            pointsElement.style.transform = 'scale(1)';
            pointsElement.style.color = '';
        }, 300);
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Enhanced signup validation
    validateSignupForm(name, email, password, preferredService) {
        const errors = [];

        if (name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!this.isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (!preferredService) {
            errors.push('Please select a preferred service');
        }

        return errors;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FreshPointApp();
    
    // Load demo data for testing (remove in production)
    app.loadDemoData();
    
    // Add some helpful tips in console
    console.log('🌟 FreshPoint Loyalty System Loaded!');
    console.log('💡 Demo login: demo@freshpoint.com / demo123');
    console.log('🎯 Try creating a new account or use the demo account');
});

// Add some global utility functions
window.FreshPointUtils = {
    // Format currency (if needed for future features)
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Generate random promotional codes (for future features)
    generatePromoCode: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'FP';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Calculate loyalty tier (for future features)
    calculateTier: (points) => {
        if (points >= 50) return 'Platinum';
        if (points >= 25) return 'Gold';
        if (points >= 10) return 'Silver';
        return 'Bronze';
    }
};