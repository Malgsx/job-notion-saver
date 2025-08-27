// Popup script for settings management

document.addEventListener('DOMContentLoaded', () => {
  const notionTokenInput = document.getElementById('notionToken') as HTMLInputElement;
  const databaseIdInput = document.getElementById('databaseId') as HTMLInputElement;
  const saveSettingsBtn = document.getElementById('saveSettings') as HTMLButtonElement;
  const settingsStatus = document.getElementById('settingsStatus') as HTMLDivElement;

  // Load existing settings
  loadSettings();

  // Save settings
  saveSettingsBtn.addEventListener('click', async () => {
    const notionToken = notionTokenInput.value.trim();
    let databaseIdInputVal = databaseIdInput.value.trim();

    if (!notionToken || !databaseIdInputVal) {
      showStatus('Please fill in both fields', 'error');
      return;
    }

    const normalized = normalizeNotionId(databaseIdInputVal);
    if (!normalized) {
      showStatus('Invalid database ID format', 'error');
      return;
    }

    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Saving...';

    try {
      await chrome.runtime.sendMessage({
        action: 'saveSettings',
        notionToken,
        databaseId: normalized
      });

      showStatus('Settings saved successfully!', 'success');
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error: any) {
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Settings';
    }
  });

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

  function showStatus(message: string, type: 'success' | 'error'): void {
    settingsStatus.className = `status ${type}`;
    settingsStatus.textContent = message;
  }

  // Accept dashed UUID or 32 hex, normalize to dashed lowercase UUID
  function normalizeNotionId(id: string): string | null {
    const undashed = id.replace(/-/g, '').toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(undashed)) return null;
    const dashed = `${undashed.slice(0,8)}-${undashed.slice(8,12)}-${undashed.slice(12,16)}-${undashed.slice(16,20)}-${undashed.slice(20)}`;
    return dashed;
  }
});
