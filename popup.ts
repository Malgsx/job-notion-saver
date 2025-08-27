// Popup script for settings + saving current job from the active tab

document.addEventListener('DOMContentLoaded', () => {
  const notionTokenInput = document.getElementById('notionToken') as HTMLInputElement;
  const databaseIdInput = document.getElementById('databaseId') as HTMLInputElement;
  const saveSettingsBtn = document.getElementById('saveSettings') as HTMLButtonElement;
  const settingsStatus = document.getElementById('settingsStatus') as HTMLDivElement;

  const saveCurrentJobBtn = document.getElementById('saveCurrentJob') as HTMLButtonElement | null;
  const jobStatus = document.getElementById('jobStatus') as HTMLDivElement | null;
  const saveHint = document.getElementById('saveHint') as HTMLDivElement | null;

  // Load existing settings and prepare save button state
  void loadSettings();
  void prepareSaveButton();

  // Save settings
  saveSettingsBtn.addEventListener('click', async () => {
    const notionToken = notionTokenInput.value.trim();
    const dbIdRaw = databaseIdInput.value.trim();

    if (!notionToken || !dbIdRaw) {
      showSettingsStatus('Please fill in both fields', 'error');
      return;
    }

    const normalized = normalizeNotionId(dbIdRaw);
    if (!normalized) {
      showSettingsStatus('Invalid database ID format', 'error');
      return;
    }

    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Saving...';

    try {
      await chrome.runtime.sendMessage({ action: 'saveSettings', notionToken, databaseId: normalized });
      showSettingsStatus('Settings saved successfully!', 'success');
      // keep the popup open so user can save immediately
    } catch (error: any) {
      showSettingsStatus(`Error: ${error.message}`, 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Settings';
      void prepareSaveButton();
    }
  });

  // Save current job from active tab
  if (saveCurrentJobBtn) {
    saveCurrentJobBtn.addEventListener('click', async () => {
      if (!jobStatus) return;
      jobStatus.className = '';
      jobStatus.textContent = '';

      // Verify settings first
      const settingsResp = await chrome.runtime.sendMessage({ action: 'getSettings' });
      const settings = settingsResp?.settings;
      if (!settings?.notionToken || !settings?.databaseId) {
        showJobStatus('Please configure your Notion token and database first.', 'error');
        return;
      }

      // Get the active tab
      const tab = await getActiveTab();
      if (!tab?.id || !tab.url) {
        showJobStatus('No active tab found.', 'error');
        return;
      }

      if (!isSupportedUrl(tab.url)) {
        showJobStatus('Open a supported job posting page.', 'error');
        return;
      }

      saveCurrentJobBtn.disabled = true;
      const prevText = saveCurrentJobBtn.textContent;
      saveCurrentJobBtn.textContent = 'Saving...';

      try {
        // Ask content script to extract job data
        const extract = await sendToTab(tab.id, { action: 'extractJob' });
        if (!extract || extract.error || !extract.jobData) {
          showJobStatus(extract?.error || 'Could not extract job data from this page.', 'error');
          return;
        }

        // Save via background
        const saveResp = await chrome.runtime.sendMessage({ action: 'saveJob', jobData: extract.jobData });
        if (saveResp?.success) {
          showJobStatus('Saved to Notion!', 'success');
        } else {
          showJobStatus(saveResp?.error || 'Save failed.', 'error');
        }
      } catch (e: any) {
        const msg = e?.message || String(e) || 'Unexpected error.';
        // common MV3 error if content script not present
        if (msg.includes('Receiving end does not exist')) {
          showJobStatus('This tab is not a supported job page.', 'error');
        } else {
          showJobStatus(msg, 'error');
        }
      } finally {
        saveCurrentJobBtn.disabled = false;
        saveCurrentJobBtn.textContent = prevText || 'Save to Notion';
      }
    });
  }

  async function loadSettings(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response.settings) {
        notionTokenInput.value = response.settings.notionToken || '';
        databaseIdInput.value = response.settings.databaseId || '';
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function prepareSaveButton(): Promise<void> {
    if (!saveCurrentJobBtn || !saveHint) return;
    try {
      const tab = await getActiveTab();
      const ok = !!tab?.url && isSupportedUrl(tab.url);
      saveCurrentJobBtn.disabled = !ok;
      saveHint.style.display = ok ? 'none' : 'block';
    } catch {
      saveCurrentJobBtn.disabled = true;
      saveHint.style.display = 'block';
    }
  }

  function isSupportedUrl(url: string): boolean {
    return /linkedin\.com\/jobs|indeed\.com|glassdoor\.com|monster\.com|dice\.com/.test(url);
  }

  function showSettingsStatus(message: string, type: 'success' | 'error'): void {
    settingsStatus.className = `status ${type}`;
    settingsStatus.textContent = message;
  }

  function showJobStatus(message: string, type: 'success' | 'error'): void {
    if (!jobStatus) return;
    jobStatus.className = `status ${type}`;
    jobStatus.textContent = message;
  }

  // Accept dashed UUID or 32 hex, normalize to dashed lowercase UUID
  function normalizeNotionId(id: string): string | null {
    const undashed = id.replace(/-/g, '').toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(undashed)) return null;
    const dashed = `${undashed.slice(0,8)}-${undashed.slice(8,12)}-${undashed.slice(12,16)}-${undashed.slice(16,20)}-${undashed.slice(20)}`;
    return dashed;
  }

  function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0]));
    });
  }

  function sendToTab(tabId: number, msg: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, msg, (response) => {
        const lastErr = chrome.runtime.lastError;
        if (lastErr) {
          reject(new Error(lastErr.message));
        } else {
          resolve(response);
        }
      });
    });
  }
});
