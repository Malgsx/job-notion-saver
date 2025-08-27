// Background script for Notion API integration

import { Client } from '@notionhq/client';

// Initialize Notion client
let notion: Client | null = null;

function initializeNotionClient(token: string): void {
  notion = new Client({ auth: token });
}

// Get stored settings
async function getSettings(): Promise<{ notionToken: string; databaseId: string } | null> {
  try {
    const result = await chrome.storage.sync.get(['notionToken', 'databaseId']);
    if (result.notionToken && result.databaseId) {
      return {
        notionToken: result.notionToken,
        databaseId: result.databaseId
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
}

// Map Notion API errors to user-friendly messages
function toFriendlyErrorMessage(err: any): string {
  try {
    const code = err?.code || err?.body?.code;
    const status = err?.status || err?.body?.status;

    if (code === 'unauthorized' || status === 401) {
      return 'Unauthorized: Check your Notion integration token.';
    }
    if (code === 'object_not_found' || status === 404) {
      return 'Database not found or not shared with the integration.';
    }
    if (code === 'validation_error' || status === 400) {
      return 'Validation error: Check database property names and types.';
    }
    if (code === 'rate_limited' || status === 429) {
      return 'Rate limited by Notion. Please try again in a moment.';
    }
  } catch {
    // ignore mapping failures
  }
  return (err && (err.message || String(err))) || 'Unknown error while saving to Notion.';
}

// Save job to Notion
async function saveJobToNotion(jobData: any): Promise<void> {
  const settings = await getSettings();
  if (!settings) {
    throw new Error('Notion settings not configured. Open the extension popup to save your token and database ID.');
  }

  if (!notion) {
    initializeNotionClient(settings.notionToken);
  }

  if (!notion) {
    throw new Error('Failed to initialize Notion client');
  }

  try {
    await notion.pages.create({
      parent: { database_id: settings.databaseId },
      properties: {
        'Job Title': {
          title: [
            {
              text: {
                content: jobData.title
              }
            }
          ]
        },
        'Company': {
          rich_text: [
            {
              text: {
                content: jobData.company
              }
            }
          ]
        },
        'Location': {
          rich_text: [
            {
              text: {
                content: jobData.location || 'Not specified'
              }
            }
          ]
        },
        'URL': {
          url: jobData.url
        },
        'Date Applied': {
          date: {
            start: new Date().toISOString().split('T')[0]
          }
        },
        'Status': {
          select: {
            name: 'Applied'
          }
        },
        'Description': {
          rich_text: [
            {
              text: {
                content: jobData.description || 'No description available'
              }
            }
          ]
        }
      }
    });
  } catch (error: any) {
    console.error('Error saving to Notion:', error);
    throw new Error(toFriendlyErrorMessage(error));
  }
}

// Handle messages from content script / popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveJob') {
    saveJobToNotion(request.jobData)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getSettings') {
    getSettings()
      .then((settings) => {
        sendResponse({ settings });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({
      notionToken: request.notionToken,
      databaseId: request.databaseId
    })
      .then(() => {
        // reset client in case token changed
        notion = null;
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Notion Saver extension installed');
});
