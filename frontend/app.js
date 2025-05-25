// Initialize audio context for sound effects
let audioContext;
let blop;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        blop = {
            play: () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        };
    }
}

// Simple love animation function
function playLoveAnimation() {
    const messageEl = document.getElementById('message');
    const changingWord = document.getElementById('changing-word');
    
    if (!messageEl || !changingWord) return;
    
    // Show the message
    messageEl.classList.add('show');
    
    // Animate the word change
    setTimeout(() => {
        changingWord.classList.add('fade');
        setTimeout(() => {
            changingWord.textContent = "❤️";
            changingWord.classList.remove('fade');
            
            // Play sound effect
            if (blop && blop.play) {
                blop.play();
            }
            
            // Hide message after animation
            setTimeout(() => {
                messageEl.classList.remove('show');
                // Reset the word back to "love"
                setTimeout(() => {
                    changingWord.classList.add('fade');
                    setTimeout(() => {
                        changingWord.textContent = "love";
                        changingWord.classList.remove('fade');
                    }, 300);
                }, 500);
            }, 2000);
        }, 600);
    }, 1000);
}

// App state
let currentUser = null;
let userVisits = 0;
const maxVisits = 5;

// DOM elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const checkinBtn = document.getElementById('checkinBtn');
const serviceType = document.getElementById('serviceType');
const checkinMessage = document.getElementById('checkinMessage');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('FreshPoint app loaded successfully!');
    setupEventListeners();
    initializeElementRefs();
});

// Initialize element references for animation
function initializeElementRefs() {
    // Simple animation doesn't need specific letter elements
    console.log('Animation elements initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Switch between login and signup forms
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // Login form submission
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', handleLogin);
    }

    // Signup form submission
    const signupFormEl = document.getElementById('signupForm');
    if (signupFormEl) {
        signupFormEl.addEventListener('submit', handleSignup);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Check-in button
    if (checkinBtn) {
        checkinBtn.addEventListener('click', handleCheckin);
    }

    // Modal close functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-modal')) {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.classList.add('hidden');
            }
        }
    });

    // Free service buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('free-service-btn')) {
            handleFreeService(e);
        }
    });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    const emailEl = document.getElementById('loginEmail');
    const passwordEl = document.getElementById('loginPassword');
    
    if (!emailEl || !passwordEl) return;
    
    const email = emailEl.value;
    const password = passwordEl.value;
    
    // Simple validation (in real app, this would connect to backend)
    if (email && password) {
        currentUser = { 
            email, 
            visits: getUserVisits(email) || 0 
        };
        userVisits = currentUser.visits;
        showDashboard();
    } else {
        showMessage('Please fill in all fields', 'error');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    const nameEl = document.getElementById('signupName');
    const emailEl = document.getElementById('signupEmail');
    const passwordEl = document.getElementById('signupPassword');
    const preferredServiceEl = document.getElementById('preferredService');
    
    if (!nameEl || !emailEl || !passwordEl || !preferredServiceEl) return;
    
    const name = nameEl.value;
    const email = emailEl.value;
    const password = passwordEl.value;
    const preferredService = preferredServiceEl.value;
    
    if (name && email && password && preferredService) {
        currentUser = { 
            name, 
            email, 
            preferredService,
            visits: 0 
        };
        userVisits = 0;
        saveUserData();
        showDashboard();
    } else {
        showMessage('Please fill in all fields', 'error');
    }
}

// Show dashboard
function showDashboard() {
    if (authSection) authSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
        if (currentUser.name) {
            welcomeMsg.textContent = `Hey ${currentUser.name}, Welcome to FreshPoint!`;
        } else {
            welcomeMsg.textContent = `Hey ${currentUser.email.split('@')[0]}, Welcome to FreshPoint!`;
        }
    }
    
    updateRewardsDisplay();
    loadVisitHistory();
}

// Handle logout
function handleLogout() {
    // Save current user data before logout
    if (currentUser) {
        saveUserVisits(currentUser.email, userVisits);
    }
    
    currentUser = null;
    userVisits = 0;
    
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (authSection) authSection.classList.remove('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    
    // Clear form fields
    const loginFormEl = document.getElementById('loginForm');
    const signupFormEl = document.getElementById('signupForm');
    if (loginFormEl) loginFormEl.reset();
    if (signupFormEl) signupFormEl.reset();
}

// Handle check-in functionality
function handleCheckin() {
    if (!serviceType) return;
    
    const service = serviceType.value;
    
    if (!service) {
        showMessage('Please select a service type', 'error');
        return;
    }

    // Initialize audio on user interaction
    initAudio();
    
    // Show love animation
    playLoveAnimation();
    
    // Update visits
    userVisits++;
    addVisit(service);
    updateRewardsDisplay();
    
    // Save user data
    if (currentUser) {
        saveUserVisits(currentUser.email, userVisits);
    }
    
    showMessage(`Checked in for ${getServiceDisplayName(service)}! Thanks for visiting FreshPoint!`, 'success');
    
    // Reset service selection
    serviceType.value = '';
    
    // Check if earned free service
    if (userVisits >= maxVisits) {
        setTimeout(() => {
            const freeServiceCard = document.getElementById('freeServiceCard');
            if (freeServiceCard) {
                freeServiceCard.classList.remove('hidden');
            }
        }, 2000);
    }
}

// Handle free service selection
function handleFreeService(e) {
    const service = e.target.dataset.service;
    const serviceName = e.target.textContent.replace('Free ', '');
    
    showMessage(`Congratulations! Your free ${serviceName} has been booked!`, 'success');
    
    const freeServiceCard = document.getElementById('freeServiceCard');
    if (freeServiceCard) {
        freeServiceCard.classList.add('hidden');
    }
    
    // Reset visits after claiming free service
    userVisits = 0;
    updateRewardsDisplay();
    
    // Save updated visit count
    if (currentUser) {
        saveUserVisits(currentUser.email, userVisits);
    }
    
    // Clear visit history
    const visitList = document.getElementById('visitList');
    if (visitList) {
        visitList.innerHTML = '<p class="no-visits">No visits yet. Check in to start earning rewards!</p>';
    }
    
    // Clear stored visit history
    if (currentUser) {
        const visitKey = `freshpoint_visits_${currentUser.email}`;
        localStorage.removeItem(visitKey);
    }
}

// Add visit to history
function addVisit(service) {
    const visitList = document.getElementById('visitList');
    if (!visitList) return;
    
    const noVisits = visitList.querySelector('.no-visits');
    if (noVisits) {
        noVisits.remove();
    }
    
    const visitItem = document.createElement('div');
    visitItem.className = 'visit-item';
    visitItem.innerHTML = `
        <strong>${getServiceDisplayName(service)}</strong>
        <br>
        <small>${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
    `;
    
    visitList.insertBefore(visitItem, visitList.firstChild);
    
    // Save visit to local storage
    saveVisitToHistory(service);
}

// Get display name for service
function getServiceDisplayName(service) {
    const serviceNames = {
        'haircut': 'Hair Cut',
        'facial': 'Facial Treatment',
        'massage': 'Massage Therapy',
        'manicure': 'Manicure/Pedicure',
        'styling': 'Hair Styling',
        'treatment': 'Special Treatment'
    };
    return serviceNames[service] || service;
}

// Update rewards display
function updateRewardsDisplay() {
    const currentPointsEl = document.getElementById('currentPoints');
    const visitsLeftEl = document.getElementById('visitsLeft');
    const progressFillEl = document.getElementById('progressFill');
    
    if (currentPointsEl) {
        currentPointsEl.textContent = userVisits * 20;
    }
    
    if (visitsLeftEl) {
        visitsLeftEl.textContent = Math.max(0, maxVisits - userVisits);
    }
    
    const progressPercentage = (userVisits / maxVisits) * 100;
    if (progressFillEl) {
        progressFillEl.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
    
    // Update progress text
    if (visitsLeftEl) {
        const progressTextElement = visitsLeftEl.parentElement;
        
        if (userVisits >= maxVisits) {
            progressTextElement.innerHTML = '<strong style="color: #28a745;">🎉 You\'ve earned a free service! 🎉</strong>';
        } else {
            progressTextElement.innerHTML = `<span id="visitsLeft">${maxVisits - userVisits}</span> visits left for your free service!`;
        }
    }
}

// Show message
function showMessage(text, type) {
    if (!checkinMessage) return;
    
    checkinMessage.textContent = text;
    checkinMessage.className = `message ${type}`;
    
    setTimeout(() => {
        checkinMessage.textContent = '';
        checkinMessage.className = 'message';
    }, 5000);
}

// Load visit history from storage
function loadVisitHistory() {
    if (!currentUser) return;
    
    const visitKey = `freshpoint_visits_${currentUser.email}`;
    const visits = JSON.parse(localStorage.getItem(visitKey) || '[]');
    const visitList = document.getElementById('visitList');
    
    if (!visitList) return;
    
    if (visits.length === 0) {
        visitList.innerHTML = '<p class="no-visits">No visits yet. Check in to start earning rewards!</p>';
        return;
    }
    
    visitList.innerHTML = '';
    visits.forEach(visit => {
        const visitItem = document.createElement('div');
        visitItem.className = 'visit-item';
        visitItem.innerHTML = `
            <strong>${getServiceDisplayName(visit.service)}</strong>
            <br>
            <small>${new Date(visit.timestamp).toLocaleDateString()} at ${new Date(visit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        `;
        visitList.appendChild(visitItem);
    });
}

// Local Storage Functions (for demo purposes - in real app use proper backend)
function saveUserData() {
    if (currentUser) {
        const userData = {
            name: currentUser.name,
            email: currentUser.email,
            preferredService: currentUser.preferredService,
            visits: userVisits
        };
        localStorage.setItem(`freshpoint_user_${currentUser.email}`, JSON.stringify(userData));
    }
}

function saveUserVisits(email, visits) {
    const existingData = localStorage.getItem(`freshpoint_user_${email}`);
    if (existingData) {
        const userData = JSON.parse(existingData);
        userData.visits = visits;
        localStorage.setItem(`freshpoint_user_${email}`, JSON.stringify(userData));
    }
}

function getUserVisits(email) {
    const userData = localStorage.getItem(`freshpoint_user_${email}`);
    if (userData) {
        return JSON.parse(userData).visits || 0;
    }
    return 0;
}

function saveVisitToHistory(service) {
    if (!currentUser) return;
    
    const visitKey = `freshpoint_visits_${currentUser.email}`;
    const existingVisits = JSON.parse(localStorage.getItem(visitKey) || '[]');
    
    const newVisit = {
        service: service,
        timestamp: Date.now(),
        date: new Date().toISOString()
    };
    
    existingVisits.unshift(newVisit); // Add to beginning of array
    
    // Keep only last 20 visits
    if (existingVisits.length > 20) {
        existingVisits.splice(20);
    }
    
    localStorage.setItem(visitKey, JSON.stringify(existingVisits));
}

// Utility function to format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Error handling wrapper for localStorage operations
function safeLocalStorageOperation(operation) {
    try {
        return operation();
    } catch (error) {
        console.warn('LocalStorage operation failed:', error);
        return null;
    }
}

// Initialize app state from localStorage on page load
function initializeAppState() {
    // Check if user was previously logged in (for demo purposes)
    const lastUser = localStorage.getItem('freshpoint_last_user');
    if (lastUser) {
        const userData = JSON.parse(localStorage.getItem(`freshpoint_user_${lastUser}`));
        if (userData) {
            currentUser = userData;
            userVisits = userData.visits || 0;
            showDashboard();
        }
    }
}

// Export functions for potential use in other scripts
window.FreshPointApp = {
    initAudio,
    playLoveAnimation,
    handleLogin,
    handleSignup,
    handleLogout,
    handleCheckin,
    showMessage,
    updateRewardsDisplay
};