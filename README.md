# CDCG Dash

CDCG Dash is a Next.js dashboard for a crab-processing / warehouse operations team. It combines inventory visibility, form-based data entry, local weather, and simple staff PIN authentication into a single internal tool. The application is designed around a Google Sheets-backed workflow, where team members submit operational data from the browser and the app appends that data to a spreadsheet used as the system of record.

This project is purpose-built for a specific business workflow, but it is also a good template for any small operation that wants a lightweight internal portal with protected pages and spreadsheet-backed reporting.

## What this app does

The dashboard includes:

- A protected home screen with:
  - current inventory totals pulled from a Google Sheet
  - estimated clock-in time for the next shift based on current stock and grading load
  - local weather using Open-Meteo
- A searchable forms hub for operational paperwork
- Multiple form pages for business data collection
- Google Sheets writes for each form submission
- A simple staff login flow using a 4-digit PIN and bcrypt-hashed values stored in environment variables
- Minimal admin settings and theme support

The main operational forms are:

- Tuesday Breakdown Form
- End of Day Report
- Crab Invoice Entry
- Daily Dead Loss

## How the app works

At a high level:

- Users visit the site and are redirected to `/login` if no session cookie is present.
- A user enters a 4-digit PIN.
- The app compares the PIN against `STAFF_JSON`, which contains staff names mapped to bcrypt hashes.
- On success, the app sets an `httpOnly` session cookie and grants access to protected routes.
- Business forms submit to server actions in `src/lib/actions/crab-actions.ts`.
- Those actions authenticate to Google Sheets using the service account credentials in `.env.local`.
- Data is appended to specific tabs in one spreadsheet, such as:
  - `Invoices`
  - `EoD_Data`
  - `Tues_Breakdown`
  - `Daily_Dead_Loss`
- The home dashboard reads the latest row from `EoD_Data` to show inventory totals and estimate when the next shift should start.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- ShadCN-style UI primitives
- Google Sheets API via `googleapis`
- bcrypt via `bcryptjs`
- Open-Meteo for weather data

## Repository structure

- `src/app/` — app pages and route-level UI
- `src/lib/actions/` — server actions for login and Google Sheets writes
- `src/components/` — shared UI components and sidebar
- `src/proxy.ts` — route protection middleware
- `.env.example` — sample environment variables
- `package.json` — scripts and dependencies

## Prerequisites

Before you host this project, you will need:

- Node.js 20+ recommended
- npm
- A Google Cloud project with a service account
- A Google Sheet shared with that service account
- A local machine or deployment provider such as Vercel, Railway, Render, or a Linux VM
- A location for weather data (`LAT` and `LON`)

## Local setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-user>/cdcg-dash.git
cd cdcg-dash
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy the example env file:

On macOS/Linux:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 4. Fill in required values

Open `.env.local` and add the settings described below.

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="your-google-sheet-id"
STAFF_JSON={"Employee Name":"$2a$10$...bcrypthash..."}
LAT=
LON=
```

### 5. Run the app locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

If you are not logged in, you will be redirected to `/login`.

## Required environment variables

### GOOGLE_PRIVATE_KEY

This is the private key from the Google service account JSON. In the file, it normally looks like this:

```text
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

In `.env.local`, you must replace the actual newlines with escaped `\n` sequences, because the app does:

```ts
process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
```

Example:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nabc123\nxyz456\n-----END PRIVATE KEY-----\n"
```

### GOOGLE_SERVICE_ACCOUNT_EMAIL

This is the email address for the Google service account. It should look similar to:

```text
your-service-account@your-project.iam.gserviceaccount.com
```

### GOOGLE_SHEET_ID

This is the spreadsheet ID from the Google Sheet URL:

```text
https://docs.google.com/spreadsheets/d/<THIS_IS_THE_SHEET_ID>/edit
```

### LAT and LON

These are used by the dashboard to fetch local weather using Open-Meteo.

Example:

```env
LAT=39.9526
LON=-75.1652
```

### STAFF_JSON

This is where the app stores allowed staff names and bcrypt-hashed PIN values.

Example structure:

```json
{
  "Alex": "$2a$10$B8M9f0i...",
  "Jordan": "$2a$10$P7m6R2...",
  "Sam": "$2a$10$L8V9c1..."
}
```

The app checks each entry by trying to compare the entered 4-digit PIN with each bcrypt hash.

Important:

- The keys are staff names, not usernames.
- Values must be bcrypt hashes, not plaintext PINs.
- Because this is a simple app, it stores auth data in environment variables instead of a real database.

## How to generate bcrypt PIN hashes

You can generate a hash locally with Node if you want a simple 4-digit staff PIN.

```bash
node -e "const bcrypt=require('bcryptjs'); const pin='1234'; bcrypt.hash(pin, 10).then(h=>console.log(h));"
```

This prints a bcrypt string like:

```text
$2a$10$zA0P2mQvV8xTzQ3P4n9L8uNn8gC7v.Df2L4L7M4E5m7VfO0jR6n6u
```

Then assign it in `STAFF_JSON`:

```env
STAFF_JSON={"Alex":"$2a$10$zA0P2mQvV8xTzQ3P4n9L8uNn8gC7v.Df2L4L7M4E5m7VfO0jR6n6u"}
```

If you want multiple staff users, include multiple entries in the JSON object.

## Google Sheets setup

### 1. Create a service account

In Google Cloud Console:

- Create a project
- Enable the Google Sheets API
- Create a service account
- Generate a JSON key
- Download the key and use the values for:
  - `GOOGLE_PRIVATE_KEY`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`

### 2. Create a spreadsheet

Create a Google Sheet that will act as your operational database.

Share it with the service account email address with edit access.

The app expects tabs with these names:

- `Invoices`
- `EoD_Data`
- `Tues_Breakdown`
- `Daily_Dead_Loss`

The code in `src/lib/actions/crab-actions.ts` appends rows to these tabs. If your column layouts differ from the code expected, your sheet data may not read or calculate correctly.

### 3. Check the app-specific data assumptions

The home dashboard reads the latest row from `EoD_Data` and expects values in roughly this structure:

- column A: date
- columns F-L: male totals
- columns M-P: female totals
- column Q: total bushels
- column R: ungraded boxes

This is not a universal schema; it is a business-specific spreadsheet layout, so you should verify the actual data layout before using it in production.

## Deployment guide

### Option 1: Deploy to Vercel (recommended)

1. Push the repo to GitHub.
2. Create a new Vercel project linked to the repo.
3. Framework preset: Next.js
4. Add the environment variables listed above in the Vercel project settings.
5. Deploy.
6. Ensure the app is using a production environment with `NODE_ENV=production`.

The app uses cookie-based auth and server actions, so it works best when deployed to a platform that supports Next.js server-side runtime.

### Option 2: Self-host on a Node server

You can also run it on any host that supports Node.js and Next.js:

```bash
npm install
npm run build
npm run start
```

If you are hosting behind Nginx, Caddy, or a reverse proxy, make sure you forward traffic to the app and allow WebSocket support where required.

## Security notes

This app is purposely lightweight and does not implement a full multi-user database or role system. It is best suited for an internal environment where security is handled by the hosting environment and access control.

Important limitations:

- `STAFF_JSON` is not a secure database and is only intended for very small setups.
- The app currently relies on a session cookie, which is okay for a simple internal portal but not a full enterprise access-control system.
- The Google service account key is highly sensitive; treat it as a secret.

For a production-grade deployment, consider moving staff data to a proper database and moving authentication away from environment-variable-only pin storage.

## Useful scripts

```bash
npm run dev     # local development server
npm run build   # production build
npm run start   # run production build
npm run lint    # lint source files
```

## Troubleshooting

### Redirect loop to `/login`

This usually means the session cookie is not being set or is being removed. Make sure:

- you are using a browser that accepts cookies
- you are not on a subdomain that blocks same-site cookies
- you are not using a local environment with a proxy that strips cookies

### Google Sheets API errors

Check that:

- the service account has access to the spreadsheet
- the spreadsheet ID is correct
- the private key is escaped correctly in `.env.local`
- the service account is not blocked by a Google Workspace policy

### Weather does not load

Ensure:

- `LAT` and `LON` are valid numeric values
- your deployment environment has outbound internet access
- the app is not restricted by a firewall or proxy

### Form submissions fail

This usually means the Google service account cannot write to the target sheet tab. Verify:

- the tab name matches the code exactly
- the sheet is shared with the service account email
- the script can append rows without restrictions

## Summary

CDCG Dash is a lightweight internal operations dashboard built around Google Sheets and simple staff PIN login. It helps a team centralize inventory tracking, daily reporting, and form-driven operations without building a large custom database system.

If you are cloning this repository for your own instance, the most important setup steps are:

1. install dependencies
2. copy `.env.example` to `.env.local`
3. add your Google service account details and spreadsheet ID
4. generate bcrypt hashes for your staff employees in `STAFF_JSON`
5. set `LAT` and `LON` for weather data
6. deploy with a Next.js-capable host

Once those pieces are in place, the application is ready to run as a private internal dashboard.
