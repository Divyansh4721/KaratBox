const express = require("express");
const router = express.Router();
const passport = require("passport");
const approvalController = require("../controllers/approval_controller");
const common_function = require("../controllers/common_function");


router.get("/approvalPage", passport.checkAuthentication, common_function.checkPermission("approvalAdd"), approvalController.approvalAddPage);
router.post("/approvalForm", passport.checkAuthentication, common_function.checkPermission("approvalAdd"), approvalController.approvalAddForm);
router.get("/approvalViewPage", passport.checkAuthentication, common_function.checkPermission("approvalView"), approvalController.approvalViewPage);
router.get("/approvalRecvPage", passport.checkAuthentication, common_function.checkPermission("approvalView"), approvalController.approvalRecvPage);
router.post("/approvalRecvForm", passport.checkAuthentication, common_function.checkPermission("approvalRecv"), approvalController.approvalRecvForm);


module.exports = router;