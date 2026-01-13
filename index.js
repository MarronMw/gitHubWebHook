const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

// GitHub sends a JSON payload
app.use(bodyParser.json());

// Verification Middleware
function verifySignature(req, res, next) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    return res.status(401).send("No signature found");
  }

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = Buffer.from(
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex"),
    "utf8"
  );
  const checksum = Buffer.from(signature, "utf8");

  if (
    checksum.length !== digest.length ||
    !crypto.timingSafeEqual(digest, checksum)
  ) {
    return res.status(403).send("Request signatures did not match");
  }
  next();
}

app.post("/webhook/github", verifySignature, (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`Received ${event} event from GitHub!`);

  switch (event) {
    case "push": {
      const repoName = payload.repository.full_name;
      const branch = payload.ref;
      console.log(`📦 New push to ${repoName} on branch ${branch}`);
      break;
    }
    case "issues": {
      const repoName = payload.repository.full_name;
      const branch = payload.ref;
      console.log(`📦 New issue to ${repoName} on branch ${branch}`);
      res.status(200).send({ repoName, branch });
      break;
    }
    // Add your logic here (e.g., git pull, npm install, etc.)
  }

  res.status(200).send("Webhook received successfully");
});

app.get("/", function (req, res) {
  res.send("Welcome");
});

app.listen(PORT, () =>
  console.log(`🚀 Webhook server listening on port ${PORT}`)
);
