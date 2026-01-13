# GitHub Webhook Server (Express.js)

A simple, secure GitHub Webhook server built with **Express.js**.  
This project demonstrates how to receive, verify, and process GitHub webhook events using **HMAC SHA-256** signatures.

It is suitable for learning purposes, automation experiments, and as a foundation for CI/CD or integration workflows.

---

## 📌 Features

- Secure webhook verification using `x-hub-signature-256`
- Middleware-based request validation
- Handles GitHub events such as `push` and `issues`
- Environment-based configuration with `dotenv`
- Lightweight and easily extensible
- Development auto-reload using `nodemon`

---

## 🧱 Project Structure

├── index.js # Main server entry point
├── package.json # Project configuration and dependencies
├── .env # Environment variables (not committed)
└── README.md # Documentation

---

## ⚙️ Requirements

- Node.js v18 or later
- npm (or yarn)
- A GitHub repository with webhook permissions

---

## 📦 Dependencies

| Package     | Purpose                         |
| ----------- | ------------------------------- |
| express     | Web framework                   |
| body-parser | Parse JSON webhook payloads     |
| crypto      | HMAC signature verification     |
| dotenv      | Environment variable management |
| nodemon     | Development auto-restart        |

---

## 🔐 Environment Configuration

Create a `.env` file in the project root:

```env
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here


🚀 Installation & Usage
1. Clone the repository
git clone https://github.com/your-username/webhook.git
cd webhook

2. Install dependencies
npm install

3. Run the server

Development mode

npm run dev


Production mode

npm start


The server runs on:

http://localhost:3000

🔗 Webhook Endpoint
GitHub Webhook URL
POST /webhook/github


Example (local testing):

http://localhost:3000/webhook/github

🔒 Webhook Signature Verification

GitHub signs every webhook payload using a shared secret.

This server:

Reads x-hub-signature-256 from request headers

Recomputes the HMAC using SHA-256

Compares signatures using crypto.timingSafeEqual

Rejects invalid or missing signatures

This ensures:

Requests are genuinely from GitHub

Payloads are not tampered with

Unauthorized triggers are blocked

📡 Supported GitHub Events
push

Logs repository name and branch:

📦 New push to owner/repo on branch refs/heads/main

issues

Logs issue activity and responds with basic metadata:

{
  "repoName": "owner/repo",
  "branch": "refs/heads/main"
}


You can extend this to support:

pull_request

release

workflow_run

deployment

🧪 Local Testing with GitHub Webhooks

To test locally:

Expose your local server:

ngrok http 3000


Copy the HTTPS URL

Go to GitHub → Repository → Settings → Webhooks

Configure:

Payload URL: https://xxxx.ngrok.io/webhook/github

Content type: application/json

Secret: same as .env

Events: Push, Issues (or Any)

🧠 Extending the Server

Inside the webhook handler, you can:

Trigger deployments

Pull latest code

Run scripts

Notify Slack / Discord

Update databases

Example:

case "push":
  // exec("git pull && npm install && pm2 restart app");
  break;

🛡️ Security Notes

Never commit your webhook secret

Always validate signatures

Use HTTPS in production

Do not blindly trust payload contents

📄 License

MIT License

Copyright (c) 2026
```
