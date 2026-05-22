const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const { allowTPO } = require("../middleware/role.middleware");
const { getTPO } = require("../middleware/tpo.middleware");

const tpoController = require("../controllers/tpo.controller");

// ================= TPO PROFILE =================
router.post(
  "/create-profile",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.createTPOProfile
);

// ================= INVITE COMPANY =================
router.post(
  "/invite-company",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.inviteCompany
);

// ================= ACCEPTED REQUEST → CREATE DRIVE =================
router.post(
  "/create-drive-from-request",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.createDriveFromRequest
);

// ================= UPDATE DRIVE =================
router.put(
  "/update-drive",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.updateDriveDetails
);

// ================= DASHBOARD =================
router.get(
  "/dashboard",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.getDashboard
);

// ================= ONGOING =================
router.get(
  "/ongoing",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.getOngoingProcesses
);

// ================= SHARE JOB =================
router.post(
  '/share-job', 
  verifyToken, 
  allowTPO, 
  getTPO, 
  tpoController.shareJobToStudents
);

router.get(
  "/pending-students",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.getPendingStudents
);


router.put(
  "/approve-student",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.approveStudent
);

router.put(
  "/bulk-approve",
  verifyToken,
  allowTPO,
  getTPO,
  tpoController.bulkApproveStudents
);
module.exports = router;