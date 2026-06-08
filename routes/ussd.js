import { Router } from "express";
import supabase from "../utils/supabaseClient.js";
import cache from 'memory-cache';

const router = Router();
// const cache = require('memory-cache');

router.post("/", async (req, res) => {
  // Extract the standard Africa's Talking USSD variables
  const { sessionId, serviceCode, phoneNumber } = req.body;
  let { text } = req.body;

  console.log("Request:", req.body);

  let response = '';

  // Handle returning to main menu logic
  if (text.startsWith("2*2")) {
    text = text.replace("2*2*", "");
  }

  if (text === "" || text === "2*2") {
    // INITIAL MENU
    // Note: Do not indent these strings to avoid weird spacing on the mobile device
    response = `CON Welcome to MkhondeWallet
0. Groups
1. My account
2. Chichewa`;
  } else if (text === "0*2" || text === "2*0*2") {
    // MY GROUPS
    const number = phoneNumber.replace("+265", "0");
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id(name),user_id!inner(full_name,phone_number)")
      .eq("user_id.phone_number", number);

    console.log("Supabase query result for groups:", data);

    if (!error && data !== null && data.length > 0) {
      let word = text === "2*0*2" ? "Magulu anga\n" : "My Groups\n";

      data.forEach((group, index) => {
        word += `${index + 1}. ${group.group_id.name}\n`;
      });
      response = `CON ${word}`;
    } else {
      response = "END You are not a member of any groups.";
    }
  } else if (text === "0" || text === "2*0") {
    // GROUPS
    let word =
      text === "2*0"
        ? "Magulu\n1. Lowani mu gulu\n2. Magulu anga\n3. Pangani gulu"
        : "Groups\n1. Join a Group\n2. My Groups\n3. Create a Group";
    response = `CON ${word}`;
  } else if (text === "1" || text === "2*1") {
    // MY ACCOUNT
    let word =
      text === "2*1"
        ? "CON Sankhani zomwe mukufuna kuwona\n1. Nambala ya akaunti\n2. Nambala ya foni"
        : "CON Choose account information you want to view\n1. Account number\n2. Phone number";
    response = word;
  } else if (text === "1*2" || text === "2*1*2") {
    // MY PHONE NUMBER
    const number = phoneNumber.replace("+265", "0");
    const { data, error } = await supabase
      .from("users")
      .select("full_name,phone_number")
      .eq("phone_number", number)
      .single();

    let word =
      text === "2*1*2"
        ? "END Nambala ya foni yanu ndi"
        : "END Your phone number is";

    if (!error && data) {
      response = `${word} ${data.phone_number} (${data.full_name})`;
    } else {
      response = "END Your phone number is not registered.";
    }

    console.log("Supabase query result:", data);
    console.log("Supabase query error:", error);
    console.log("Received USSD request with phone number:", number);
  } else if (text === "2") {
    // CHICHEWA MENU
    response = `CON Takulandirani ku MkhondeWallet
0. Magulu
1. Akaunti yanga
2. Chingerezi`;
  } else if (text === "1*1" || text === "2*1*1") {
    // ACCOUNT NUMBER
    // Using Math.floor to ensure we get a clean integer instead of decimals in the account number
    const accountNumber = `MKHONDE${Math.floor(Math.random() * 100000)}`;
    let word =
      text === "2*1*1"
        ? "END Nambala ya akaunti yanu ndi "
        : "END Your account number is ";
    response = `${word}${accountNumber}`;
  } else {
    // FALLBACK FOR INVALID INPUT
    response = "END Invalid entry. Please try again.";
  }

  console.log("USSD request text:", text);

  // Set the proper header for Africa's Talking plain text response
  res.set("Content-Type", "text/plain");
  res.send(response);
});

router.post("/init", async (req, res) => {
  let { userData, sessionID, userID, msisdn } = req.body;
  console.log(req.body);

  // Returning a JSON object instead of a string
  res.json({
    sessionID: sessionID,
    userID: userID,
    msisdn: msisdn,
    status: "success",
    message: `END hello`,
    continueSession: "",
  });
});

router.post('/test', (req, res) => {
  // Read the variables sent via POST from our API
  const {
      sessionId,
      serviceCode,
      phoneNumber,
      text,
  } = req.body;

  let response = '';

  if (text == '') {
      // This is the first request. Note how we start the response with CON
      response = `CON What would you like to check
      1. My account
      2. My phone number`;
  } else if ( text == '1') {
      // Business logic for first level response
      response = `CON Choose account information you want to view
      1. Account number`;
  } else if ( text == '2') {
      // Business logic for first level response
      // This is a terminal request. Note how we start the response with END
      response = `END Your phone number is ${phoneNumber}`;
  } else if ( text == '1*1') {
      // This is a second level response where the user selected 1 in the first instance
      const accountNumber = 'ACC100101';
      // This is a terminal request. Note how we start the response with END
      response = `END Your account number is ${accountNumber}`;
  }

  // Send the response back to the API
  res.set('Content-Type: text/plain');
  res.send(response);
});

router.post('/arkesel', (req, res) => {
  try {
    const { sessionID, userID, newSession, msisdn, userData, network } = req.body;

    if (newSession) {
      const message = "CON What would you like to check\n1. My account\n2. My phone number";
      const currentState = { sessionID, msisdn, level: 1, message };
      
      cache.put(sessionID, [currentState]);
      return res.status(200).json({ userID, sessionID, message, continueSession: true, msisdn });
    }

    const userResponseTracker = cache.get(sessionID);
    if (!userResponseTracker) {
      return res.status(200).json({ userID, sessionID, message: 'Session expired.', continueSession: false, msisdn });
    }

    const lastResponse = userResponseTracker[userResponseTracker.length - 1];
    let message = "Invalid Option";
    let continueSession = false;

    if (lastResponse.level === 1) {
      if (userData === '1') {
        message = "CON Choose account information\n1. Account number";
        updateState(sessionID, userResponseTracker, { level: 2, message });
        continueSession = true;
      } else if (userData === '2') {
        message = `END Your phone number is ${msisdn}`;
        continueSession = false;
      }
    } else if (lastResponse.level === 2) {
      if (userData === '1') {
        message = "END Your account number is ACC100101";
        continueSession = false;
      }
    }

    return res.status(200).json({ userID, sessionID, message, continueSession, msisdn });
  } catch (err) {
    console.error('arkesel error:', err);
    return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
});

// Helper to keep code clean
function updateState(sessionID, tracker, newState) {
    tracker.push({ ...tracker[0], ...newState });
    cache.put(sessionID, tracker);
}

export default router;
