import { Router } from "express";
import supabase from "../utils/supabaseClient.js";

const router = Router();

router.post("/", async (req, res) => {
  const { sessionId, networkCode, phoneNumber } = req.body;
  let { text } = req.body;

  let response = "";
  if (text.startsWith("2*2")) {
    text = text.replace("2*2*", "");
  }

  if (text == "" || text == "2*2") {
    // INITIAL MENU
    response = `CON Welcome to MkhondeWallet
        0. Groups
        1. My account
        2. Chichewa`;
  } else if (text == "0*2" || text == "2*0*2") {
    // MY GROUPS
    const number = phoneNumber.replace("+265", "0");
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id(name),user_id!inner(full_name,phone_number)")
      .eq("user_id.phone_number", number);

    console.log("Supabase query result for groups:", data);

    if (!error && data !== null && data.length > 0) {
      let word = "My Groups\n";
      if (text == "2*0*2") {
        word = "Magulu anga\n";
      }
      data.forEach((group, index) => {
        word += `${index + 1}. ${group.group_id.name}\n`;
      });
      response = `CON ${word}`;
    } else {
      response = "END You are not a member of any groups.";
    }
  } else if (text == "0" || text == "2*0") {
    // GROUPS
    let word = "Groups\n1. Join a Group\n2. My Groups\n3.Create a Group";
    if (text == "2*0") {
      word = "Magulu\n1. Lowani mu gulu\n2. Magulu anga\n3. Pangani gulu";
    }
    response = `CON ${word}`;
  } else if (text == "1" || text == "2*1") {
    // MY ACCOUNT
    let word =
      "CON Choose account information you want to view\n1. Account number\n2. Phone number";
    if (text == "2*1") {
      word =
        "CON Sankhani zomwe mukufuna kuwona\n1. Nambala ya akaunti\n2. Nambala ya foni";
    }
    response = word;
  } else if (text == "1*2" || text == "2*1*2") {
    // MY PHONE NUMBER
    const number = phoneNumber.replace("+265", "0");
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
    // CHICHEWA
    response = `CON Takulandirani ku MkhondeWallet
       0. Magulu
       1. Akaunti yanga
       2.Chingerezi
    `;
  } else if (text == "1*1" || text == "2*1*1") {
    // ACCOUNT NUMBER
    const accountNumber = `MKHONDE${Math.random()}`;
    let word = "END Your account number is ";
    if (text == "2*1*1") {
      word = "END Nambala ya akaunti yanu ndi ";
    }
    response = `${word}${accountNumber}`;
  }

  console.log("USSD request text:", text);
  res.set("Content-Type: text/plain");
  res.send(response);
});

export default router;
