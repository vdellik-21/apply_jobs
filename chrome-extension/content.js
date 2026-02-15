// JobFill AI - Content Script (Stealth Mode with Dropdown Support)
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
        element.value += text[index];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { key: text[index], bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key: text[index], bubbles: true }));
        index++;
        
        let delay = minDelay + Math.random() * (maxDelay - minDelay);
        if (settings.random_delays && Math.random() < 0.1) {
          delay += 100 + Math.random() * 200;
        }
        
        setTimeout(typeChar, delay);
      } else {
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        if (callback) callback();
      }
    }
    
    element.value = '';
    element.focus();
    setTimeout(typeChar, 100 + Math.random() * 200);
  }
  
  // Simulate mouse movement to element
  function simulateMouseMove(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (Math.random() - 0.5) * (rect.width * 0.3);
    const offsetY = (Math.random() - 0.5) * (rect.height * 0.3);
    
    const moveEvent = new MouseEvent('mousemove', {
      clientX: centerX + offsetX,
      clientY: centerY + offsetY,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(moveEvent);
    element.dispatchEvent(new MouseEvent('mouseenter', {
      clientX: centerX + offsetX,
      clientY: centerY + offsetY,
      bubbles: true
    }));
  }
  
  // Smart click on element
  function smartClick(element) {
    simulateMouseMove(element);
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  
  // Handle SELECT dropdowns
  async function handleSelectDropdown(selectEl, valueToSelect) {
    return new Promise(async (resolve) => {
      // Find matching option
      const options = Array.from(selectEl.options);
      let matchedOption = null;
      
      // Try exact match first
      matchedOption = options.find(opt => 
        opt.value.toLowerCase() === valueToSelect.toLowerCase() ||
        opt.text.toLowerCase() === valueToSelect.toLowerCase()
      );
      
      // Try partial match
      if (!matchedOption) {
        matchedOption = options.find(opt => 
          opt.value.toLowerCase().includes(valueToSelect.toLowerCase()) ||
          opt.text.toLowerCase().includes(valueToSelect.toLowerCase()) ||
          valueToSelect.toLowerCase().includes(opt.value.toLowerCase()) ||
          valueToSelect.toLowerCase().includes(opt.text.toLowerCase())
        );
      }
      
      if (matchedOption) {
        // Click to open dropdown
        smartClick(selectEl);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
        
        // Set value
        selectEl.value = matchedOption.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  
  // Handle custom dropdown components (React Select, etc.)
  async function handleCustomDropdown(container, valueToSelect, label) {
    return new Promise(async (resolve) => {
      try {
        // Find clickable trigger
        const trigger = container.querySelector('[class*="control"], [class*="trigger"], [role="combobox"], [role="listbox"], button, [class*="select"]');
        
        if (trigger) {
          // Click to open
          smartClick(trigger);
          await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
          
          // Find options
          const optionsContainer = document.querySelector('[class*="menu"], [class*="options"], [class*="dropdown"], [role="listbox"]');
          
          if (optionsContainer) {
            const options = optionsContainer.querySelectorAll('[class*="option"], [role="option"], li, div[data-value]');
            
            for (const opt of options) {
              const text = opt.textContent.toLowerCase();
              if (text.includes(valueToSelect.toLowerCase()) || valueToSelect.toLowerCase().includes(text)) {
                smartClick(opt);
                await new Promise(r => setTimeout(r, 100));
                resolve(true);
                return;
              }
            }
          }
        }
        resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }
  
  // Field detection patterns (comprehensive)
  const fieldPatterns = {
    firstName: /first[_-]?name|fname|given[_-]?name|first$/i,
    lastName: /last[_-]?name|lname|surname|family[_-]?name|last$/i,
    fullName: /full[_-]?name|^name$|applicant[_-]?name|your[_-]?name|legal[_-]?name/i,
    email: /e?-?mail|email[_-]?address|^email$/i,
    phone: /phone|tel|mobile|cell|contact[_-]?number/i,
    linkedin: /linkedin|linked[_-]?in|profile[_-]?url/i,
    // Address patterns
    streetAddress: /street[_-]?address|address[_-]?line|address1|street|home[_-]?address/i,
    addressLine2: /address[_-]?line[_-]?2|address2|apt|suite|unit/i,
    city: /^city$|city[_-]?name|town|municipality/i,
    state: /^state$|state[_-]?province|region|province/i,
    zipCode: /zip|postal|postcode|zip[_-]?code|postal[_-]?code/i,
    country: /country|nation|country[_-]?name/i,
    location: /location|current[_-]?location/i,
    // Other
    website: /website|portfolio|personal[_-]?website|url|github/i,
    company: /current[_-]?company|employer|company[_-]?name/i,
    title: /job[_-]?title|current[_-]?title|position|role/i,
    salary: /salary|compensation|pay|expected[_-]?salary/i,
    experience: /years[_-]?of[_-]?experience|experience[_-]?years|yoe/i,
    startDate: /start[_-]?date|available|availability|when[_-]?can/i,
    workAuth: /work[_-]?auth|authorized|legally|visa|sponsorship/i,
    gender: /gender|sex/i,
    veteran: /veteran|military/i,
    disability: /disability|disabled|accommodation/i,
    race: /race|ethnicity/i
  };
  
  // Get field value based on pattern matching
  function getFieldValue(field) {
    const name = (field.name || field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
    const label = getFieldLabel(field).toLowerCase();
    const combined = `${name} ${placeholder} ${label} ${ariaLabel}`;
    
    if (!profile || !profile.personal_info) return null;
    
    const pi = profile.personal_info;
    
    // Name fields
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
    
    // Contact fields
    if (fieldPatterns.email.test(combined)) {
      return pi.email || '';
    }
    if (fieldPatterns.phone.test(combined)) {
      return pi.phone || '';
    }
    if (fieldPatterns.linkedin.test(combined)) {
      return pi.linkedin || '';
    }
    if (fieldPatterns.website.test(combined)) {
      return pi.website || pi.github || pi.portfolio || '';
    }
    
    // Address fields - smart matching
    if (fieldPatterns.streetAddress.test(combined)) {
      return pi.street_address || '';
    }
    if (fieldPatterns.city.test(combined)) {
      return pi.city || '';
    }
    if (fieldPatterns.state.test(combined)) {
      // Check if it's a dropdown (likely needs full name) or text input (might need abbreviation)
      if (field.tagName === 'SELECT') {
        return pi.state_full || pi.state || '';
      }
      // For short text inputs, use abbreviation
      if (field.maxLength && field.maxLength <= 3) {
        return pi.state || '';
      }
      return pi.state_full || pi.state || '';
    }
    if (fieldPatterns.zipCode.test(combined)) {
      return pi.zip_code || '';
    }
    if (fieldPatterns.country.test(combined)) {
      if (field.tagName === 'SELECT') {
        return pi.country || 'United States';
      }
      return pi.country || pi.country_code || 'United States';
    }
    if (fieldPatterns.location.test(combined)) {
      return pi.location || `${pi.city}, ${pi.state}`;
    }
    
    // Work authorization - usually "Yes"
    if (fieldPatterns.workAuth.test(combined)) {
      return 'Yes';
    }
    
    return null;
  }
  
  // Get field label from DOM
  function getFieldLabel(field) {
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent.trim();
    }
    
    let parent = field.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      const labelEl = parent.querySelector('label');
      if (labelEl && !labelEl.querySelector('input, textarea, select')) {
        return labelEl.textContent.trim();
      }
      parent = parent.parentElement;
    }
    
    return '';
  }
  
  // Find all fillable fields
  function findFields() {
    const textSelectors = [
      'input[type="text"]:not([readonly]):not([disabled])',
      'input[type="email"]:not([readonly]):not([disabled])',
      'input[type="tel"]:not([readonly]):not([disabled])',
      'input[type="url"]:not([readonly]):not([disabled])',
      'input:not([type]):not([readonly]):not([disabled])',
      'textarea:not([readonly]):not([disabled])'
    ];
    
    const textFields = Array.from(document.querySelectorAll(textSelectors.join(', ')))
      .filter(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
        if (el.type === 'hidden' || el.type === 'password' || el.type === 'search') return false;
        return true;
      });
    
    // Find SELECT dropdowns
    const selectFields = Array.from(document.querySelectorAll('select:not([disabled])'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    
    return { textFields, selectFields };
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
    
    const { textFields, selectFields } = findFields();
    console.log(`JobFill: Found ${textFields.length} text fields, ${selectFields.length} dropdowns`);
    
    // Fill text fields
    for (let i = 0; i < textFields.length; i++) {
      const field = textFields[i];
      const value = getFieldValue(field);
      
      if (value && (!field.value || field.value.trim() === '')) {
        console.log(`JobFill: Filling "${field.name || field.id}" with "${value.substring(0, 20)}..."`);
        
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
        }
        
        simulateMouseMove(field);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
        
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 200));
        
        await new Promise(resolve => {
          humanType(field, value, resolve);
        });
        
        fillCount++;
        updateIndicator(`Filled ${fillCount}`, '#14b8a6');
      }
    }
    
    // Fill SELECT dropdowns
    for (const select of selectFields) {
      const value = getFieldValue(select);
      
      if (value && (!select.value || select.selectedIndex === 0)) {
        console.log(`JobFill: Filling dropdown "${select.name || select.id}" with "${value}"`);
        
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
        }
        
        const filled = await handleSelectDropdown(select, value);
        if (filled) {
          fillCount++;
          updateIndicator(`Filled ${fillCount}`, '#14b8a6');
        }
      }
    }
    
    isProcessing = false;
    updateIndicator(`✓ ${fillCount} filled`, '#22c55e');
    
    setTimeout(() => {
      updateIndicator('⚡ JobFill Ready', '#14b8a6');
    }, 3000);
    
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
  
  function extractJobTitle() {
    const selectors = ['h1.job-title', 'h1[class*="title"]', '.job-details h1', '[data-test="job-title"]', '.jobs-unified-top-card h1', 'h1'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) return el.textContent.trim().substring(0, 100);
    }
    return '';
  }
  
  function extractCompanyName() {
    const selectors = ['[class*="company-name"]', '.company-name', '[data-test="company-name"]', '.jobs-unified-top-card__company-name', '[class*="employer"]'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) return el.textContent.trim().substring(0, 50);
    }
    return '';
  }
  
  function detectPlatform() {
    const url = window.location.hostname;
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('indeed')) return 'Indeed';
    if (url.includes('greenhouse')) return 'Greenhouse';
    if (url.includes('lever')) return 'Lever';
    if (url.includes('workday')) return 'Workday';
    if (url.includes('glassdoor')) return 'Glassdoor';
    if (url.includes('ziprecruiter')) return 'ZipRecruiter';
    if (url.includes('dice')) return 'Dice';
    if (url.includes('monster')) return 'Monster';
    if (url.includes('ycombinator') || url.includes('workatastartup')) return 'Y Combinator';
    if (url.includes('wellfound') || url.includes('angel.co')) return 'Wellfound';
    if (url.includes('startups.gallery')) return 'Startups.Gallery';
    if (url.includes('ashbyhq')) return 'Ashby HQ';
    if (url.includes('simplyhired')) return 'SimplyHired';
    if (url.includes('careerbuilder')) return 'CareerBuilder';
    return 'Other';
  }
  
  function updateIndicator(text, color) {
    const indicator = document.getElementById('jobfill-indicator');
    if (indicator) {
      indicator.textContent = text;
      indicator.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    }
  }
  
  async function init() {
    console.log('JobFill AI: Initializing...');
    
    chrome.runtime.sendMessage({ action: 'getProfile' }, (response) => {
      if (response?.success) {
        profile = response.profile;
        console.log('JobFill AI: Profile loaded');
      }
    });
    
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response?.success) {
        settings = response.settings;
        console.log('JobFill AI: Settings loaded');
      }
    });
    
    addIndicator();
  }
  
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
      if (!isProcessing) fillForm();
    });
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05)';
      indicator.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.5)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
      indicator.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.4)';
    });
    
    if (document.body) {
      document.body.appendChild(indicator);
    } else {
      window.addEventListener('DOMContentLoaded', () => document.body.appendChild(indicator));
    }
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillNow') {
      fillForm().then(result => sendResponse({ success: true, filled: result.filled }));
      return true;
    }
    if (request.action === 'updateProfile') {
      profile = request.profile;
      sendResponse({ success: true });
    }
    if (request.action === 'updateSettings') {
      settings = request.settings;
      sendResponse({ success: true });
    }
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
