export default function selfRegisterService(req, res) {
  const { sessionId, networkCode, phoneNumber, text } = req.body;
  const session = req.body;
  console.log(text);
  let response = `END Your phone number is Not registered To Mkhonde Wallet.`;

  res.set("Content-Type: text/plain");
  return res.send(response);
}
