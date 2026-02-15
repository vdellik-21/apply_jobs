// JobFill AI - Universal Content Script (Works on ANY website)
(function() {
  'use strict';
  
  let profile = null;
  let settings = null;
  let isProcessing = false;
  let fillCount = 0;
  
  // =====================================================
  // HUMAN-LIKE BEHAVIOR SIMULATION
  // =====================================================
  
  function humanType(element, text, callback) {
    if (!settings || settings.typing_speed === 'instant') {
      element.value = text;
      triggerInputEvents(element);
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
    element.value = '';
    element.focus();
    
    function typeChar() {
      if (index < text.length) {
        element.value += text[index];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { key: text[index], bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keypress', { key: text[index], bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key: text[index], bubbles: true }));
        index++;
        
        let delay = minDelay + Math.random() * (maxDelay - minDelay);
        if (settings.random_delays && Math.random() < 0.1) {
          delay += 100 + Math.random() * 200;
        }
        setTimeout(typeChar, delay);
      } else {
        triggerInputEvents(element);
        if (callback) callback();
      }
    }
    
    setTimeout(typeChar, 100 + Math.random() * 200);
  }
  
  function triggerInputEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  
  function simulateMouseMove(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.3;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * rect.height * 0.3;
    element.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseenter', { clientX: x, clientY: y, bubbles: true }));
  }
  
  function smartClick(element) {
    simulateMouseMove(element);
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  
  // =====================================================
  // COMPREHENSIVE FIELD DETECTION PATTERNS
  // =====================================================
  
  const fieldPatterns = {
    // Name fields
    firstName: /first[_\-\s]?name|fname|given[_\-\s]?name|forename|first$|vorname/i,
    lastName: /last[_\-\s]?name|lname|surname|family[_\-\s]?name|nachname|last$/i,
    middleName: /middle[_\-\s]?name|mname|middle$/i,
    fullName: /full[_\-\s]?name|^name$|your[_\-\s]?name|applicant[_\-\s]?name|legal[_\-\s]?name|complete[_\-\s]?name|display[_\-\s]?name/i,
    preferredName: /preferred[_\-\s]?name|nickname|known[_\-\s]?as/i,
    
    // Contact
    email: /e[\-_]?mail|email[_\-\s]?address|^email$|correo/i,
    phone: /phone|tel|mobile|cell|contact[_\-\s]?number|telephone|fax|numero/i,
    linkedin: /linkedin|linked[_\-\s]?in|li[_\-\s]?profile/i,
    twitter: /twitter|x\.com|tweet/i,
    github: /github|git[_\-\s]?hub/i,
    website: /website|portfolio|personal[_\-\s]?site|homepage|blog|url/i,
    
    // Address
    streetAddress: /street[_\-\s]?address|address[_\-\s]?(line)?[_\-\s]?1?|street|home[_\-\s]?address|mailing|residence|direccion/i,
    addressLine2: /address[_\-\s]?(line)?[_\-\s]?2|apt|suite|unit|apartment|building|floor/i,
    city: /^city$|city[_\-\s]?name|town|municipality|ciudad|locality/i,
    state: /^state$|state[_\-\s]?province|region|province|estado|prefecture/i,
    zipCode: /zip|postal|postcode|zip[_\-\s]?code|postal[_\-\s]?code|pin[_\-\s]?code/i,
    country: /country|nation|country[_\-\s]?name|pais|land/i,
    location: /location|current[_\-\s]?location|city.*state|where.*located|based/i,
    
    // Employment
    currentCompany: /current[_\-\s]?company|employer|company[_\-\s]?name|most[_\-\s]?recent[_\-\s]?company|organization|present[_\-\s]?company|firma/i,
    currentTitle: /current[_\-\s]?title|job[_\-\s]?title|position|role|most[_\-\s]?recent[_\-\s]?title|designation|occupation/i,
    yearsExperience: /years?[_\-\s]?(of)?[_\-\s]?experience|experience[_\-\s]?years?|yoe|total[_\-\s]?experience/i,
    salary: /salary|compensation|pay|expected[_\-\s]?salary|desired[_\-\s]?salary|current[_\-\s]?salary|ctc|package/i,
    startDate: /start[_\-\s]?date|available|availability|when[_\-\s]?can|join[_\-\s]?date|earliest/i,
    noticePeriod: /notice[_\-\s]?period|notice|serving[_\-\s]?notice/i,
    
    // Education
    university: /university|college|school|institution|alma[_\-\s]?mater|education/i,
    degree: /degree|qualification|diploma|certification/i,
    major: /major|field[_\-\s]?of[_\-\s]?study|specialization|concentration|subject/i,
    gpa: /gpa|grade|cgpa|percentage|marks/i,
    graduationYear: /graduation|grad[_\-\s]?year|year[_\-\s]?of[_\-\s]?graduation|completion/i,
    
    // Yes/No Questions
    workAuth: /work[_\-\s]?auth|authorized|legally|eligible.*work|right.*work|permission.*work|lawfully/i,
    visaSponsorship: /visa|sponsorship|sponsor|immigration|require.*sponsor|need.*sponsor/i,
    textConsent: /text[_\-\s]?message|sms|consent.*text|opt.*in|receive.*text|mobile.*notification/i,
    relocation: /reloca|willing.*move|open.*relocation|move.*location/i,
    remoteWork: /remote|work.*home|wfh|hybrid|on[_\-\s]?site/i,
    backgroundCheck: /background[_\-\s]?check|criminal|felony|conviction/i,
    drugTest: /drug[_\-\s]?test|substance|screening/i,
    nonCompete: /non[_\-\s]?compete|compete|restrictive.*covenant/i,
    over18: /over[_\-\s]?18|18.*years|age|adult|legal[_\-\s]?age/i,
    
    // Demographics (EEO)
    gender: /gender|sex|male.*female|identify/i,
    veteran: /veteran|military|armed[_\-\s]?forces|service[_\-\s]?member/i,
    disability: /disability|disabled|accommodation|impairment/i,
    race: /race|ethnicity|ethnic|origin|heritage/i,
    lgbtq: /lgbtq|sexual[_\-\s]?orientation|orientation/i,
    
    // Other
    referral: /referral|referred|hear.*about|how.*find|source/i,
    coverLetter: /cover[_\-\s]?letter|letter|motivation/i,
    resume: /resume|cv|curriculum/i,
    portfolio: /portfolio|work[_\-\s]?samples|projects/i
  };
  
  // =====================================================
  // VALUE GETTERS
  // =====================================================
  
  function getFieldValue(field, fieldType = 'text') {
    const name = (field.name || field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
    const label = getFieldLabel(field).toLowerCase();
    const autocomplete = (field.getAttribute('autocomplete') || '').toLowerCase();
    const combined = `${name} ${placeholder} ${label} ${ariaLabel} ${autocomplete}`;
    
    if (!profile || !profile.personal_info) return null;
    
    const pi = profile.personal_info;
    
    // Check autocomplete attribute first (most reliable)
    if (autocomplete) {
      if (autocomplete.includes('given-name') || autocomplete === 'fname') {
        return pi.full_name?.split(' ')[0] || '';
      }
      if (autocomplete.includes('family-name') || autocomplete === 'lname') {
        const parts = pi.full_name?.split(' ') || [];
        return parts.slice(1).join(' ') || '';
      }
      if (autocomplete.includes('name') || autocomplete === 'name') {
        return pi.full_name || '';
      }
      if (autocomplete.includes('email')) return pi.email || '';
      if (autocomplete.includes('tel')) return pi.phone || '';
      if (autocomplete.includes('street-address') || autocomplete.includes('address-line1')) return pi.street_address || '';
      if (autocomplete.includes('address-line2')) return ''; // Usually empty
      if (autocomplete.includes('address-level2') || autocomplete.includes('city')) return pi.city || '';
      if (autocomplete.includes('address-level1') || autocomplete.includes('state')) {
        return field.tagName === 'SELECT' || (field.maxLength && field.maxLength > 3) ? (pi.state_full || pi.state) : pi.state;
      }
      if (autocomplete.includes('postal-code')) return pi.zip_code || '';
      if (autocomplete.includes('country')) return pi.country || 'United States';
    }
    
    // Name fields
    if (fieldPatterns.fullName.test(combined)) return pi.full_name || '';
    if (fieldPatterns.firstName.test(combined)) return pi.full_name?.split(' ')[0] || '';
    if (fieldPatterns.lastName.test(combined)) {
      const parts = pi.full_name?.split(' ') || [];
      return parts.slice(1).join(' ') || '';
    }
    if (fieldPatterns.middleName.test(combined)) return ''; // Usually empty
    if (fieldPatterns.preferredName.test(combined)) return pi.full_name?.split(' ')[0] || '';
    
    // Contact
    if (fieldPatterns.email.test(combined)) return pi.email || '';
    if (fieldPatterns.phone.test(combined)) return pi.phone || '';
    if (fieldPatterns.linkedin.test(combined)) return pi.linkedin || '';
    if (fieldPatterns.github.test(combined)) return pi.github || '';
    if (fieldPatterns.twitter.test(combined)) return pi.twitter || '';
    if (fieldPatterns.website.test(combined)) return pi.website || pi.portfolio || '';
    
    // Address
    if (fieldPatterns.streetAddress.test(combined)) return pi.street_address || '';
    if (fieldPatterns.addressLine2.test(combined)) return ''; // Apt included in street_address
    if (fieldPatterns.city.test(combined)) return pi.city || '';
    if (fieldPatterns.state.test(combined)) {
      if (field.tagName === 'SELECT' || (field.maxLength && field.maxLength > 3)) {
        return pi.state_full || pi.state || '';
      }
      return pi.state || '';
    }
    if (fieldPatterns.zipCode.test(combined)) return pi.zip_code || '';
    if (fieldPatterns.country.test(combined)) {
      if (field.tagName === 'SELECT') return pi.country || 'United States';
      return pi.country || pi.country_code || 'United States';
    }
    if (fieldPatterns.location.test(combined)) {
      return `${pi.city || ''}, ${pi.state || ''}`.trim().replace(/^,|,$/g, '') || pi.location || '';
    }
    
    // Employment
    if (fieldPatterns.currentCompany.test(combined)) {
      const exp = profile.work_experience?.[0];
      return exp?.company || '';
    }
    if (fieldPatterns.currentTitle.test(combined)) {
      const exp = profile.work_experience?.[0];
      return exp?.title || '';
    }
    if (fieldPatterns.yearsExperience.test(combined)) return '4'; // Default
    if (fieldPatterns.startDate.test(combined)) return 'Immediately';
    if (fieldPatterns.noticePeriod.test(combined)) return '2 weeks';
    
    // Education
    if (fieldPatterns.university.test(combined)) {
      const edu = profile.education?.[0];
      return edu?.institution || '';
    }
    if (fieldPatterns.degree.test(combined)) {
      const edu = profile.education?.[0];
      return edu?.degree || '';
    }
    if (fieldPatterns.major.test(combined)) {
      const edu = profile.education?.[0];
      return edu?.field || '';
    }
    if (fieldPatterns.gpa.test(combined)) {
      const edu = profile.education?.[0];
      return edu?.gpa || '';
    }
    
    return null;
  }
  
  function getYesNoValue(fieldContext) {
    const context = fieldContext.toLowerCase();
    
    // Work authorization - YES
    if (fieldPatterns.workAuth.test(context)) return 'yes';
    
    // Visa sponsorship - NO (authorized to work)
    if (fieldPatterns.visaSponsorship.test(context)) return 'no';
    
    // Over 18 - YES
    if (fieldPatterns.over18.test(context)) return 'yes';
    
    // Relocation - YES (usually good to say yes)
    if (fieldPatterns.relocation.test(context)) return 'yes';
    
    // Remote work - YES
    if (fieldPatterns.remoteWork.test(context)) return 'yes';
    
    // Background check consent - YES
    if (fieldPatterns.backgroundCheck.test(context)) return 'yes';
    
    // Drug test consent - YES
    if (fieldPatterns.drugTest.test(context)) return 'yes';
    
    // Non-compete - NO (not bound)
    if (fieldPatterns.nonCompete.test(context)) return 'no';
    
    // Text consent - NO (privacy)
    if (fieldPatterns.textConsent.test(context)) return 'no';
    
    return null;
  }
  
  function getDemographicValue(fieldContext) {
    const context = fieldContext.toLowerCase();
    
    // Gender - Decline
    if (fieldPatterns.gender.test(context)) return 'decline';
    
    // Veteran - No
    if (fieldPatterns.veteran.test(context)) return 'no';
    
    // Disability - Decline
    if (fieldPatterns.disability.test(context)) return 'decline';
    
    // Race - Decline
    if (fieldPatterns.race.test(context)) return 'decline';
    
    // LGBTQ - Decline
    if (fieldPatterns.lgbtq.test(context)) return 'decline';
    
    return null;
  }
  
  // =====================================================
  // LABEL & CONTEXT EXTRACTION
  // =====================================================
  
  function getFieldLabel(field) {
    // Method 1: Label with for attribute
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    // Method 2: aria-labelledby
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent.trim();
    }
    
    // Method 3: aria-label
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();
    
    // Method 4: Parent label
    const parentLabel = field.closest('label');
    if (parentLabel) {
      const text = parentLabel.textContent.replace(field.value || '', '').trim();
      if (text) return text;
    }
    
    // Method 5: Nearby label in parent containers
    let parent = field.parentElement;
    for (let i = 0; i < 6 && parent; i++) {
      const selectors = ['label', 'legend', '.label', '[class*="label"]', '[class*="title"]', 'span', 'p'];
      for (const sel of selectors) {
        const labelEl = parent.querySelector(sel);
        if (labelEl && !labelEl.querySelector('input, textarea, select') && !labelEl.contains(field)) {
          const text = labelEl.textContent.trim();
          if (text && text.length < 200 && text.length > 1) return text;
        }
      }
      parent = parent.parentElement;
    }
    
    // Method 6: Placeholder
    if (field.placeholder) return field.placeholder;
    
    return '';
  }
  
  function getFieldGroupContext(element) {
    let parent = element.parentElement;
    let context = '';
    
    for (let i = 0; i < 8 && parent; i++) {
      const selectors = ['legend', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[class*="label"]', '[class*="title"]', '[class*="question"]', '[class*="header"]', 'p', 'span'];
      for (const sel of selectors) {
        const el = parent.querySelector(sel);
        if (el && !el.querySelector('input, select, textarea')) {
          context += ' ' + el.textContent;
        }
      }
      parent = parent.parentElement;
    }
    
    return context.trim().substring(0, 500);
  }
  
  // =====================================================
  // FORM ELEMENT HANDLERS
  // =====================================================
  
  async function handleSelectDropdown(selectEl, valueToSelect) {
    const options = Array.from(selectEl.options);
    const valueLower = valueToSelect.toLowerCase();
    
    // Try different matching strategies
    let matchedOption = null;
    
    // Exact match
    matchedOption = options.find(opt => 
      opt.value.toLowerCase() === valueLower || opt.text.toLowerCase() === valueLower
    );
    
    // Contains match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.value.toLowerCase().includes(valueLower) || 
        opt.text.toLowerCase().includes(valueLower) ||
        valueLower.includes(opt.value.toLowerCase()) ||
        valueLower.includes(opt.text.toLowerCase())
      );
    }
    
    // Fuzzy match (first word)
    if (!matchedOption) {
      const firstWord = valueLower.split(/[\s,]/)[0];
      matchedOption = options.find(opt => 
        opt.text.toLowerCase().startsWith(firstWord) || 
        opt.value.toLowerCase().startsWith(firstWord)
      );
    }
    
    if (matchedOption && matchedOption.value !== '') {
      smartClick(selectEl);
      await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
      selectEl.value = matchedOption.value;
      triggerInputEvents(selectEl);
      return true;
    }
    
    return false;
  }
  
  async function handleRadioButton(container, valueToSelect, fieldContext) {
    const radios = container.querySelectorAll('input[type="radio"]');
    const valueLower = valueToSelect.toLowerCase();
    
    for (const radio of radios) {
      const label = getRadioLabel(radio).toLowerCase();
      const value = (radio.value || '').toLowerCase();
      
      // Check for various Yes/No patterns
      const isYesOption = /^yes$|^y$|^true$|^1$|consent|agree|accept|authorize/i.test(label) || 
                          /^yes$|^y$|^true$|^1$/i.test(value);
      const isNoOption = /^no$|^n$|^false$|^0$|decline|disagree|reject|don't|do not/i.test(label) || 
                         /^no$|^n$|^false$|^0$/i.test(value);
      const isDeclineOption = /decline|prefer not|choose not|don't wish|do not wish/i.test(label);
      
      let shouldSelect = false;
      
      if (valueLower === 'yes' && isYesOption) shouldSelect = true;
      if (valueLower === 'no' && isNoOption) shouldSelect = true;
      if (valueLower === 'decline' && (isDeclineOption || isNoOption)) shouldSelect = true;
      
      // Also check for direct value match
      if (value === valueLower || label.includes(valueLower)) shouldSelect = true;
      
      if (shouldSelect) {
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        simulateMouseMove(radio);
        await new Promise(r => setTimeout(r, 50));
        
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('click', { bubbles: true }));
        
        // Click label too
        const labelEl = document.querySelector(`label[for="${radio.id}"]`) || radio.closest('label');
        if (labelEl) smartClick(labelEl);
        
        return true;
      }
    }
    
    return false;
  }
  
  async function handleCheckbox(checkbox, shouldCheck, fieldContext) {
    if (checkbox.checked === shouldCheck) return false;
    
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    simulateMouseMove(checkbox);
    await new Promise(r => setTimeout(r, 50));
    
    checkbox.checked = shouldCheck;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    
    const labelEl = document.querySelector(`label[for="${checkbox.id}"]`) || checkbox.closest('label');
    if (labelEl) smartClick(labelEl);
    
    return true;
  }
  
  function getRadioLabel(radio) {
    if (radio.id) {
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parentLabel = radio.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    
    let parent = radio.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      const text = parent.textContent.trim();
      if (text && text.length < 100) return text;
      parent = parent.parentElement;
    }
    
    return radio.value || '';
  }
  
  async function handleAutocompleteDropdown(input, valueToSelect) {
    // Type the value
    await new Promise(res => humanType(input, valueToSelect, res));
    
    // Wait for dropdown
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    
    // Look for dropdown
    const dropdownSelectors = [
      '[class*="autocomplete"]', '[class*="suggestion"]', '[class*="dropdown"]',
      '[class*="listbox"]', '[role="listbox"]', '[class*="options"]',
      '[class*="menu"]', 'ul[class*="list"]', '[class*="typeahead"]',
      '[class*="combobox"]', '[class*="select"]', '[class*="picker"]'
    ];
    
    for (const selector of dropdownSelectors) {
      const dropdowns = document.querySelectorAll(selector);
      for (const dropdown of dropdowns) {
        if (dropdown.offsetHeight > 0 && dropdown.offsetWidth > 0) {
          const options = dropdown.querySelectorAll('li, [role="option"], [class*="option"], [class*="item"], div[data-value]');
          
          for (const opt of options) {
            if (opt.offsetHeight > 0) {
              const text = opt.textContent.toLowerCase();
              const valueLower = valueToSelect.toLowerCase();
              if (text.includes(valueLower) || valueLower.includes(text.split(',')[0])) {
                await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
                smartClick(opt);
                return true;
              }
            }
          }
          
          // Click first visible option
          const firstOption = Array.from(options).find(o => o.offsetHeight > 0);
          if (firstOption) {
            await new Promise(r => setTimeout(r, 200));
            smartClick(firstOption);
            return true;
          }
        }
      }
    }
    
    // Press Enter/Tab to confirm
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, bubbles: true }));
    
    return true;
  }
  
  // =====================================================
  // FIELD DISCOVERY
  // =====================================================
  
  function findAllFields() {
    // Text inputs
    const textSelectors = [
      'input[type="text"]:not([readonly]):not([disabled]):not([hidden])',
      'input[type="email"]:not([readonly]):not([disabled]):not([hidden])',
      'input[type="tel"]:not([readonly]):not([disabled]):not([hidden])',
      'input[type="url"]:not([readonly]):not([disabled]):not([hidden])',
      'input[type="number"]:not([readonly]):not([disabled]):not([hidden])',
      'input:not([type]):not([readonly]):not([disabled]):not([hidden])',
      'textarea:not([readonly]):not([disabled]):not([hidden])'
    ];
    
    const textFields = Array.from(document.querySelectorAll(textSelectors.join(', ')))
      .filter(el => isVisible(el) && !isExcluded(el));
    
    // Select dropdowns
    const selectFields = Array.from(document.querySelectorAll('select:not([disabled]):not([hidden])'))
      .filter(el => isVisible(el));
    
    // Radio button groups
    const radioGroups = new Map();
    const radios = document.querySelectorAll('input[type="radio"]:not([disabled])');
    radios.forEach(radio => {
      const name = radio.name || radio.id;
      if (name && !radioGroups.has(name)) {
        const container = radio.closest('fieldset, [role="radiogroup"], [role="group"], .form-group, .field, div');
        if (container) radioGroups.set(name, container);
      }
    });
    
    // Checkboxes
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:not([disabled])'))
      .filter(el => isVisible(el));
    
    return { textFields, selectFields, radioGroups, checkboxes };
  }
  
  function isVisible(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
    
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight + 1000 || rect.bottom < -1000) return false;
    
    return true;
  }
  
  function isExcluded(el) {
    const type = el.type?.toLowerCase();
    if (['hidden', 'password', 'search', 'file', 'image', 'button', 'submit', 'reset'].includes(type)) return true;
    
    const name = (el.name || el.id || '').toLowerCase();
    const excludePatterns = /captcha|token|csrf|honeypot|verification|password|secret|card|cvv|ssn|credit/i;
    if (excludePatterns.test(name)) return true;
    
    return false;
  }
  
  // =====================================================
  // MAIN FILL FUNCTION
  // =====================================================
  
  async function fillForm() {
    if (isProcessing) {
      console.log('JobFill: Already processing');
      return { filled: 0 };
    }
    
    isProcessing = true;
    fillCount = 0;
    updateIndicator('🔄 Filling...', '#f59e0b');
    
    const { textFields, selectFields, radioGroups, checkboxes } = findAllFields();
    console.log(`JobFill: Found ${textFields.length} text, ${selectFields.length} select, ${radioGroups.size} radio groups, ${checkboxes.length} checkboxes`);
    
    // Fill text fields
    for (const field of textFields) {
      const value = getFieldValue(field);
      
      if (value && (!field.value || field.value.trim() === '')) {
        const label = getFieldLabel(field);
        console.log(`JobFill: Filling "${label || field.name}" with "${value.substring(0, 30)}..."`);
        
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
        }
        
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 200));
        simulateMouseMove(field);
        await new Promise(r => setTimeout(r, 100));
        
        // Check if autocomplete field
        const hasAutocomplete = field.getAttribute('role') === 'combobox' || 
                                field.getAttribute('aria-autocomplete') ||
                                field.classList.toString().includes('autocomplet') ||
                                fieldPatterns.location.test(label.toLowerCase());
        
        if (hasAutocomplete) {
          await handleAutocompleteDropdown(field, value);
        } else {
          await new Promise(resolve => humanType(field, value, resolve));
        }
        
        fillCount++;
        updateIndicator(`✏️ ${fillCount} filled`, '#14b8a6');
      }
    }
    
    // Fill select dropdowns
    for (const select of selectFields) {
      const value = getFieldValue(select);
      
      if (value && (!select.value || select.selectedIndex <= 0)) {
        console.log(`JobFill: Filling select "${select.name}" with "${value}"`);
        
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
        }
        
        if (await handleSelectDropdown(select, value)) {
          fillCount++;
          updateIndicator(`✏️ ${fillCount} filled`, '#14b8a6');
        }
      }
    }
    
    // Fill radio button groups
    for (const [name, container] of radioGroups) {
      if (!container) continue;
      
      // Check if already answered
      if (container.querySelector('input[type="radio"]:checked')) continue;
      
      const context = getFieldGroupContext(container);
      console.log(`JobFill: Processing radio "${name}": ${context.substring(0, 80)}...`);
      
      let valueToSelect = getYesNoValue(context) || getDemographicValue(context);
      
      if (valueToSelect) {
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
        }
        
        if (await handleRadioButton(container, valueToSelect, context)) {
          fillCount++;
          updateIndicator(`✏️ ${fillCount} filled`, '#14b8a6');
          console.log(`JobFill: Selected "${valueToSelect}" for "${name}"`);
        }
      }
    }
    
    // Fill checkboxes (usually consent/agreement)
    for (const checkbox of checkboxes) {
      if (checkbox.checked) continue;
      
      const context = getFieldGroupContext(checkbox);
      const label = getRadioLabel(checkbox);
      
      // Auto-check consent checkboxes that are required or beneficial
      const shouldCheck = /agree|accept|consent|confirm|acknowledge|certif/i.test(context + label) &&
                          !/marketing|newsletter|promotional|third.party|partner/i.test(context + label);
      
      if (shouldCheck) {
        if (settings?.random_delays) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        }
        
        if (await handleCheckbox(checkbox, true, context)) {
          fillCount++;
          updateIndicator(`✏️ ${fillCount} filled`, '#14b8a6');
        }
      }
    }
    
    isProcessing = false;
    updateIndicator(`✅ ${fillCount} filled`, '#22c55e');
    
    setTimeout(() => {
      updateIndicator('⚡ JobFill Ready', '#14b8a6');
    }, 3000);
    
    if (settings?.save_applications && fillCount > 0) {
      logApplication();
    }
    
    console.log(`JobFill: Complete - ${fillCount} fields filled`);
    return { filled: fillCount };
  }
  
  // =====================================================
  // APPLICATION LOGGING
  // =====================================================
  
  function logApplication() {
    chrome.runtime.sendMessage({
      action: 'logApplication',
      data: {
        company: extractCompanyName() || window.location.hostname,
        position: extractJobTitle() || 'Job Application',
        platform: detectPlatform(),
        status: 'Applied',
        applied_date: new Date().toISOString(),
        job_url: window.location.href,
        auto_filled: true,
        fields_filled: fillCount
      }
    });
  }
  
  function extractJobTitle() {
    const selectors = [
      'h1[class*="title"]', 'h1[class*="job"]', '.job-title', '[data-test*="title"]',
      '.posting-title', '.job-header h1', 'h1', 'h2[class*="title"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) return el.textContent.trim().substring(0, 100);
    }
    return '';
  }
  
  function extractCompanyName() {
    const selectors = [
      '[class*="company"]', '[class*="employer"]', '[data-test*="company"]',
      '.organization', '.company-name', '[class*="brand"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) return el.textContent.trim().substring(0, 50);
    }
    return '';
  }
  
  function detectPlatform() {
    const url = window.location.hostname;
    const platformMap = {
      'linkedin': 'LinkedIn', 'indeed': 'Indeed', 'greenhouse': 'Greenhouse',
      'lever': 'Lever', 'workday': 'Workday', 'glassdoor': 'Glassdoor',
      'ziprecruiter': 'ZipRecruiter', 'dice': 'Dice', 'monster': 'Monster',
      'ycombinator': 'Y Combinator', 'workatastartup': 'Y Combinator',
      'wellfound': 'Wellfound', 'angel.co': 'Wellfound',
      'ashbyhq': 'Ashby', 'simplyhired': 'SimplyHired',
      'careerbuilder': 'CareerBuilder', 'hired': 'Hired', 'triplebyte': 'Triplebyte'
    };
    
    for (const [key, name] of Object.entries(platformMap)) {
      if (url.includes(key)) return name;
    }
    return 'Other';
  }
  
  // =====================================================
  // UI INDICATOR
  // =====================================================
  
  function updateIndicator(text, color) {
    const indicator = document.getElementById('jobfill-indicator');
    if (indicator) {
      indicator.textContent = text;
      indicator.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    }
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
    
    indicator.onclick = () => !isProcessing && fillForm();
    indicator.onmouseenter = () => {
      indicator.style.transform = 'scale(1.05)';
      indicator.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.5)';
    };
    indicator.onmouseleave = () => {
      indicator.style.transform = 'scale(1)';
      indicator.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.4)';
    };
    
    (document.body || document.documentElement).appendChild(indicator);
  }
  
  // =====================================================
  // INITIALIZATION
  // =====================================================
  
  function init() {
    console.log('JobFill AI: Initializing on', window.location.hostname);
    
    chrome.runtime.sendMessage({ action: 'getProfile' }, (response) => {
      if (response?.success) profile = response.profile;
    });
    
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response?.success) settings = response.settings;
    });
    
    // Only show indicator on pages with forms
    if (document.querySelector('form, input, select, textarea')) {
      addIndicator();
    }
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(() => {
      if (!document.getElementById('jobfill-indicator') && document.querySelector('form, input, select, textarea')) {
        addIndicator();
      }
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
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
