import {
  change_password,
  delete_profile,
  get_business_profile,
  get_last_visits,
  get_profile,
  invite,
  update_picture,
  update_profile,
} from "@controllers/profile";
import authorize from "@middleware/auth";
import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.get("/", authorize(["user", "business"]), get_profile);
router.get("/business-profile", get_business_profile);
router.get("/last-visits", authorize(["user", "business"]), get_last_visits);
router.put("/", authorize(["user", "business"]), update_profile);
router.put(
  "/picture",
  authorize(["user", "business"]),
  upload.single("picture"),
  update_picture
);
router.delete("/", authorize(["user", "business"]), delete_profile);
router.post(
  "/change-password",
  authorize(["user", "business"]),
  change_password
);
router.get("/invite", authorize(["user", "business"]), invite);

export default router;
