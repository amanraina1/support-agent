import { Router } from "express";
import { signin, signout, signup } from "../controllers/authController";
import { asyncHandler } from "../handlers/asyncHandler";

const router: Router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/signin", asyncHandler(signin));
router.post("/signout", asyncHandler(signout));

export default router;