// JobFill AI - Background Service Worker
const API_BASE = 'https://formzap-1.preview.emergentagent.com';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobFill AI Extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    enabled: true,
    settings: {
      typing_speed: 'human',
      typing_delay_min: 50,
      typing_delay_max: 150,
      random_delays: true,
      auto_submit: false,
      ai_matching: true
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfile') {
    fetch(`${API_BASE}/api/profile`)
      .then(r => r.json())
      .then(data => sendResponse({ success: true, profile: data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ success: true, settings: result.settings });
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'analyzeForm') {
    fetch(`${API_BASE}/api/ai/analyze-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data)
    })
      .then(r => r.json())
      .then(data => sendResponse({ success: true, mappings: data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  
  if (request.action === 'logApplication') {
    fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data)
    })
      .then(r => r.json())
      .then(data => sendResponse({ success: true, application: data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = [
      'linkedin.com/jobs',
      'indeed.com',
      'boards.greenhouse.io',
      'jobs.lever.co',
      'workday.com',
      'glassdoor.com',
      'ziprecruiter.com'
    ];
    
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    if (isSupported) {
      chrome.action.setBadgeText({ text: '✓', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#14b8a6', tabId });
    }
  }
});
