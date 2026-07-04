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

router.get("/admin/permissions", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionsPage);
router.get("/admin/permissions/user", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.userPermissionsPage);
router.post("/admin/permissions/user/update", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.updateUserPermissionsApi);
router.post("/admin/permissions/user/toggle", passport.checkAuthentication, common_function.checkPermission("admin"), adminController.toggleUserPermissionApi);

router.get("/admin/dev", adminController.DeveloperConsolePage);

module.exports = router;