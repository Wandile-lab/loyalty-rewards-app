// Constants
const SUPABASE_URL = 'https://pyelaubchzxijagpwwbe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZWxhdWJjaHp4aWphZ3B3d2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTkwMjEsImV4cCI6MjA2Mzc3NTAyMX0.1kWmM26z2ozaadDjJSDSwh6g4y2dbNF9ZQoxECpXZes';
const MAX_VISITS = 5;
const SERVICE_DISPLAY_NAMES = {
  'haircut': 'Hair Cut',
  'facial': 'Facial Treatment',
  'massage': 'Massage Therapy',
  'manicure': 'Manicure/Pedicure',
  'styling': 'Hair Styling',
  'treatment': 'Special Treatment'
};

// App state
let supabaseClient = null;
let currentUser = null;
let userVisits = 0;
let audioContext = null;
let audioNodes = {
  oscillator: null,
  gainNode: null
};

// DOM Elements cache
const elements = {
  authSection: null,
  dashboardSection: null,
  loginForm: null,
  signupForm: null,
  showSignupBtn: null,
  showLoginBtn: null,
  logoutBtn: null,
  checkinBtn: null,
  serviceType: null,
  checkinMessage: null,
  welcomeMessage: null,
  currentPoints: null,
  visitsLeft: null,
  progressFill: null,
  visitList: null,
  freeServiceCard: null,
  changingWord: null,
  messageEl: null
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('FreshPoint app loading...');
  
  try {
    await initializeDOMElements();
    await initializeSupabase();
    await initializeAppState();
    setupEventListeners();
    console.log('FreshPoint app loaded successfully!');
  } catch (error) {
    console.error('App initialization failed:', error);
    showFatalError();
  }
});

// Initialize all DOM elements
async function initializeDOMElements() {
  elements.authSection = document.getElementById('auth-section');
  elements.dashboardSection = document.getElementById('dashboard-section');
  elements.loginForm = document.getElementById('loginForm');
  elements.signupForm = document.getElementById('signupForm');
  elements.showSignupBtn = document.getElementById('showSignup');
  elements.showLoginBtn = document.getElementById('showLogin');
  elements.logoutBtn = document.getElementById('logoutBtn');
  elements.checkinBtn = document.getElementById('checkinBtn');
  elements.serviceType = document.getElementById('serviceType');
  elements.checkinMessage = document.getElementById('checkinMessage');
  elements.welcomeMessage = document.getElementById('welcomeMessage');
  elements.currentPoints = document.getElementById('currentPoints');
  elements.visitsLeft = document.getElementById('visitsLeft');
  elements.progressFill = document.getElementById('progressFill');
  elements.visitList = document.getElementById('visitList');
  elements.freeServiceCard = document.getElementById('freeServiceCard');
  elements.changingWord = document.getElementById('changing-word');
  elements.messageEl = document.getElementById('message');
}

// Show fatal error message
function showFatalError() {
  if (elements.authSection) elements.authSection.innerHTML = `
    <div class="error-container">
      <h2>Application Error</h2>
      <p>We're sorry, the app failed to load. Please try refreshing the page.</p>
      <button onclick="window.location.reload()">Refresh Page</button>
    </div>
  `;
}

// Initialize Supabase
async function initializeSupabase() {
  try {
    if (!window.supabase) {
      throw new Error('Supabase client library not loaded');
    }
    
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized successfully');
  } catch (error) {
    console.error('Supabase initialization failed:', error);
    throw error;
  }
}

// Initialize audio context
function initAudio() {
  try {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return false;
      }
      
      audioContext = new AudioContext();
      audioNodes.gainNode = audioContext.createGain();
      audioNodes.oscillator = audioContext.createOscillator();
      
      audioNodes.oscillator.connect(audioNodes.gainNode);
      audioNodes.gainNode.connect(audioContext.destination);
      
      console.log('Audio initialized successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.warn('Audio initialization failed:', error);
    return false;
  }
}

// Play blop sound
async function playBlop() {
  if (!audioContext || !audioNodes.oscillator || !audioNodes.gainNode) {
    if (!initAudio()) return;
  }

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    audioNodes.oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    audioNodes.oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
    
    audioNodes.gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    audioNodes.gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    audioNodes.oscillator.start(audioContext.currentTime);
    audioNodes.oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

// Love animation
function playLoveAnimation() {
  if (!elements.messageEl || !elements.changingWord) return;
  
  elements.messageEl.classList.add('show');
  
  setTimeout(() => {
    elements.changingWord.classList.add('fade');
    setTimeout(() => {
      elements.changingWord.textContent = "❤️";
      elements.changingWord.classList.remove('fade');
      
      playBlop();
      
      setTimeout(() => {
        elements.messageEl.classList.remove('show');
        setTimeout(() => {
          elements.changingWord.classList.add('fade');
          setTimeout(() => {
            elements.changingWord.textContent = "love";
            elements.changingWord.classList.remove('fade');
          }, 300);
        }, 500);
      }, 2000);
    }, 600);
  }, 1000);
}

// Setup event listeners
function setupEventListeners() {
  // Auth form toggles
  if (elements.showSignupBtn) {
    elements.showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.loginForm.classList.add('hidden');
      elements.signupForm.classList.remove('hidden');
    });
  }

  if (elements.showLoginBtn) {
    elements.showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.signupForm.classList.add('hidden');
      elements.loginForm.classList.remove('hidden');
    });
  }

  // Form submissions
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', handleLogin);
  }

  if (elements.signupForm) {
    elements.signupForm.addEventListener('submit', handleSignup);
  }

  // Dashboard actions
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', handleLogout);
  }

  if (elements.checkinBtn) {
    elements.checkinBtn.addEventListener('click', handleCheckin);
  }

  // Modal and service buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
      const successModal = document.getElementById('successModal');
      if (successModal) successModal.classList.add('hidden');
    }

    if (e.target.classList.contains('free-service-btn')) {
      handleFreeService(e);
    }
  });
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  if (!supabaseClient) return showMessage('System not ready. Please try again.', 'error');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  if (!validateEmail(email)) {
    return showMessage('Please enter a valid email address', 'error');
  }

  if (!validatePassword(password)) {
    return showMessage('Password must be at least 6 characters', 'error');
  }
  
  try {
    showMessage('Logging in...', 'info');
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user data from profiles table
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    currentUser = {
      id: data.user.id,
      email: data.user.email,
      name: userData.name,
      preferredService: userData.preferred_service,
      visits: userData.visits
    };
    
    userVisits = userData.visits;
    showDashboard();
    showMessage('Login successful!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    showMessage(error.message || 'Login failed. Please try again.', 'error');
  }
}

// Handle signup
async function handleSignup(e) {
  e.preventDefault();
  if (!supabaseClient) return showMessage('System not ready. Please try again.', 'error');

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const preferredService = document.getElementById('preferredService').value;
  
  if (!validateEmail(email)) {
    return showMessage('Please enter a valid email address', 'error');
  }

  if (!validatePassword(password)) {
    return showMessage('Password must be at least 6 characters', 'error');
  }

  if (!name) {
    return showMessage('Please enter your name', 'error');
  }
  
  try {
    showMessage('Creating account...', 'info');
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // 2. Create user profile
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name,
        preferred_service: preferredService,
        visits: 0
      }])
      .select();

    if (userError) throw userError;

    currentUser = {
      id: authData.user.id,
      email,
      name,
      preferredService,
      visits: 0
    };
    
    userVisits = 0;
    showDashboard();
    e.target.reset();
    showMessage('Account created successfully!', 'success');
  } catch (error) {
    console.error('Signup error:', error);
    showMessage(error.message || 'Signup failed. Please try again.', 'error');
  }
}

// Show dashboard
function showDashboard() {
  if (!elements.authSection || !elements.dashboardSection) return;
  
  elements.authSection.classList.add('hidden');
  elements.dashboardSection.classList.remove('hidden');
  
  if (elements.welcomeMessage) {
    elements.welcomeMessage.textContent = currentUser.name 
      ? `Hey ${currentUser.name}, Welcome to FreshPoint!`
      : `Hey ${currentUser.email.split('@')[0]}, Welcome to FreshPoint!`;
  }
  
  updateRewardsDisplay();
  loadVisitHistory();
}

// Handle logout
async function handleLogout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    currentUser = null;
    userVisits = 0;
    
    if (elements.dashboardSection) elements.dashboardSection.classList.add('hidden');
    if (elements.authSection) elements.authSection.classList.remove('hidden');
    if (elements.loginForm) elements.loginForm.classList.remove('hidden');
    if (elements.signupForm) elements.signupForm.classList.add('hidden');
    
    document.getElementById('loginForm')?.reset();
    document.getElementById('signupForm')?.reset();
  } catch (error) {
    console.error('Logout error:', error);
    showMessage(error.message, 'error');
  }
}

// Handle check-in
async function handleCheckin() {
  if (!supabaseClient || !currentUser || !elements.serviceType) return;
  
  const service = elements.serviceType.value;
  
  if (!service) {
    return showMessage('Please select a service type', 'error');
  }

  try {
    showMessage('Processing check-in...', 'info');
    
    // 1. Record the visit
    const { error: visitError } = await supabaseClient
      .from('visits')
      .insert([{
        user_id: currentUser.id,
        service_type: service
      }]);

    if (visitError) throw visitError;

    // 2. Increment visit count
    const { data, error: updateError } = await supabaseClient
      .from('users')
      .update({ visits: userVisits + 1 })
      .eq('id', currentUser.id)
      .select();

    if (updateError) throw updateError;

    userVisits = data[0].visits;
    updateRewardsDisplay();
    
    // Only play effects after successful checkin
    playLoveAnimation();
    showMessage(`Checked in for ${getServiceDisplayName(service)}! Thanks for visiting FreshPoint!`, 'success');
    elements.serviceType.value = '';
    
    if (userVisits >= MAX_VISITS && elements.freeServiceCard) {
      setTimeout(() => {
        elements.freeServiceCard.classList.remove('hidden');
      }, 2000);
    }
  } catch (error) {
    console.error('Checkin error:', error);
    showMessage(error.message || 'Check-in failed. Please try again.', 'error');
  }
}

// Handle free service
async function handleFreeService(e) {
  if (!supabaseClient || !currentUser) return;
  
  const service = e.target.dataset.service;
  const serviceName = e.target.textContent.replace('Free ', '');
  
  try {
    showMessage('Processing your free service...', 'info');
    
    // Reset visit count
    const { error } = await supabaseClient
      .from('users')
      .update({ visits: 0 })
      .eq('id', currentUser.id);

    if (error) throw error;

    userVisits = 0;
    updateRewardsDisplay();
    
    if (elements.visitList) {
      elements.visitList.innerHTML = '<p class="no-visits">No visits yet. Check in to start earning rewards!</p>';
    }
    
    showMessage(`Congratulations! Your free ${serviceName} has been booked!`, 'success');
    
    if (elements.freeServiceCard) {
      elements.freeServiceCard.classList.add('hidden');
    }
  } catch (error) {
    console.error('Free service error:', error);
    showMessage(error.message || 'Failed to process free service. Please try again.', 'error');
  }
}

// Update rewards display
function updateRewardsDisplay() {
  if (!elements.currentPoints || !elements.visitsLeft || !elements.progressFill) return;
  
  elements.currentPoints.textContent = userVisits * 20;
  
  const progressPercentage = (userVisits / MAX_VISITS) * 100;
  elements.progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
  
  const progressTextElement = elements.visitsLeft.parentElement;
  if (progressTextElement) {
    progressTextElement.innerHTML = userVisits >= MAX_VISITS
      ? '<strong style="color: #28a745;">🎉 You\'ve earned a free service! 🎉</strong>'
      : `<span id="visitsLeft">${MAX_VISITS - userVisits}</span> visits left for your free service!`;
  }
}

// Show message
function showMessage(text, type) {
  if (!elements.checkinMessage) return;
  
  elements.checkinMessage.textContent = text;
  elements.checkinMessage.className = `message ${type}`;
  
  setTimeout(() => {
    if (elements.checkinMessage) {
      elements.checkinMessage.textContent = '';
      elements.checkinMessage.className = 'message';
    }
  }, 5000);
}

// Load visit history
async function loadVisitHistory() {
  if (!supabaseClient || !currentUser || !elements.visitList) return;
  
  try {
    const { data: visits, error } = await supabaseClient
      .from('visits')
      .select('service_type, created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    elements.visitList.innerHTML = '';

    if (!visits.length) {
      elements.visitList.innerHTML = '<p class="no-visits">No visits yet. Check in to start earning rewards!</p>';
      return;
    }
    
    visits.forEach(visit => {
      const visitItem = document.createElement('div');
      visitItem.className = 'visit-item';
      
      const serviceName = document.createElement('strong');
      serviceName.textContent = getServiceDisplayName(visit.service_type);
      
      const visitDate = document.createElement('small');
      visitDate.textContent = `${new Date(visit.created_at).toLocaleDateString()} at ${
        new Date(visit.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }`;
      
      visitItem.appendChild(serviceName);
      visitItem.appendChild(document.createElement('br'));
      visitItem.appendChild(visitDate);
      elements.visitList.appendChild(visitItem);
    });
  } catch (error) {
    console.error('Error loading visit history:', error);
    elements.visitList.innerHTML = '<p class="error">Failed to load visit history</p>';
  }
}

// Initialize app state
async function initializeAppState() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error || !session) return;

    // Get user profile data
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;

    currentUser = {
      id: session.user.id,
      email: session.user.email,
      name: userData.name,
      preferredService: userData.preferred_service,
      visits: userData.visits
    };
    
    userVisits = userData.visits;
    showDashboard();
  } catch (error) {
    console.error('Initialization error:', error);
    // Don't prevent app from loading if session load fails
  }
}

// Helper functions
function getServiceDisplayName(service) {
  return SERVICE_DISPLAY_NAMES[service] || service;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Export for debugging
window.FreshPointApp = {
  initAudio,
  playLoveAnimation,
  handleLogin,
  handleSignup,
  handleLogout,
  handleCheckin,
  showMessage,
  updateRewardsDisplay,
  get currentUser() { return currentUser; }
};