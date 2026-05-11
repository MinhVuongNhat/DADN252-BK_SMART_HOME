const express = require("express");
const router = express.Router();

const {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  toggleDevice,
  updateDeviceMode,
  updateDevicePower,
} = require("../controllers/device.controller");

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management APIs
 */

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: Device list fetched successfully
 */
router.get("/", getDevices);

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Đèn ngủ
 *               power_status:
 *                 type: string
 *                 enum: [on, off]
 *                 example: on
 *               control_mode:
 *                 type: string
 *                 enum: [manual, schedule, automation]
 *                 example: schedule
 *     responses:
 *       201:
 *         description: Device created successfully
 */
router.post("/", createDevice);

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update device
 *     tags: [Devices]
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
 *               name:
 *                 type: string
 *                 example: Đèn 01
 *               power_status:
 *                 type: string
 *                 enum: [on, off]
 *                 example: on
 *               control_mode:
 *                 type: string
 *                 enum: [manual, schedule, automation]
 *                 example: schedule
 *     responses:
 *       200:
 *         description: Device updated successfully
 */
router.put("/:id", updateDevice);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete device
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Device deleted successfully
 */
router.delete("/:id", deleteDevice);

/**
 * @swagger
 * /api/devices/{id}/toggle:
 *   post:
 *     summary: Toggle device quickly
 *     tags: [Devices]
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
 *               type:
 *                 type: string
 *                 example: power
 *     responses:
 *       200:
 *         description: Device toggled successfully
 */
router.post("/:id/toggle", toggleDevice);

/**
 * @swagger
 * /api/devices/{id}/mode:
 *   patch:
 *     summary: Update device control mode
 *     tags: [Devices]
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
 *               - control_mode
 *             properties:
 *               control_mode:
 *                 type: string
 *                 enum: [manual, schedule, automation]
 *                 example: schedule
 *     responses:
 *       200:
 *         description: Device mode updated successfully
 */
router.patch("/:id/mode", updateDeviceMode);

/**
 * @swagger
 * /api/devices/{id}/power:
 *   patch:
 *     summary: Manual device power control
 *     tags: [Devices]
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
 *               - power_status
 *             properties:
 *               power_status:
 *                 type: string
 *                 enum: [on, off]
 *                 example: on
 *     responses:
 *       200:
 *         description: Device power updated successfully
 */
router.patch("/:id/power", updateDevicePower);

module.exports = router;