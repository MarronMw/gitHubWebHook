export default function selfRegisterService(req, res) {
  const response = `CON Your phone number is Not registered To Mkhonde Wallet.
      1. Register now`;
  res.set("Content-Type: text/plain");
  return res.send(response);
}
