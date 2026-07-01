const express = require("express");
const router = express.Router();
const passport = require("passport");
const adminController = require("../controllers/admin_controller");
const common_function = require("../controllers/common_function");


router.get("/admin/settings", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.settingsPage);
router.post("/admin/settings/update", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.updateSettingsApi);

router.get("/admin/session", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.sessionPage);
router.post("/admin/session/delete", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.deleteSessionApi);

router.post("/admin/user/create", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.createUserApi);
router.post("/admin/user/update", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.updateUserApi);
router.post("/admin/user/delete", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.deleteUserApi);

router.get("/admin/user/permissions/:id", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.getUserPermissionsApi);
router.post("/admin/user/permissions/update/:id", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.updateUserPermissionsApi);
router.post("/admin/user/permissions/toggle/:id", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.toggleUserPermissionApi);

router.get("/admin/dev", adminController.DeveloperConsolePage);

module.exports = router;