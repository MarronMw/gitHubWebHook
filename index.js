const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
//Go Manual client creation
const postmark = require("postmark");
const postMarkClient = new postmark.ServerClient(
  process.env.POSTMARK_SERVER_API_TOKKEN,
);

//In app imports
// const postMarkClient = require("./clients(Universal)/PostMarkClient").default;

const app = express();
const PORT = 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "_";

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
    "utf8",
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

app.post("/webhook/github", verifySignature, async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  //initialize the email contents
  let emailSubject = "";
  let emailBody = "";

  console.log(`Received ${event} event from GitHub!`);
  //Always respond immediately
  res.status(200).send("Webhook received successfully");

  switch (event) {
    case "push": {
      const repoName = payload.repository.full_name;
      const branch = payload.ref.replace("ref/heads/", "");
      const commitCount = payload.commits.count;
      //set the email Data and contents context
      emailSubject = `📦 New push to ${repoName}`;
      emailBody = `There were ${commitCount} new commits pushed to the ${branch} branch.`;
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
  }
  // Try to create and send an email from the triggered Github webhook(push for now)
  if (emailSubject && emailBody) {
    try {
      // postMarkClient.sendEmail({
      //   From: "maranathandege@dyuni.ac.mw", //this must be the actual (verified) email in postmark (dashboard)
      //   To: "maranathandege@dyuni.ac.mw",
      //   Subject: emailSubject,
      //   TextBody: emailBody,
      // });
      const this_branch = payload.ref.replace("refs/heads/", "");
      postMarkClient.sendEmailWithTemplate({
        From: "maranathandege@dyuni.ac.mw", //this must be the actual (verified) email in postmark (dashboard)
        To: "maranathandege@dyuni.ac.mw",
        TemplateAlias: "new_push",
        TemplateModel: {
          TextBody: emailBody,
          Subject: emailSubject,
          data: payload,
          commit: payload.commits[0],
          date: new Date().toDateString(),
          branch: this_branch,
        },
      });

      //log success status
      console.log("Email successfully sent sent to the client");
    } catch (error) {
      console.log(`PostMark Error: `, error.message);
    }
  }
});

app.post("/webhook/onekhusa", (req, res) => {
  const payload = req.body;
  console.log("Received OneKhusa webhook:", payload);
  res.status(200).send("OneKhusa webhook received successfully");
});

app.get("/", function (req, res) {
  res.send("Welcome");
});

app.listen(PORT, () =>
  console.log(`🚀 Webhook server listening on port http://localhost:${PORT}`),
);
