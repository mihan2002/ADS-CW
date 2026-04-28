import { Router } from "express";
import { ApiKeyController } from "../controllers/ApiKeyController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { csrfProtection } from "../middleware/csrf.js";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/", ApiKeyController.list);

router.get("/csrf", csrfProtection, (req, res) => {
  const token = (req as any).csrfToken?.();
  res.status(200).json({ success: true, data: { csrfToken: token }, message: "CSRF token issued" });
});

router.post("/", csrfProtection, ApiKeyController.create);
router.delete("/:apiKeyId", csrfProtection, ApiKeyController.revoke);

export default router;

