import { Router } from "express";
import crypto from "crypto";
import postMarkClient from "../utils/postMarkClient.js";

const router = Router();
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

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

router.post("/github", verifySignature, async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  let emailSubject = "";
  let emailBody = "";

  console.log(`Received ${event} event from GitHub!`);
  res.status(200).send("Webhook received successfully");

  switch (event) {
    case "push": {
      const repoName = payload.repository.full_name;
      const branch = payload.ref.replace("ref/heads/", "");
      const commitCount = payload.commits.count;
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

  if (emailSubject && emailBody) {
    try {
      const this_branch = payload.ref.replace("refs/heads/", "");
      postMarkClient.sendEmailWithTemplate({
        From: "maranathandege@dyuni.ac.mw",
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

      console.log("Email successfully sent to the client");
    } catch (error) {
      console.log(`PostMark Error: `, error.message);
    }
  }
});

router.post("/onekhusa", (req, res) => {
  const payload = req.body;
  console.log("Received OneKhusa webhook:", payload);
  res.status(200).send("OneKhusa webhook received successfully");
});

export default router;
