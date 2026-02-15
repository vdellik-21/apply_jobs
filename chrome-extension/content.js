// JobFill AI - Content Script (Stealth Mode)
(function() {
  'use strict';
  
  let profile = null;
  let settings = null;
  let isProcessing = false;
  let fillCount = 0;
  
  // Human-like typing simulation with random delays
  function humanType(element, text, callback) {
    if (!settings || settings.typing_speed === 'instant') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      if (callback) callback();
      return;
    }
    
    // Configure delays based on typing speed setting
    let minDelay, maxDelay;
    switch (settings.typing_speed) {
      case 'fast':
        minDelay = 30;
        maxDelay = 80;
        break;
      case 'human':
        minDelay = settings.typing_delay_min || 50;
        maxDelay = settings.typing_delay_max || 150;
        break;
      case 'slow':
        minDelay = 100;
        maxDelay = 300;
        break;
      default:
        minDelay = 50;
        maxDelay = 150;
    }
    
    let index = 0;
    
    function typeChar() {
      if (index < text.length) {
        // Add character
        element.value += text[index];
        
        // Dispatch input event for reactive frameworks
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { key: text[index], bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key: text[index], bubbles: true }));
        
        index++;
        
        // Calculate random delay with natural variance
        let delay = minDelay + Math.random() * (maxDelay - minDelay);
        
        // Add occasional longer pauses (like human thinking)
        if (settings.random_delays && Math.random() < 0.1) {
          delay += 100 + Math.random() * 200;
        }
        
        setTimeout(typeChar, delay);
      } else {
        // Finished typing - dispatch change event
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        if (callback) callback();
      }
    }
    
    // Clear existing value before typing
    element.value = '';
    element.focus();
    
    // Small delay before starting to type
    setTimeout(typeChar, 100 + Math.random() * 200);
  }
  
  // Simulate realistic mouse movement to element
  function simulateMouseMove(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Add some randomness to cursor position
    const offsetX = (Math.random() - 0.5) * (rect.width * 0.3);
    const offsetY = (Math.random() - 0.5) * (rect.height * 0.3);
    
    const moveEvent = new MouseEvent('mousemove', {
      clientX: centerX + offsetX,
      clientY: centerY + offsetY,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(moveEvent);
    
    // Also dispatch mouseenter
    const enterEvent = new MouseEvent('mouseenter', {
      clientX: centerX + offsetX,
      clientY: centerY + offsetY,
      bubbles: true
    });
    element.dispatchEvent(enterEvent);
  }
  
  // Field detection patterns (comprehensive)
  const fieldPatterns = {
    firstName: /first[_-]?name|fname|given[_-]?name|first$/i,
    lastName: /last[_-]?name|lname|surname|family[_-]?name|last$/i,
    fullName: /full[_-]?name|^name$|applicant[_-]?name|your[_-]?name/i,
    email: /e?-?mail|email[_-]?address|^email$/i,
    phone: /phone|tel|mobile|cell|contact[_-]?number/i,
    linkedin: /linkedin|linked[_-]?in|profile[_-]?url/i,
    location: /location|city|address|current[_-]?location/i,
    website: /website|portfolio|personal[_-]?website|url|github/i,
    company: /current[_-]?company|employer|company[_-]?name/i,
    title: /job[_-]?title|current[_-]?title|position/i,
    summary: /summary|about|bio|introduction|cover/i,
    experience: /experience|years|work[_-]?history/i
  };
  
  // Match field to profile data
  function getFieldValue(field) {
    const name = (field.name || field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
    const label = getFieldLabel(field).toLowerCase();
    const combined = `${name} ${placeholder} ${label} ${ariaLabel}`;
    
    if (!profile || !profile.personal_info) return null;
    
    const pi = profile.personal_info;
    
    // Check each pattern
    if (fieldPatterns.firstName.test(combined)) {
      return pi.full_name?.split(' ')[0] || '';
    }
    if (fieldPatterns.lastName.test(combined)) {
      const parts = pi.full_name?.split(' ') || [];
      return parts.slice(1).join(' ') || '';
    }
    if (fieldPatterns.fullName.test(combined)) {
      return pi.full_name || '';
    }
    if (fieldPatterns.email.test(combined)) {
      return pi.email || '';
    }
    if (fieldPatterns.phone.test(combined)) {
      return pi.phone || '';
    }
    if (fieldPatterns.linkedin.test(combined)) {
      return pi.linkedin || '';
    }
    if (fieldPatterns.location.test(combined)) {
      return pi.location || '';
    }
    if (fieldPatterns.website.test(combined)) {
      return pi.website || '';
    }
    
    return null;
  }
  
  // Get field label from DOM
  function getFieldLabel(field) {
    // Check for explicit label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    // Check for aria-labelledby
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent.trim();
    }
    
    // Check parent elements for label
    let parent = field.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      const labelEl = parent.querySelector('label');
      if (labelEl && !labelEl.querySelector('input, textarea')) {
        return labelEl.textContent.trim();
      }
      parent = parent.parentElement;
    }
    
    return '';
  }
  
  // Find all fillable fields on the page
  function findFields() {
    const selectors = [
      'input[type="text"]:not([readonly]):not([disabled])',
      'input[type="email"]:not([readonly]):not([disabled])',
      'input[type="tel"]:not([readonly]):not([disabled])',
      'input[type="url"]:not([readonly]):not([disabled])',
      'input:not([type]):not([readonly]):not([disabled])',
      'textarea:not([readonly]):not([disabled])'
    ];
    
    return Array.from(document.querySelectorAll(selectors.join(', ')))
      .filter(el => {
        // Check visibility
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
        
        // Check if in viewport or scrollable area
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight + 500) return false;
        
        // Exclude hidden/search/password fields
        if (el.type === 'hidden' || el.type === 'password' || el.type === 'search') return false;
        
        return true;
      });
  }
  
  // Fill form with human-like behavior
  async function fillForm() {
    if (isProcessing) {
      console.log('JobFill: Already processing');
      return { filled: 0 };
    }
    
    isProcessing = true;
    fillCount = 0;
    updateIndicator('Filling...', '#f59e0b');
    
    const fields = findFields();
    console.log(`JobFill: Found ${fields.length} fillable fields`);
    
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = getFieldValue(field);
      
      // Only fill empty fields with matching values
      if (value && (!field.value || field.value.trim() === '')) {
        console.log(`JobFill: Filling field "${field.name || field.id}" with value`);
        
        // Random delay before each field (human-like pause)
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
        }
        
        // Simulate mouse movement to field
        simulateMouseMove(field);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
        
        // Scroll field into view smoothly
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 200));
        
        // Type with human-like speed
        await new Promise(resolve => {
          humanType(field, value, resolve);
        });
        
        fillCount++;
        updateIndicator(`Filled ${fillCount}`, '#14b8a6');
      }
    }
    
    isProcessing = false;
    
    // Update indicator with final count
    updateIndicator(`✓ ${fillCount} filled`, '#22c55e');
    
    // Reset indicator after delay
    setTimeout(() => {
      updateIndicator('⚡ JobFill Ready', '#14b8a6');
    }, 3000);
    
    // Log application if enabled
    if (settings?.save_applications && fillCount > 0) {
      logApplication();
    }
    
    console.log(`JobFill: Completed - filled ${fillCount} fields`);
    return { filled: fillCount };
  }
  
  // Log application to dashboard
  function logApplication() {
    const jobTitle = extractJobTitle();
    const company = extractCompanyName();
    
    if (jobTitle || company) {
      chrome.runtime.sendMessage({
        action: 'logApplication',
        data: {
          company: company || 'Unknown',
          position: jobTitle || 'Unknown Position',
          platform: detectPlatform(),
          status: 'Applied',
          applied_date: new Date().toISOString(),
          job_url: window.location.href,
          auto_filled: true,
          fields_filled: fillCount
        }
      });
    }
  }
  
  // Extract job title from page
  function extractJobTitle() {
    const selectors = [
      'h1.job-title',
      'h1[class*="title"]',
      '.job-details h1',
      '[data-test="job-title"]',
      '.jobs-unified-top-card h1',
      'h1'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim().substring(0, 100);
      }
    }
    return '';
  }
  
  // Extract company name from page
  function extractCompanyName() {
    const selectors = [
      '[class*="company-name"]',
      '.company-name',
      '[data-test="company-name"]',
      '.jobs-unified-top-card__company-name',
      '[class*="employer"]'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim().substring(0, 50);
      }
    }
    return '';
  }
  
  // Detect current platform
  function detectPlatform() {
    const url = window.location.hostname;
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('indeed')) return 'Indeed';
    if (url.includes('greenhouse')) return 'Greenhouse';
    if (url.includes('lever')) return 'Lever';
    if (url.includes('workday')) return 'Workday';
    if (url.includes('glassdoor')) return 'Glassdoor';
    if (url.includes('ziprecruiter')) return 'ZipRecruiter';
    return 'Other';
  }
  
  // Update floating indicator
  function updateIndicator(text, color) {
    const indicator = document.getElementById('jobfill-indicator');
    if (indicator) {
      indicator.textContent = text;
      indicator.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    }
  }
  
  // Initialize extension
  async function init() {
    console.log('JobFill AI: Initializing...');
    
    // Get profile from background/API
    chrome.runtime.sendMessage({ action: 'getProfile' }, (response) => {
      if (response?.success) {
        profile = response.profile;
        console.log('JobFill AI: Profile loaded');
      } else {
        console.log('JobFill AI: Using default profile');
      }
    });
    
    // Get settings from storage
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response?.success) {
        settings = response.settings;
        console.log('JobFill AI: Settings loaded');
      }
    });
    
    // Add floating indicator button
    addIndicator();
  }
  
  // Add floating indicator/button
  function addIndicator() {
    if (document.getElementById('jobfill-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'jobfill-indicator';
    indicator.textContent = '⚡ JobFill Ready';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #14b8a6, #0ea5e9);
      color: white;
      border-radius: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
      z-index: 2147483647;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    `;
    
    indicator.addEventListener('click', () => {
      if (!isProcessing) {
        fillForm();
      }
    });
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05)';
      indicator.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.5)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
      indicator.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.4)';
    });
    
    // Add to page
    if (document.body) {
      document.body.appendChild(indicator);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(indicator);
      });
    }
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillNow') {
      fillForm().then(result => {
        sendResponse({ success: true, filled: result.filled });
      });
      return true; // Keep channel open for async
    }
    
    if (request.action === 'updateProfile') {
      profile = request.profile;
      sendResponse({ success: true });
    }
    
    if (request.action === 'updateSettings') {
      settings = request.settings;
      sendResponse({ success: true });
    }
    
    if (request.action === 'getStatus') {
      sendResponse({ 
        success: true, 
        status: isProcessing ? 'processing' : 'ready',
        fillCount 
      });
    }
  });
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
