const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const automationController = require("../controllers/automation.controller");

// API lấy dữ liệu cho Dropdown
router.get("/options", authMiddleware, automationController.getFormOptions);

// CRUD cho Automation Rules
router.get("/", authMiddleware, automationController.getRules);
router.post("/", authMiddleware, automationController.createRule);
router.put("/:id", authMiddleware, automationController.updateRule);
router.delete("/:id", authMiddleware, automationController.deleteRule);

module.exports = router;