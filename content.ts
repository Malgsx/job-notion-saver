// Content script for job page detection and data extraction

interface JobData {
title: string;
company: string;
location: string;
description: string;
url: string;
datePosted?: string;
salary?: string;
}

// Extract job data from page
function extractJobData(): JobData | null {
const url = window.location.href;

// LinkedIn job extraction
if (url.includes('linkedin.com')) {
return extractLinkedInJob() || extractGenericJob();
}

// Indeed job extraction
  if (url.includes('indeed.com')) {
  return extractIndeedJob() || extractGenericJob();
  }

  // Glassdoor job extraction
  if (url.includes('glassdoor.com')) {
  return extractGlassdoorJob() || extractGenericJob();
  }

// Monster job extraction
if (url.includes('monster.com')) {
  return extractMonsterJob() || extractGenericJob();
  }

// Dice job extraction
if (url.includes('dice.com')) {
  return extractDiceJob() || extractGenericJob();
  }

return extractGenericJob();
}

function extractLinkedInJob(): JobData | null {
try {
  const title = document.querySelector('h1[data-test-id="job-title"]')?.textContent?.trim() ||
             document.querySelector('h1')?.textContent?.trim() || '';

    const company = (document.querySelector('a[data-test-id="company-name"]') as HTMLElement)?.innerText?.trim() ||
                 (document.querySelector('.job-details-jobs-unified-top-card__company-name') as HTMLElement)?.innerText?.trim() || '';

const location = (document.querySelector('span[data-test-id="job-location"]') as HTMLElement)?.innerText?.trim() ||
                  (document.querySelector('.job-details-jobs-unified-top-card__bullet') as HTMLElement)?.innerText?.trim() || '';

  const description = (document.querySelector('#job-details') as HTMLElement)?.innerText?.trim() ||
                       (document.querySelector('.job-details-jobs-unified-top-card__description') as HTMLElement)?.innerText?.trim() || '';

    if (!title || !company) return null;

return {
title,
      company,
  location: location || '',
description: description || '',
      url: window.location.href
};
} catch (error) {
    console.error('Error extracting LinkedIn job data:', error);
return null;
}
}

function extractIndeedJob(): JobData | null {
try {
const title = document.querySelector('h1[data-testid="job-title"]')?.textContent?.trim() ||
           document.querySelector('h1')?.textContent?.trim() || '';

const company = document.querySelector('[data-testid="company-name"]')?.textContent?.trim() ||
             document.querySelector('.companyName')?.textContent?.trim() || '';

  const location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim() ||
                document.querySelector('.companyLocation')?.textContent?.trim() || '';

  const description = (document.querySelector('#jobDescriptionText') as HTMLElement)?.innerText?.trim() ||
                       (document.querySelector('.jobsearch-JobMetadataHeader-item') as HTMLElement)?.innerText?.trim() || '';

    if (!title || !company) return null;

return {
title,
      company,
  location: location || '',
description: description || '',
      url: window.location.href
};
} catch (error) {
    console.error('Error extracting Indeed job data:', error);
return null;
}
}

function extractGlassdoorJob(): JobData | null {
try {
const title = document.querySelector('h1[data-test="job-title"]')?.textContent?.trim() ||
           document.querySelector('h1')?.textContent?.trim() || '';

const company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim() ||
             document.querySelector('.employerName')?.textContent?.trim() || '';

  const location = document.querySelector('[data-test="location"]')?.textContent?.trim() ||
                document.querySelector('.location')?.textContent?.trim() || '';

  const description = (document.querySelector('[data-test="job-description"]') as HTMLElement)?.innerText?.trim() ||
                       (document.querySelector('.jobDescriptionContent') as HTMLElement)?.innerText?.trim() || '';

    if (!title || !company) return null;

return {
title,
      company,
  location: location || '',
description: description || '',
      url: window.location.href
};
} catch (error) {
    console.error('Error extracting Glassdoor job data:', error);
return null;
}
}

function extractMonsterJob(): JobData | null {
try {
const title = document.querySelector('h1[data-testid="jobTitle"]')?.textContent?.trim() ||
           document.querySelector('h1.title')?.textContent?.trim() ||
           document.querySelector('h1')?.textContent?.trim() || '';

const company = document.querySelector('[data-testid="companyName"]')?.textContent?.trim() ||
               document.querySelector('.company')?.textContent?.trim() ||
                 document.querySelector('[itemprop="hiringOrganization"]')?.textContent?.trim() || '';

const location = document.querySelector('[data-testid="location"]')?.textContent?.trim() ||
                  document.querySelector('.location')?.textContent?.trim() || '';

    const description = (document.querySelector('[data-testid="jobDescription"]') as HTMLElement)?.innerText?.trim() ||
                       (document.querySelector('#JobDescription') as HTMLElement)?.innerText?.trim() || '';

if (!title || !company) return null;

return {
      title,
  company,
location: location || '',
description: description || '',
      url: window.location.href
};
} catch (error) {
    console.error('Error extracting Monster job data:', error);
return null;
}
}

function extractDiceJob(): JobData | null {
try {
const title = document.querySelector('h1[data-cy="jobTitle"]')?.textContent?.trim() ||
           document.querySelector('h1')?.textContent?.trim() || '';

const company = document.querySelector('[data-cy="companyName"]')?.textContent?.trim() ||
             document.querySelector('.employer')?.textContent?.trim() || '';

  const location = document.querySelector('[data-cy="jobLocation"]')?.textContent?.trim() ||
                document.querySelector('.location')?.textContent?.trim() || '';

  const description = (document.querySelector('[data-cy="jobDescription"]') as HTMLElement)?.innerText?.trim() ||
                       (document.querySelector('#jobdescSec') as HTMLElement)?.innerText?.trim() || '';

    if (!title || !company) return null;

return {
title,
      company,
  location: location || '',
description: description || '',
      url: window.location.href
};
} catch (error) {
    console.error('Error extracting Dice job data:', error);
return null;
}
}

function extractGenericJob(): JobData | null {
try {
const title = document.querySelector('h1')?.textContent?.trim() ||
            document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() || '';

// Try to infer company from common patterns or site name
const companyCandidates: string[] = [];
const companySelTexts = [
    '[data-testid="company-name"]', '.company', '.companyName', '.employerName',
  'a[data-test-id="company-name"]', '[itemprop="hiringOrganization"]',
];
  for (const sel of companySelTexts) {
      const t = (document.querySelector(sel) as HTMLElement)?.innerText?.trim();
      if (t) companyCandidates.push(t);
    }
  const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')?.trim();
const company = companyCandidates.find(Boolean) || siteName || '';

    const location = (document.querySelector('[data-testid="job-location"], .location, [data-test="location"]') as HTMLElement)?.innerText?.trim() || '';

const desc = (document.querySelector('#job-details, [data-test="job-description"], #jobDescriptionText, .jobDescriptionContent') as HTMLElement)?.innerText?.trim() ||
             document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

if (!title || !company) return null;

return {
title,
company,
  location,
  description: desc,
  url: window.location.href,
    };
} catch (e) {
    console.error('Error in generic extractor:', e);
return null;
}
}

// Create save button (styling is in content.css)
function createSaveButton(): void {
if (document.getElementById('job-notion-save-btn')) return;

const button = document.createElement('button');
button.id = 'job-notion-save-btn';
button.textContent = 'Save to Notion';

button.addEventListener('click', async () => {
const jobData = extractJobData();
if (jobData) {
    button.textContent = 'Saving...';
      button.disabled = true;

      try {
        const resp = await chrome.runtime.sendMessage({ action: 'saveJob', jobData });
      if (resp && resp.success) {
          button.textContent = 'Saved!';
      } else {
        button.textContent = resp?.error ? `Error: ${resp.error}` : 'Error - Try Again';
      }
      } catch (error) {
      console.error('Error saving job:', error);
    button.textContent = 'Error - Try Again';
  } finally {
  setTimeout(() => {
    button.textContent = 'Save to Notion';
          button.disabled = false;
  }, 2000);
}
} else {
alert('Could not extract job data from this page.');
}
});

document.body.appendChild(button);
}

function showSettingsReminder(): void {
if (document.getElementById('job-notion-settings-reminder')) return;
const note = document.createElement('div');
note.id = 'job-notion-settings-reminder';
note.textContent = 'Configure Notion in the extension popup to enable saving.';
document.body.appendChild(note);
}

// Initialize content script
async function init(): Promise<void> {
  try {
  const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const settings = response?.settings;
    if (settings?.notionToken && settings?.databaseId) {
      createSaveButton();
  } else {
    showSettingsReminder();
  }
} catch (e) {
  console.warn('Could not verify settings from background:', e);
    // Fallback: still show the button, background will error with helpful message
    createSaveButton();
  }
}

// Run on page load and when DOM changes
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => void init());
} else {
void init();
}

// Watch for dynamic content changes
const observer = new MutationObserver(() => {
if (!document.getElementById('job-notion-save-btn')) {
void init();
}
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
