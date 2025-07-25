// Background service worker for Snatch UI extension
// Handles extension lifecycle and communication between components

console.log('Snatch UI background service worker loaded');

// Extension installation and startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Snatch UI installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      snatchSettings: {
        defaultExportFormat: 'html',
        preserveTailwind: true,
        includeInlineStyles: true,
        highlightColor: '#3b82f6'
      }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'activateSelector':
      handleActivateSelector(sender.tab.id);
      break;
      
    case 'deactivateSelector':
      handleDeactivateSelector(sender.tab.id);
      break;
      
    case 'extractComponent':
      handleExtractComponent(request.data, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'saveComponent':
      handleSaveComponent(request.data);
      break;
      
    default:
      console.warn('Unknown action:', request.action);
  }
});

async function handleActivateSelector(tabId) {
  try {
    // Inject selector if not already present
    await chrome.scripting.executeScript({
      target: { tabId },
      func: activateSelectorOnPage
    });
  } catch (error) {
    console.error('Failed to activate selector:', error);
  }
}

async function handleDeactivateSelector(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: deactivateSelectorOnPage
    });
  } catch (error) {
    console.error('Failed to deactivate selector:', error);
  }
}

function handleExtractComponent(data, sendResponse) {
  // Process the extracted component data
  const processedComponent = {
    ...data,
    timestamp: new Date().toISOString(),
    id: generateComponentId()
  };
  
  // Save to storage
  chrome.storage.local.get(['extractedComponents'], (result) => {
    const components = result.extractedComponents || [];
    components.unshift(processedComponent); // Add to beginning
    
    // Keep only last 50 components
    if (components.length > 50) {
      components.splice(50);
    }
    
    chrome.storage.local.set({ extractedComponents: components }, () => {
      sendResponse({ success: true, component: processedComponent });
    });
  });
}

function handleSaveComponent(data) {
  // Save component to user's collection
  chrome.storage.sync.get(['savedComponents'], (result) => {
    const saved = result.savedComponents || [];
    saved.unshift({
      ...data,
      savedAt: new Date().toISOString()
    });
    
    chrome.storage.sync.set({ savedComponents: saved });
  });
}

function generateComponentId() {
  return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Functions to be injected into content script context
function activateSelectorOnPage() {
  if (window.snatchUISelector) {
    window.snatchUISelector.activate();
  }
}

function deactivateSelectorOnPage() {
  if (window.snatchUISelector) {
    window.snatchUISelector.deactivate();
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (this is handled automatically by manifest action.default_popup)
  console.log('Extension icon clicked on tab:', tab.id);
});
