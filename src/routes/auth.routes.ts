import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

router.post("/admin/login", login);

// TODO: Add setup-pin endpoint later
// router.post("/admin/setup-pin", setupPin);

export default router;
