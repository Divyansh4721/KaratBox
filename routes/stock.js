const express = require("express");
const router = express.Router();
const passport = require("passport");
const stockController = require("../controllers/stock_controller");
const common_function = require("../controllers/common_function");

router.get("/stock/:id", passport.checkAuthentication, common_function.checkPermission("stockView"), stockController.stockViewPage);
router.get("/stock/add", passport.checkAuthentication, common_function.checkPermission("stockAdd"), stockController.stockAddPage);
router.get("/stock/edit/:id", passport.checkAuthentication, common_function.checkPermission("stockEdit"), stockController.stockEditPage);
router.get("/stock/edit-image/:id", passport.checkAuthentication, common_function.checkPermission("stockImageEdit"), stockController.stockImageEditPage);
router.get("/stock/transfer", passport.checkAuthentication, common_function.checkPermission("stockEditMultiple"), stockController.stockTransferPage);

router.get("/stock/print-tag", passport.checkAuthentication, common_function.checkPermission("tags"), stockController.printTagPage);
router.get("/stock/print-multiple-tags", passport.checkAuthentication, common_function.checkPermission("tags"), stockController.printMultipleTagsPage);

router.post("/stock/add-stock", passport.checkAuthentication, common_function.checkPermission("stockAdd"), stockController.addStockApi);
router.post("/stock/edit-stock", passport.checkAuthentication, common_function.checkPermission("stockEdit"), stockController.editStockApi);
router.post("/stock/edit-image", passport.checkAuthentication, common_function.checkPermission("stockImageEdit"), stockController.editStockImageApi);
router.post("/stock/transfer", passport.checkAuthentication, common_function.checkPermission("stockEditMultiple"), stockController.stockTransferApi);

module.exports = router;