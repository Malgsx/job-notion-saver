// Content script: extraction utilities and message handler (no on-page button)

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

if (url.includes('linkedin.com')) {
  return extractLinkedInJob() || extractGenericJob();
}
if (url.includes('indeed.com')) {
    return extractIndeedJob() || extractGenericJob();
}
if (url.includes('glassdoor.com')) {
return extractGlassdoorJob() || extractGenericJob();
}
  if (url.includes('monster.com')) {
  return extractMonsterJob() || extractGenericJob();
}
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

// Message handler: respond to popup requests for extraction
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
if (request?.action === 'extractJob') {
try {
    const data = extractJobData();
  if (data) {
    sendResponse({ jobData: data });
    } else {
        sendResponse({ error: 'Could not extract job data from this page.' });
      }
    } catch (e: any) {
      sendResponse({ error: e?.message || 'Extraction failed.' });
  }
    return true;
}
});
