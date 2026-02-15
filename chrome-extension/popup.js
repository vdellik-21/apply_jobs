// JobFill AI - Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const fillBtn = document.getElementById('fillBtn');
  const fillBtnText = document.getElementById('fillBtnText');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const enableToggle = document.getElementById('enableToggle');
  const stealthToggle = document.getElementById('stealthToggle');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const resultMessage = document.getElementById('resultMessage');
  const fieldsFilledToday = document.getElementById('fieldsFilledToday');
  const appsFilledToday = document.getElementById('appsFilledToday');
  
  // Load settings
  chrome.storage.local.get(['settings', 'stats'], (result) => {
    const settings = result.settings || {};
    const stats = result.stats || { fieldsToday: 0, appsToday: 0 };
    
    // Update toggles
    if (settings.enabled === false) {
      enableToggle.classList.remove('active');
      statusDot.classList.add('inactive');
      statusText.textContent = 'Extension Disabled';
    }
    
    if (settings.random_delays === false) {
      stealthToggle.classList.remove('active');
    }
    
    // Update stats
    fieldsFilledToday.textContent = stats.fieldsToday || 0;
    appsFilledToday.textContent = stats.appsToday || 0;
  });
  
  // Fill button click
  fillBtn.addEventListener('click', () => {
    fillBtn.disabled = true;
    fillBtnText.textContent = 'Filling...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        showResult('No active tab found', true);
        resetButton();
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'fillNow' }, (response) => {
        if (chrome.runtime.lastError) {
          showResult('Extension not active on this page. Navigate to a job application.', true);
          resetButton();
          return;
        }
        
        if (response?.success) {
          const count = response.filled || 0;
          showResult(`✓ Successfully filled ${count} fields!`, false);
          
          // Update stats
          chrome.storage.local.get(['stats'], (result) => {
            const stats = result.stats || { fieldsToday: 0, appsToday: 0 };
            stats.fieldsToday = (stats.fieldsToday || 0) + count;
            stats.appsToday = (stats.appsToday || 0) + (count > 0 ? 1 : 0);
            chrome.storage.local.set({ stats });
            
            fieldsFilledToday.textContent = stats.fieldsToday;
            appsFilledToday.textContent = stats.appsToday;
          });
        } else {
          showResult('Failed to fill form', true);
        }
        
        resetButton();
      });
    });
  });
  
  // Dashboard button click
  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://auto-applicant-1.preview.emergentagent.com' });
  });
  
  // Enable toggle click
  enableToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    const isEnabled = this.classList.contains('active');
    
    if (isEnabled) {
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Extension Active';
    } else {
      statusDot.classList.add('inactive');
      statusText.textContent = 'Extension Disabled';
    }
    
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      settings.enabled = isEnabled;
      chrome.storage.local.set({ settings });
    });
  });
  
  // Stealth toggle click
  stealthToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    const isEnabled = this.classList.contains('active');
    
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      settings.random_delays = isEnabled;
      settings.typing_speed = isEnabled ? 'human' : 'fast';
      chrome.storage.local.set({ settings });
      
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateSettings', 
            settings 
          });
        }
      });
    });
  });
  
  // Helper functions
  function showResult(message, isError) {
    resultMessage.textContent = message;
    resultMessage.classList.add('visible');
    if (isError) {
      resultMessage.classList.add('error');
    } else {
      resultMessage.classList.remove('error');
    }
    
    setTimeout(() => {
      resultMessage.classList.remove('visible');
    }, 5000);
  }
  
  function resetButton() {
    fillBtn.disabled = false;
    fillBtnText.textContent = 'Fill Application Now';
  }
  
  // Reset daily stats at midnight
  const now = new Date();
  const lastReset = localStorage.getItem('lastStatsReset');
  const today = now.toDateString();
  
  if (lastReset !== today) {
    chrome.storage.local.set({ stats: { fieldsToday: 0, appsToday: 0 } });
    localStorage.setItem('lastStatsReset', today);
  }
});
