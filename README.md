# Job Notion Saver

A browser extension that lets you save job applications from major job sites directly to your Notion database.

## Features

- Multi-site support: LinkedIn, Indeed, Glassdoor, Monster, Dice
- Automatic detection: Detects job pages and shows a floating "Save to Notion" button
- Notion integration: Creates pages in your Notion database with job details
- Clean UI: Simple popup for token + database configuration

## Setup

### 1) Install dependencies

```bash
bun install
```

### 2) Build the extension

```bash
bun run build
```

### 3) Load in your browser

- Chrome:
  1. Go to `chrome://extensions/`
  2. Enable "Developer mode"
  3. Click "Load unpacked" and select the `dist` folder

- Firefox:
  1. Go to `about:debugging`
  2. Click "This Firefox" → "Load Temporary Add-on"
  3. Select the `dist/manifest.json` file

### 4) Configure Notion integration

1. Create a Notion internal integration at https://www.notion.so/my-integrations and copy the token
2. Create a Notion database with these properties:
   - `Job Title` (Title)
   - `Company` (Text)
   - `Location` (Text)
   - `URL` (URL)
   - `Date Applied` (Date)
   - `Status` (Select: Applied, Interview, Offer, Rejected)
   - `Description` (Text)
3. Share the database with your integration (via the Share menu)
4. Copy the database ID from the database URL and paste it into the popup along with your integration token

Notes:
- Database IDs can be pasted with or without dashes; the popup will normalize to canonical dashed UUID format.
- If settings are missing, the page will show a small reminder to configure the extension via the popup.

## Usage

1. Navigate to a job posting on a supported site
2. Click the "Save to Notion" button that appears
3. The job details (title, company, location, URL, date, status, description) will be saved to your Notion database

## Development

### Project structure (root-level sources)

```
job-notion-saver/
├── background.ts      # Background service worker; Notion SDK calls and message handling
├── content.ts         # Content script; job detection and extraction; UI button
├── content.css        # Floating button styles and configuration reminder
├── popup.html         # Settings popup HTML
├── popup.ts           # Settings popup logic (token + DB ID; normalization)
├── manifest.json      # Extension manifest (MV3)
├── vite.config.ts     # Vite configuration (vite-plugin-web-extension)
├── package.json
└── dist/              # Build output
```

### Scripts

- `bun run dev` – Start development server
- `bun run build` – Build for production
- `bun run preview` – Preview built extension

## Supported job sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- Monster
- Dice

The extension includes site-specific extractors for each of the above and a generic fallback to improve resilience when selectors change.

## Error handling

Common Notion API errors are mapped to friendly messages:
- Unauthorized: Check your Notion token
- Object not found: Verify the database ID and ensure it’s shared with the integration
- Validation error: Check database property names/types
- Rate limited: Try again after a moment

## Security

- The Notion API token and database ID are stored in browser storage. By default this uses `chrome.storage.sync` for convenience across devices.
- Only minimal permissions are requested.
- No tracking or analytics.

## License

MIT License
