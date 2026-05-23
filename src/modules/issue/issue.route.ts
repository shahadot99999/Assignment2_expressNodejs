import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

// Endpoint paths matching requirement criteria strictly
router.post("/", auth(USER_ROLE.maintainer, USER_ROLE.contributor), issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", auth(USER_ROLE.maintainer, USER_ROLE.contributor), issueController.updateIssue);
router.delete("/:id", auth(USER_ROLE.maintainer), issueController.deleteIssue);

export const issueRoute = router;