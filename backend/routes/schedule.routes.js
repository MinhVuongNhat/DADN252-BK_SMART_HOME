const express = require("express");
const router = express.Router();

// 1. IMPORT CẢNH SÁT BẢO VỆ VÀO NÈ BÀ
const authMiddleware = require("../middlewares/auth.middleware");

const {
  getSchedulesByDevice,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
} = require("../controllers/schedule.controller");

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Device schedule APIs
 */

/**
 * @swagger
 * /api/devices/{id}/schedules:
 *   get:
 *     summary: Get schedules by device
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "001"
 *     responses:
 *       200:
 *         description: Schedule list fetched successfully
 */
// 2. CHÈN BẢO VỆ VÀO TỪNG ĐƯỜNG DẪN
router.get("/devices/:id/schedules", authMiddleware, getSchedulesByDevice);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create new schedule
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *               - start_date
 *               - start_time
 *               - action_type
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: "001"
 *               start_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               start_time:
 *                 type: string
 *                 example: "18:30"
 *               end_date:
 *                 type: string
 *                 example: "2026-05-10"
 *               end_time:
 *                 type: string
 *                 example: "21:30"
 *               action_type:
 *                 type: string
 *                 enum: [turn_on, turn_off]
 *                 example: turn_on
 *     responses:
 *       201:
 *         description: Schedule created successfully
 */
router.post("/", authMiddleware, createSchedule);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Update schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               start_time:
 *                 type: string
 *                 example: "18:30"
 *               end_date:
 *                 type: string
 *                 example: "2026-05-10"
 *               end_time:
 *                 type: string
 *                 example: "21:30"
 *               action_type:
 *                 type: string
 *                 enum: [turn_on, turn_off]
 *                 example: turn_off
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 */
router.put("/:id", authMiddleware, updateSchedule);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Delete schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 */
router.delete("/:id", authMiddleware, deleteSchedule);

/**
 * @swagger
 * /api/schedules/{id}/active:
 *   patch:
 *     summary: Enable or disable schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Schedule active state updated successfully
 */
router.patch("/:id/active", authMiddleware, toggleSchedule);

module.exports = router;