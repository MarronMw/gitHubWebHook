# MkhondeWallet Webhook & USSD Server (Express.js)

A comprehensive webhook and USSD server built with **Express.js**.  
This project handles GitHub webhooks, OneKhusa webhooks, and **MkhondeWallet USSD services** with bilingual support (English/Chichewa).

Features secure webhook verification using **HMAC SHA-256** signatures and real-time USSD menu navigation with Supabase integration.

---

## 📌 Features

- Secure webhook verification using `x-hub-signature-256`
- USSD menu system with bilingual support (English/Chichewa)
- Supabase database integration for user and group data
- Modular route structure for scalability
- GitHub and OneKhusa webhook support
- PostMark email integration for notifications
- Environment-based configuration with `dotenv`
- Development auto-reload using `nodemon`

---

## 🧱 Project Structure

```
.
├── index.js                    # Application entry point
├── app.js                      # Express app setup & middleware
├── package.json                # Project dependencies
├── .env                        # Environment variables (not committed)
├── README.md                   # Documentation
├── ROUTES.md                   # USSD route guidelines
│
├── routes/
│   ├── index.js               # Main route aggregator
│   ├── webhook.js             # GitHub & OneKhusa webhooks
│   └── ussd.js                # MkhondeWallet USSD service
│
├── utils/
│   ├── supabaseClient.js       # Supabase database client
│   └── postMarkClient.js       # Email service client
│
├── services/
│   └── selfRegisterService.js  # User registration logic
│
└── api/
    ├── main.py                # Python API backend
    └── models/
        └── Models.py          # Database models
```

---

## ⚙️ Requirements

- Node.js v18 or later
- npm (or yarn)
- A GitHub repository with webhook permissions

---

## 📦 Dependencies

| Package               | Purpose                         |
| --------------------- | ------------------------------- |
| express               | Web framework                   |
| body-parser           | Parse JSON webhook payloads     |
| crypto                | HMAC signature verification     |
| dotenv                | Environment variable management |
| @supabase/supabase-js | Database client                 |
| postmark              | Email service integration       |
| nodemon               | Development auto-restart        |

---

## 🔐 Environment Configuration

Create a `.env` file in the project root:

````env
# Server Configuration
PORT=3000

# GitHub Webhook
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# PostMark Email Service
POSTMARK_SERVER_API_TOKKEN=your_postmark_api_token
```

---

## 🚀 Installation & Usage

1. **Clone the repository**
```bash
git clone https://github.com/your-username/webhook.git
cd webhook
````

2. **Install dependencies**

```bash
npm install
```

3. **Run the server**

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server runs on: `http://localhost:3000`

## 🔗 API Endpoints

### Webhook Endpoints

**GitHub Webhook**

```
POST /webhook/github
```

Handles GitHub push and issues events with email notifications.

**OneKhusa Webhook**

```
POST /webhook/onekhusa
```

Receives and logs OneKhusa webhook payloads.

### USSD Endpoints

**MkhondeWallet USSD**

```
POST /ussd
```

Main USSD menu system for MkhondeWallet with the following flows:

- **Initial Menu** - Welcome screen with Groups, My Account, Language options
- **Groups** - Join groups, view user's groups, create new groups
- **My Account** - View account number and phone number
- **Bilingual Support** - Switch between English and Chichewa

**Example USSD Request:**

```json
{
  "sessionId": "unique_session_id",
  "networkCode": "MZ01",
  "phoneNumber": "+265701234567",
  "text": "0"
}
```

**Response Types:**

- `CON` - Continue session, user selects next option
- `END` - End session, no further input

For detailed USSD flows and navigation paths, see [ROUTES.md](ROUTES.md)

---

## 🏗️ Modular Architecture

The application uses a modular route structure for better organization and scalability:

### Route Modules

**`routes/index.js`** - Main route aggregator

- Imports and mounts all route modules
- Provides health check endpoint (`GET /`)

**`routes/webhook.js`** - Webhook handlers

- GitHub webhook verification and processing
- OneKhusa webhook handling
- PostMark email integration

**`routes/ussd.js`** - USSD menu logic

- Bilingual menu system (English/Chichewa)
- User group queries via Supabase
- Account information retrieval
- Session management

### Application Entry Points

**`index.js`** - Application entry point

- Loads environment variables via `dotenv`
- Imports and starts the Express app

**`app.js`** - Express configuration

- Sets up middleware (body-parser, urlencoded)
- Mounts all routes
- Starts the server on configured PORT

### Utilities

**`utils/supabaseClient.js`** - Database client

- Initializes Supabase connection
- Available for queries in routes

**`utils/postMarkClient.js`** - Email client

- Initializes PostMark email service
- Handles email templates and sending

---

## 🔒 Webhook Signature Verification

GitHub signs every webhook payload using a shared secret.

This server:

- Reads `x-hub-signature-256` from request headers
- Recomputes the HMAC using SHA-256
- Compares signatures using `crypto.timingSafeEqual`
- Rejects invalid or missing signatures

This ensures:

- Requests are genuinely from GitHub
- Payloads are not tampered with
- Unauthorized triggers are blocked

---

## 📡 Supported GitHub Events

**push**

- Logs repository name and branch
- Example: `📦 New push to owner/repo on branch refs/heads/main`

**issues**

- Logs issue activity and responds with basic metadata

```json
{
  "repoName": "owner/repo",
  "branch": "refs/heads/main"
}
```

Extended support available for:

- `pull_request`
- `release`
- `workflow_run`
- `deployment`

---

## 🧪 Local Testing with GitHub Webhooks

To test locally:

1. **Expose your local server:**

```bash
ngrok http 3000
```

2. **Copy the HTTPS URL**

3. **Configure GitHub Webhook:**
   - Go to GitHub → Repository → Settings → Webhooks
   - Payload URL: `https://xxxx.ngrok.io/webhook/github`
   - Content type: `application/json`
   - Secret: same as `GITHUB_WEBHOOK_SECRET` in .env
   - Events: Push, Issues (or Any)

   - Events: Push, Issues (or Any)

---

## 🧠 Extending the Server

Inside the webhook handler or route modules, you can:

- Trigger deployments
- Pull latest code
- Run scripts
- Notify Slack / Discord
- Update databases

**Example:**

```javascript
case "push":
  // exec("git pull && npm install && pm2 restart app");
  break;
```

---

## 🛡️ Security Notes

- Never commit your webhook secret
- Always validate signatures before processing payloads
- Use HTTPS in production
- Do not blindly trust payload contents
- Validate phone numbers and user data in USSD requests
- Sanitize all user inputs

---

## 📄 License

MIT License

Copyright (c) 2026

```

```
