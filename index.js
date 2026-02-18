const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const selfRegisterService = require("./services/selfRegisterService").default;
//Go Manual client creation
const postmark = require("postmark");
const postMarkClient = new postmark.ServerClient(
  process.env.POSTMARK_SERVER_API_TOKKEN,
);

require("dotenv").config();
const supabase = require("./utils/supabaseClient").default;
//In app imports
// const postMarkClient = require("./clients(Universal)/PostMarkClient").default;

const app = express();
const PORT = 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

// GitHub sends a JSON payload
app.use(bodyParser.json());

//parser for the Africas Talking
app.use(express.urlencoded({ extended: false }));

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

app.post("/ussd", async (req, res) => {
  const { sessionId, networkCode, phoneNumber, text } = req.body;

  let response = "";
  //Check if a number is registered in the database and respond with the appropriate message
  const checkNumber = phoneNumber.replace("+265", "0"); //prepare the number
  const { data, error } = await supabase
    .from("users")
    .select("full_name,phone_number")
    .eq("phone_number", checkNumber)
    .single();

  if (!data) {
    return selfRegisterService(req, res);
  }

  if (text == "") {
    //INITIAL MENU
    response = `CON Welcome to MkhondeWallet
        0. Groups
        1. My account
        2. Chichewa`;
  } else if (text == "1" || text == "2*1") {
    //MY ACCOUNT
    let word =
      "CON Choose account information you want to view\n1. Account number\n2. Phone number";
    if (text == "2*1") {
      word =
        "CON Sankhani zomwe mukufuna kuwona\n1. Nambala ya akaunti\n2. Nambala ya foni";
    }
    response = word;
  } else if (text == "1*2" || text == "2*1*2") {
    //MY PHONE NUMBER
    const number = phoneNumber.replace("+265", "0"); //prepare the number
    const { data, error } = await supabase
      .from("users")
      .select("full_name,phone_number")
      .eq("phone_number", number)
      .single();

    let word = "END Your phone number is ";
    if (text == "2*1*2") {
      word = "END Nambala ya foni yanu ndi ";
    }
    if (!error && data) {
      response = `${word} ${data.phone_number} (${data.full_name})`;
    } else {
      response = "END Your phone number is not registered.";
    }
    console.log("Supabase query result:", data);
    console.log("Supabase query error:", error);
    console.log(
      "Received USSD request with phone number:",
      phoneNumber.replace("+265", "0"),
    );
  } else if (text == "2") {
    //CHICHEWA
    response = `CON Takulandirani ku MkhondeWallet
       1. Akaunti yanga
    `;
  } else if (text == "1*1" || text == "2*1*1") {
    const accountNumber = `MKHONDE${Math.random()}`;
    let word = "END Your account number is ";
    if (text == "2*1*1") {
      word = "END Nambala ya akaunti yanu ndi ";
    }
    response = `${word}${accountNumber}`;
  }

  // Send the response back to the API
  res.set("Content-Type: text/plain");
  res.send(response);
});

app.listen(PORT, () =>
  console.log(`🚀 Webhook server listening on port http://localhost:${PORT}`),
);
