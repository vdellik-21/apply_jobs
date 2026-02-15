// JobFill AI - Content Script (Stealth Mode with Full Form Support)
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
    
    let minDelay, maxDelay;
    switch (settings.typing_speed) {
      case 'fast': minDelay = 30; maxDelay = 80; break;
      case 'human': minDelay = settings.typing_delay_min || 50; maxDelay = settings.typing_delay_max || 150; break;
      case 'slow': minDelay = 100; maxDelay = 300; break;
      default: minDelay = 50; maxDelay = 150;
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
  
  // Simulate mouse movement
  function simulateMouseMove(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + (Math.random() - 0.5) * (rect.width * 0.3);
    const centerY = rect.top + rect.height / 2 + (Math.random() - 0.5) * (rect.height * 0.3);
    
    element.dispatchEvent(new MouseEvent('mousemove', { clientX: centerX, clientY: centerY, bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseenter', { clientX: centerX, clientY: centerY, bubbles: true }));
  }
  
  // Smart click
  function smartClick(element) {
    simulateMouseMove(element);
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  
  // Handle SELECT dropdowns
  async function handleSelectDropdown(selectEl, valueToSelect) {
    return new Promise(async (resolve) => {
      const options = Array.from(selectEl.options);
      let matchedOption = null;
      
      // Try exact match
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
        smartClick(selectEl);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
        selectEl.value = matchedOption.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  
  // Handle radio buttons (Yes/No, Gender, etc.)
  async function handleRadioButton(container, valueToSelect, fieldContext) {
    return new Promise(async (resolve) => {
      // Find all radio buttons in the container or nearby
      const radios = container.querySelectorAll('input[type="radio"]');
      
      for (const radio of radios) {
        const label = getRadioLabel(radio);
        const value = radio.value.toLowerCase();
        const labelText = label.toLowerCase();
        
        // Check for match
        if (value === valueToSelect.toLowerCase() || 
            labelText.includes(valueToSelect.toLowerCase()) ||
            valueToSelect.toLowerCase().includes(labelText)) {
          
          await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
          simulateMouseMove(radio);
          await new Promise(r => setTimeout(r, 50));
          
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          radio.dispatchEvent(new Event('click', { bubbles: true }));
          
          // Also click the label if it exists
          const labelEl = document.querySelector(`label[for="${radio.id}"]`);
          if (labelEl) smartClick(labelEl);
          
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
  }
  
  // Get radio button label
  function getRadioLabel(radio) {
    // Check for label with for attribute
    if (radio.id) {
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    // Check parent for label
    let parent = radio.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      const label = parent.querySelector('label, span, div');
      if (label && label !== radio) {
        const text = label.textContent.trim();
        if (text && text.length < 100) return text;
      }
      parent = parent.parentElement;
    }
    
    return radio.value || '';
  }
  
  // Handle custom dropdown with search (like location autocomplete)
  async function handleAutocompleteDropdown(input, valueToSelect) {
    return new Promise(async (resolve) => {
      // Type the value
      await new Promise(res => humanType(input, valueToSelect, res));
      
      // Wait for dropdown to appear
      await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
      
      // Look for dropdown options
      const dropdownSelectors = [
        '[class*="autocomplete"]',
        '[class*="suggestions"]',
        '[class*="dropdown"]',
        '[class*="listbox"]',
        '[role="listbox"]',
        '[class*="options"]',
        '[class*="menu"]',
        'ul[class*="list"]'
      ];
      
      for (const selector of dropdownSelectors) {
        const dropdown = document.querySelector(selector);
        if (dropdown && dropdown.offsetHeight > 0) {
          const options = dropdown.querySelectorAll('li, [role="option"], [class*="option"], div[data-value]');
          
          for (const opt of options) {
            const text = opt.textContent.toLowerCase();
            if (text.includes(valueToSelect.toLowerCase()) || valueToSelect.toLowerCase().includes(text.split(',')[0])) {
              await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
              smartClick(opt);
              resolve(true);
              return;
            }
          }
          
          // If no exact match, click the first option
          if (options.length > 0) {
            await new Promise(r => setTimeout(r, 200));
            smartClick(options[0]);
            resolve(true);
            return;
          }
        }
      }
      
      // Press Enter to select first option
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
      resolve(true);
    });
  }
  
  // Field detection patterns
  const fieldPatterns = {
    firstName: /first[_-]?name|fname|given[_-]?name|first$/i,
    lastName: /last[_-]?name|lname|surname|family[_-]?name|last$/i,
    fullName: /full[_-]?name|^name$|applicant[_-]?name|your[_-]?name|legal[_-]?name|complete[_-]?name/i,
    email: /e?-?mail|email[_-]?address|^email$/i,
    phone: /phone|tel|mobile|cell|contact[_-]?number/i,
    linkedin: /linkedin|linked[_-]?in|profile[_-]?url/i,
    streetAddress: /street[_-]?address|address[_-]?line|address1|street|home[_-]?address/i,
    city: /^city$|city[_-]?name|town|municipality/i,
    state: /^state$|state[_-]?province|region|province/i,
    zipCode: /zip|postal|postcode|zip[_-]?code|postal[_-]?code/i,
    country: /country|nation|country[_-]?name/i,
    location: /location|current[_-]?location|city.*state|where.*located/i,
    website: /website|portfolio|personal[_-]?website|url|github/i,
    // Current job
    currentCompany: /current[_-]?company|employer|company[_-]?name|most[_-]?recent[_-]?company|present[_-]?company/i,
    currentTitle: /current[_-]?title|job[_-]?title|position|role|most[_-]?recent[_-]?title/i,
    // Yes/No questions
    workAuth: /work[_-]?auth|authorized|legally|eligible.*work|right.*work/i,
    visaSponsorship: /visa|sponsorship|sponsor|immigration/i,
    textConsent: /text[_-]?message|sms|consent.*text|opt.*in/i,
    // Demographics
    gender: /gender|sex/i,
    veteran: /veteran|military|armed[_-]?forces/i,
    disability: /disability|disabled|accommodation/i,
    race: /race|ethnicity|ethnic/i
  };
  
  // Get field value based on pattern matching
  function getFieldValue(field, fieldType = 'text') {
    const name = (field.name || field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
    const label = getFieldLabel(field).toLowerCase();
    const combined = `${name} ${placeholder} ${label} ${ariaLabel}`;
    
    if (!profile || !profile.personal_info) return null;
    
    const pi = profile.personal_info;
    
    // Name fields
    if (fieldPatterns.fullName.test(combined)) {
      return pi.full_name || '';
    }
    if (fieldPatterns.firstName.test(combined)) {
      return pi.full_name?.split(' ')[0] || '';
    }
    if (fieldPatterns.lastName.test(combined)) {
      const parts = pi.full_name?.split(' ') || [];
      return parts.slice(1).join(' ') || '';
    }
    
    // Contact
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
    
    // Address
    if (fieldPatterns.streetAddress.test(combined)) {
      return pi.street_address || '';
    }
    if (fieldPatterns.city.test(combined)) {
      return pi.city || '';
    }
    if (fieldPatterns.state.test(combined)) {
      if (field.tagName === 'SELECT' || field.maxLength > 3) {
        return pi.state_full || pi.state || '';
      }
      return pi.state || '';
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
      return `${pi.city}, ${pi.state}` || pi.location || '';
    }
    
    // Current job
    if (fieldPatterns.currentCompany.test(combined)) {
      const exp = profile.work_experience?.[0];
      return exp?.company || '';
    }
    if (fieldPatterns.currentTitle.test(combined)) {
      const exp = profile.work_experience?.[0];
      return exp?.title || '';
    }
    
    return null;
  }
  
  // Get Yes/No value for specific question types
  function getYesNoValue(fieldContext) {
    const context = fieldContext.toLowerCase();
    
    // Work authorization - Yes
    if (fieldPatterns.workAuth.test(context)) {
      return 'yes';
    }
    
    // Visa sponsorship - No (assuming authorized to work)
    if (fieldPatterns.visaSponsorship.test(context)) {
      return 'no';
    }
    
    // Text consent - user preference (default No for privacy)
    if (fieldPatterns.textConsent.test(context)) {
      return 'no'; // Can be changed in settings later
    }
    
    return null;
  }
  
  // Get demographic value
  function getDemographicValue(fieldContext) {
    const context = fieldContext.toLowerCase();
    
    // Gender - Decline to self-identify by default
    if (fieldPatterns.gender.test(context)) {
      return 'decline';
    }
    
    // Veteran - No (can be changed)
    if (fieldPatterns.veteran.test(context)) {
      return 'no';
    }
    
    // Disability - Decline
    if (fieldPatterns.disability.test(context)) {
      return 'decline';
    }
    
    // Race/Ethnicity - Decline
    if (fieldPatterns.race.test(context)) {
      return 'decline';
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
    
    // Check parent elements
    let parent = field.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      const labelEl = parent.querySelector('label, legend, [class*="label"]');
      if (labelEl && !labelEl.querySelector('input, textarea, select')) {
        return labelEl.textContent.trim();
      }
      parent = parent.parentElement;
    }
    
    return '';
  }
  
  // Get context around a field group (for radio buttons)
  function getFieldGroupContext(element) {
    let parent = element.parentElement;
    let context = '';
    
    for (let i = 0; i < 6 && parent; i++) {
      const legend = parent.querySelector('legend');
      if (legend) context += ' ' + legend.textContent;
      
      const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, [class*="label"], [class*="title"], [class*="question"]');
      if (heading) context += ' ' + heading.textContent;
      
      parent = parent.parentElement;
    }
    
    return context.trim();
  }
  
  // Find all fillable elements
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
    
    const selectFields = Array.from(document.querySelectorAll('select:not([disabled])'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    
    // Find radio button groups
    const radioGroups = new Map();
    const radios = document.querySelectorAll('input[type="radio"]:not([disabled])');
    radios.forEach(radio => {
      const name = radio.name;
      if (name && !radioGroups.has(name)) {
        radioGroups.set(name, radio.closest('fieldset, [role="radiogroup"], div'));
      }
    });
    
    return { textFields, selectFields, radioGroups };
  }
  
  // Fill form
  async function fillForm() {
    if (isProcessing) {
      console.log('JobFill: Already processing');
      return { filled: 0 };
    }
    
    isProcessing = true;
    fillCount = 0;
    updateIndicator('Filling...', '#f59e0b');
    
    const { textFields, selectFields, radioGroups } = findFields();
    console.log(`JobFill: Found ${textFields.length} text fields, ${selectFields.length} dropdowns, ${radioGroups.size} radio groups`);
    
    // Fill text fields
    for (let i = 0; i < textFields.length; i++) {
      const field = textFields[i];
      const value = getFieldValue(field);
      
      if (value && (!field.value || field.value.trim() === '')) {
        console.log(`JobFill: Filling "${field.name || field.id}" with "${value.substring(0, 30)}..."`);
        
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
        }
        
        simulateMouseMove(field);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
        
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 200));
        
        // Check if this is an autocomplete field (location)
        const label = getFieldLabel(field).toLowerCase();
        if (fieldPatterns.location.test(label) || field.getAttribute('role') === 'combobox') {
          await handleAutocompleteDropdown(field, value);
        } else {
          await new Promise(resolve => humanType(field, value, resolve));
        }
        
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
    
    // Fill radio button groups
    for (const [name, container] of radioGroups) {
      if (!container) continue;
      
      const context = getFieldGroupContext(container);
      console.log(`JobFill: Processing radio group "${name}" with context: ${context.substring(0, 50)}...`);
      
      // Check if already answered
      const checkedRadio = container.querySelector('input[type="radio"]:checked');
      if (checkedRadio) continue;
      
      // Determine value to select
      let valueToSelect = null;
      
      // Check for Yes/No questions
      const yesNoValue = getYesNoValue(context);
      if (yesNoValue) {
        valueToSelect = yesNoValue;
      }
      
      // Check for demographics
      if (!valueToSelect) {
        const demoValue = getDemographicValue(context);
        if (demoValue) {
          valueToSelect = demoValue;
        }
      }
      
      if (valueToSelect) {
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
        }
        
        const filled = await handleRadioButton(container, valueToSelect, context);
        if (filled) {
          fillCount++;
          updateIndicator(`Filled ${fillCount}`, '#14b8a6');
          console.log(`JobFill: Selected "${valueToSelect}" for "${name}"`);
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
  
  // Log application
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
