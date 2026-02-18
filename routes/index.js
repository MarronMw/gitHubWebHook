import { Router } from "express";
import webhookRoutes from "./webhook.js";
import ussdRoutes from "./ussd.js";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.send("Welcome");
});

// Mount route modules
router.use("/webhook", webhookRoutes);
router.use("/ussd", ussdRoutes);

export default router;
