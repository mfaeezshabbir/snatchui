import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  DocumentDuplicateIcon, 
  ArrowDownTrayIcon,
  CodeBracketIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const App = () => {
  const [isActive, setIsActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [extractedComponent, setExtractedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('html');
  const [exportFormat, setExportFormat] = useState('html');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    preserveTailwind: true,
    includeInlineStyles: true,
    highlightColor: '#3b82f6'
  });

  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(['snatchSettings'], (result) => {
      if (result.snatchSettings) {
        setSettings(result.snatchSettings);
      }
    });

    // Listen for messages from content script
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === 'elementSelected') {
        setSelectedElement(request.elementInfo);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };

  const toggleSelector = async () => {
    try {
      const tab = await getCurrentTab();
      
      // Check if we can access the tab
      if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        alert('Cannot use Snatch UI on this page. Please navigate to a regular webpage.');
        return;
      }
      
      if (isActive) {
        // Deactivate selector
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'deactivateSelector' });
        } catch (error) {
          console.warn('Content script might not be ready:', error);
        }
        setIsActive(false);
        setSelectedElement(null);
      } else {
        // Ensure content script is injected and ready
        try {
          // First, try to ping the content script
          await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        } catch (error) {
          // If content script is not responding, inject it manually
          console.log('Injecting content script...');
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['src/content/selector.js']
            });
            
            // Wait a moment for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (injectError) {
            console.error('Failed to inject content script:', injectError);
            alert('Failed to inject content script. Please refresh the page and try again.');
            return;
          }
        }
        
        // Now activate selector
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'activateSelector' });
          setIsActive(true);
        } catch (error) {
          console.error('Failed to activate selector:', error);
          alert('Failed to activate selector. Please refresh the page and try again.');
        }
      }
    } catch (error) {
      console.error('Failed to toggle selector:', error);
      alert('Error: ' + error.message);
    }
  };

  const extractComponent = async () => {
    if (!selectedElement) return;

    setIsLoading(true);
    try {
      const tab = await getCurrentTab();
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractSelected' });
      
      if (response.success) {
        setExtractedComponent(response.data);
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Failed to extract component:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // Show success feedback
      const button = document.activeElement;
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadComponent = () => {
    if (!extractedComponent) return;

    const exports = extractedComponent.exports;
    const timestamp = new Date().toISOString().slice(0, 10);
    
    if (exportFormat === 'html') {
      downloadFile(exports.html.combined, `component-${timestamp}.html`);
    } else if (exportFormat === 'jsx') {
      downloadFile(exports.jsx.component, `Component-${timestamp}.jsx`);
    } else if (exportFormat === 'tailwind') {
      downloadFile(exports.tailwindJSX.component, `TailwindComponent-${timestamp}.jsx`);
    }
  };

  const renderCodePreview = () => {
    if (!extractedComponent) return null;

    const exports = extractedComponent.exports;
    let content = '';
    let language = 'html';

    switch (activeTab) {
      case 'html':
        content = exports.html.html;
        language = 'html';
        break;
      case 'css':
        content = extractedComponent.styles.customCSS || '/* No custom CSS found */';
        language = 'css';
        break;
      case 'jsx':
        content = exports.jsx.jsx;
        language = 'jsx';
        break;
      case 'tailwind':
        content = exports.tailwindJSX.jsx;
        language = 'jsx';
        break;
      default:
        content = extractedComponent.html;
    }

    return (
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
        <pre className="text-sm text-gray-100 whitespace-pre-wrap">
          <code>{content}</code>
        </pre>
      </div>
    );
  };

  const renderElementInfo = () => {
    if (!selectedElement) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <EyeIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Selected Element</span>
        </div>
        <div className="text-sm text-blue-700">
          <div className="font-mono">
            {selectedElement.tagName}
            {selectedElement.id && `#${selectedElement.id}`}
            {selectedElement.classes.length > 0 && `.${selectedElement.classes.slice(0, 3).join('.')}`}
            {selectedElement.classes.length > 3 && '...'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6" />
            <h1 className="text-lg font-semibold">Snatch UI</h1>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Selector Controls */}
        <div className="space-y-3">
          <button
            onClick={toggleSelector}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isActive ? (
              <>
                <StopIcon className="w-5 h-5" />
                Stop Selecting
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Start Selecting
              </>
            )}
          </button>

          {renderElementInfo()}

          {selectedElement && (
            <button
              onClick={extractComponent}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <CodeBracketIcon className="w-5 h-5" />
              {isLoading ? 'Extracting...' : 'Extract Component'}
            </button>
          )}
        </div>

        {/* Component Preview */}
        {extractedComponent && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'preview', label: 'Preview' },
                { id: 'html', label: 'HTML' },
                { id: 'css', label: 'CSS' },
                { id: 'jsx', label: 'JSX' },
                { id: 'tailwind', label: 'Tailwind' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'preview' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Component Preview:</div>
                  <div 
                    className="bg-white border rounded p-2"
                    dangerouslySetInnerHTML={{ __html: extractedComponent.html }}
                  />
                </div>
              )}

              {activeTab !== 'preview' && activeTab !== 'settings' && renderCodePreview()}
            </div>

            {/* Export Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format:
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="html">HTML + CSS</option>
                  <option value="jsx">React Component</option>
                  <option value="tailwind">Tailwind JSX</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    let content = '';
                    if (exportFormat === 'html') {
                      content = extractedComponent.exports.html.combined;
                    } else if (exportFormat === 'jsx') {
                      content = extractedComponent.exports.jsx.component;
                    } else if (exportFormat === 'tailwind') {
                      content = extractedComponent.exports.tailwindJSX.component;
                    }
                    copyToClipboard(content);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={downloadComponent}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.preserveTailwind}
                  onChange={(e) => {
                    const newSettings = { ...settings, preserveTailwind: e.target.checked };
                    setSettings(newSettings);
                    chrome.storage.sync.set({ snatchSettings: newSettings });
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Preserve Tailwind classes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeInlineStyles}
                  onChange={(e) => {
                    const newSettings = { ...settings, includeInlineStyles: e.target.checked };
                    setSettings(newSettings);
                    chrome.storage.sync.set({ snatchSettings: newSettings });
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Include inline styles</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlight Color:
                </label>
                <input
                  type="color"
                  value={settings.highlightColor}
                  onChange={(e) => {
                    const newSettings = { ...settings, highlightColor: e.target.value };
                    setSettings(newSettings);
                    chrome.storage.sync.set({ snatchSettings: newSettings });
                  }}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isActive && !extractedComponent && (
          <div className="text-center text-gray-500 text-sm space-y-2">
            <p>Click "Start Selecting" to begin</p>
            <p>Hover over elements and click to select</p>
            <p>Extract components as HTML, JSX, or Tailwind</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
