import { ServerClient } from "postmark";
const postMarkClient = new ServerClient(process.env.POSTMARK_SERVER_API_TOKKEN);
export default postMarkClient;
