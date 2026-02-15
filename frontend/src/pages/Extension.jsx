import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, 
  Download, 
  Copy, 
  Check,
  Chrome,
  FolderOpen,
  Settings,
  Play,
  Code,
  FileJson,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { toast } from 'sonner';

const installSteps = [
  {
    step: 1,
    title: 'Download Extension Files',
    description: 'Download the extension package containing all necessary files',
    icon: Download
  },
  {
    step: 2,
    title: 'Open Chrome Extensions',
    description: 'Navigate to chrome://extensions in your browser',
    icon: Chrome
  },
  {
    step: 3,
    title: 'Enable Developer Mode',
    description: 'Toggle on "Developer mode" in the top right corner',
    icon: Settings
  },
  {
    step: 4,
    title: 'Load Unpacked',
    description: 'Click "Load unpacked" and select the extension folder',
    icon: FolderOpen
  },
  {
    step: 5,
    title: 'Start Using',
    description: 'The extension is ready! Click the icon to configure',
    icon: Play
  }
];

const extensionFiles = {
  'manifest.json': `{
  "manifest_version": 3,
  "name": "JobFill AI - Auto Application Filler",
  "version": "1.0.0",
  "description": "AI-powered job application auto-filler with stealth mode",
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://linkedin.com/*",
    "https://www.indeed.com/*",
    "https://indeed.com/*",
    "https://boards.greenhouse.io/*",
    "https://jobs.lever.co/*",
    "https://*.workday.com/*",
    "https://www.glassdoor.com/*",
    "https://www.ziprecruiter.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/jobs/*",
        "https://linkedin.com/jobs/*",
        "https://www.indeed.com/*",
        "https://boards.greenhouse.io/*",
        "https://jobs.lever.co/*",
        "https://*.workday.com/*",
        "https://www.glassdoor.com/*",
        "https://www.ziprecruiter.com/*"
      ],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,
  'background.js': `// JobFill AI - Background Service Worker
const API_BASE = '${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}';

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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfile') {
    fetch(\`\${API_BASE}/api/profile\`)
      .then(r => r.json())
      .then(data => sendResponse({ success: true, profile: data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ success: true, settings: result.settings });
    });
    return true;
  }
  
  if (request.action === 'analyzeForm') {
    fetch(\`\${API_BASE}/api/ai/analyze-form\`, {
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
    fetch(\`\${API_BASE}/api/applications\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data)
    })
      .then(r => r.json())
      .then(data => sendResponse({ success: true, application: data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});`,
  'content.js': `// JobFill AI - Content Script (Stealth Mode)
(function() {
  'use strict';
  
  let profile = null;
  let settings = null;
  let isProcessing = false;
  
  // Human-like typing simulation
  function humanType(element, text, callback) {
    if (!settings) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      if (callback) callback();
      return;
    }
    
    const minDelay = settings.typing_delay_min || 50;
    const maxDelay = settings.typing_delay_max || 150;
    let index = 0;
    
    function typeChar() {
      if (index < text.length) {
        element.value += text[index];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        index++;
        
        // Random delay between keystrokes
        const delay = settings.random_delays 
          ? minDelay + Math.random() * (maxDelay - minDelay)
          : (minDelay + maxDelay) / 2;
        
        setTimeout(typeChar, delay);
      } else {
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (callback) callback();
      }
    }
    
    // Focus with slight delay
    setTimeout(() => {
      element.focus();
      setTimeout(typeChar, 100 + Math.random() * 200);
    }, 50 + Math.random() * 100);
  }
  
  // Simulate mouse movement to element
  function simulateMouseMove(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const moveEvent = new MouseEvent('mousemove', {
      clientX: centerX + (Math.random() - 0.5) * 10,
      clientY: centerY + (Math.random() - 0.5) * 10,
      bubbles: true
    });
    
    element.dispatchEvent(moveEvent);
  }
  
  // Field detection patterns
  const fieldPatterns = {
    firstName: /first[_-]?name|fname|given[_-]?name/i,
    lastName: /last[_-]?name|lname|surname|family[_-]?name/i,
    fullName: /full[_-]?name|name|applicant[_-]?name/i,
    email: /e?-?mail|email[_-]?address/i,
    phone: /phone|tel|mobile|cell/i,
    linkedin: /linkedin|linked[_-]?in/i,
    location: /location|city|address/i,
    website: /website|portfolio|url/i
  };
  
  // Match field to profile data
  function getFieldValue(field) {
    const name = (field.name || field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const label = getFieldLabel(field);
    const combined = name + ' ' + placeholder + ' ' + label;
    
    if (!profile || !profile.personal_info) return null;
    
    const pi = profile.personal_info;
    
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
  
  // Get field label
  function getFieldLabel(field) {
    const label = document.querySelector(\`label[for="\${field.id}"]\`);
    if (label) return label.textContent.toLowerCase();
    
    const parent = field.closest('.form-group, .field, .input-wrapper');
    if (parent) {
      const labelEl = parent.querySelector('label');
      if (labelEl) return labelEl.textContent.toLowerCase();
    }
    
    return '';
  }
  
  // Find all fillable fields
  function findFields() {
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input:not([type])',
      'textarea'
    ];
    
    return Array.from(document.querySelectorAll(selectors.join(', ')))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !el.disabled && 
               !el.readOnly;
      });
  }
  
  // Fill form with human-like behavior
  async function fillForm() {
    if (isProcessing) return;
    isProcessing = true;
    
    const fields = findFields();
    let filledCount = 0;
    
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = getFieldValue(field);
      
      if (value && !field.value) {
        // Random delay before each field
        await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
        
        // Simulate mouse movement
        simulateMouseMove(field);
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        
        // Type with human-like speed
        await new Promise(resolve => {
          humanType(field, value, resolve);
        });
        
        filledCount++;
      }
    }
    
    isProcessing = false;
    
    // Notify popup about completion
    chrome.runtime.sendMessage({
      action: 'fillComplete',
      count: filledCount
    });
    
    return filledCount;
  }
  
  // Initialize
  async function init() {
    // Get profile from background
    chrome.runtime.sendMessage({ action: 'getProfile' }, (response) => {
      if (response?.success) {
        profile = response.profile;
      }
    });
    
    // Get settings
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response?.success) {
        settings = response.settings;
      }
    });
  }
  
  // Listen for fill command from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillNow') {
      fillForm().then(count => {
        sendResponse({ success: true, filled: count });
      });
      return true;
    }
    
    if (request.action === 'updateProfile') {
      profile = request.profile;
      sendResponse({ success: true });
    }
  });
  
  // Initialize on load
  init();
  
  // Add visual indicator
  const indicator = document.createElement('div');
  indicator.id = 'jobfill-indicator';
  indicator.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #14b8a6, #0ea5e9);
    color: white;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
    z-index: 999999;
    cursor: pointer;
    transition: all 0.2s ease;
  \`;
  indicator.textContent = '⚡ JobFill Ready';
  indicator.addEventListener('click', () => fillForm());
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.05)';
  });
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  // Add indicator after page load
  if (document.readyState === 'complete') {
    document.body.appendChild(indicator);
  } else {
    window.addEventListener('load', () => {
      document.body.appendChild(indicator);
    });
  }
})();`,
  'popup.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1419;
      color: #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #14b8a6, #0ea5e9);
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 12px;
      opacity: 0.9;
    }
    .content {
      padding: 16px;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #1a2332;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 12px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #14b8a6, #0ea5e9);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
    }
    .btn-secondary {
      background: #1a2332;
      color: #e5e7eb;
      border: 1px solid #2d3748;
    }
    .btn-secondary:hover {
      background: #2d3748;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: #1a2332;
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .toggle-label {
      font-size: 13px;
    }
    .toggle {
      width: 44px;
      height: 24px;
      background: #2d3748;
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle.active {
      background: #14b8a6;
    }
    .toggle::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    .toggle.active::after {
      transform: translateX(20px);
    }
    .footer {
      padding: 12px 16px;
      border-top: 1px solid #2d3748;
      text-align: center;
    }
    .footer a {
      color: #14b8a6;
      text-decoration: none;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ JobFill AI</h1>
    <p>Auto-Fill Job Applications</p>
  </div>
  <div class="content">
    <div class="status">
      <div class="status-dot"></div>
      <span>Extension Active</span>
    </div>
    <button class="btn btn-primary" id="fillBtn">
      Fill Application Now
    </button>
    <button class="btn btn-secondary" id="dashboardBtn">
      Open Dashboard
    </button>
    <div class="toggle-row">
      <span class="toggle-label">Auto-Fill Enabled</span>
      <div class="toggle active" id="enableToggle"></div>
    </div>
    <div class="toggle-row">
      <span class="toggle-label">Stealth Mode</span>
      <div class="toggle active" id="stealthToggle"></div>
    </div>
  </div>
  <div class="footer">
    <a href="${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}" target="_blank">
      Manage Profile & Settings →
    </a>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,
  'popup.js': `document.getElementById('fillBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'fillNow' }, (response) => {
      if (response?.success) {
        document.getElementById('fillBtn').textContent = \`✓ Filled \${response.filled} fields\`;
        setTimeout(() => {
          document.getElementById('fillBtn').textContent = 'Fill Application Now';
        }, 2000);
      }
    });
  });
});

document.getElementById('dashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: '${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}' });
});

document.getElementById('enableToggle').addEventListener('click', function() {
  this.classList.toggle('active');
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.enabled = this.classList.contains('active');
    chrome.storage.local.set({ settings });
  });
});

document.getElementById('stealthToggle').addEventListener('click', function() {
  this.classList.toggle('active');
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings.random_delays = this.classList.contains('active');
    chrome.storage.local.set({ settings });
  });
});`,
  'content.css': `#jobfill-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #14b8a6, #0ea5e9);
  color: white;
  border-radius: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  z-index: 999999;
  cursor: pointer;
  transition: all 0.2s ease;
}

#jobfill-indicator:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}`
};

export default function Extension() {
  const [copiedFile, setCopiedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('install');

  const copyToClipboard = (filename, content) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    toast.success(`${filename} copied to clipboard!`);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadExtension = () => {
    // Download the actual zip file from the backend
    const API_URL = process.env.REACT_APP_BACKEND_URL || '';
    window.open(`${API_URL}/api/extension/download`, '_blank');
    toast.success('Extension download started!');
  };

  const downloadInstructions = () => {
    const instructions = `
JobFill AI Chrome Extension - Installation Guide
=================================================

QUICK INSTALL:
1. Download the extension zip file using "Download Extension" button
2. Extract the zip file to a folder
3. Add icon images to the "icons" folder:
   - Go to https://favicon.io/emoji-favicons/high-voltage/
   - Download all sizes and rename to icon16.png, icon48.png, icon128.png
4. Open Chrome and go to chrome://extensions
5. Enable "Developer mode" (toggle in top right)
6. Click "Load unpacked" and select the extracted folder
7. The extension is ready to use!

USAGE:
- Navigate to any job application page (LinkedIn, Indeed, etc.)
- Click the floating "⚡ JobFill Ready" button, OR
- Click the extension icon in Chrome toolbar

DASHBOARD:
Access your profile and settings at:
${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}

SUPPORTED PLATFORMS:
- LinkedIn Jobs
- Indeed
- Greenhouse
- Lever
- Workday
- Glassdoor
- ZipRecruiter
    `;
    
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobfill-extension-instructions.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Instructions downloaded!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Chrome Extension</h1>
          <p className="text-muted-foreground mt-1">Install and configure the auto-fill extension</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={downloadExtension} className="gap-2 gradient-primary text-primary-foreground">
            <Download className="w-4 h-4" />
            Download Extension
          </Button>
          <Button onClick={downloadInstructions} variant="outline" className="gap-2">
            <Info className="w-4 h-4" />
            Instructions
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="install" className="gap-2">
              <Chrome className="w-4 h-4" />
              Installation
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Code className="w-4 h-4" />
              Extension Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="install">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-primary" />
                  Installation Steps
                </CardTitle>
                <CardDescription>Follow these steps to install the Chrome extension</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-muted/20"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <step.icon className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Important Notes:</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• Make sure this dashboard is running for the extension to work</li>
                        <li>• The extension uses stealth mode to avoid detection</li>
                        <li>• Your profile data syncs automatically with the extension</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-accent" />
                  Extension Source Files
                </CardTitle>
                <CardDescription>Copy these files to create your extension folder</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {Object.entries(extensionFiles).map(([filename, content]) => (
                    <AccordionItem key={filename} value={filename} className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <FileJson className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{filename}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(filename, content)}
                            className="absolute top-2 right-2 gap-2"
                          >
                            {copiedFile === filename ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </Button>
                          <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto text-xs font-mono text-muted-foreground max-h-96">
                            {content}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Features Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Extension Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Human-like Typing', desc: 'Simulates natural typing speed and patterns' },
                { title: 'Random Delays', desc: 'Adds micro-pauses between actions' },
                { title: 'Mouse Simulation', desc: 'Mimics mouse movements before filling' },
                { title: 'AI Field Matching', desc: 'Intelligently maps your data to form fields' },
                { title: 'Multi-Platform', desc: 'Works on LinkedIn, Indeed, Greenhouse, and more' },
                { title: 'Auto-Tracking', desc: 'Logs applications to your dashboard' },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
