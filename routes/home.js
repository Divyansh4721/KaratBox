const express = require("express");
const router = express.Router();
const passport = require("passport");
const homeController = require("../controllers/home_controller");
const stockController = require("../controllers/stock_controller");
const stockViewController = require("../controllers/stock_view_controller");
const adminController = require("../controllers/admin_controller");
const listController = require("../controllers/list_controller");
const dimossController = require("../controllers/dimoss_controller");
const customerController = require("../controllers/customer_controller");
const khatabookController = require("../controllers/khatabook_controller");
const usersController = require("../controllers/users_controller");
const scheduler = require("../controllers/scheduler");
const backupMailer = require("../mailers/backup_mailer");
const common_function = require("../controllers/common_function");

router.get("/", passport.checkAuthentication, homeController.homePage);
router.get("/api/liveGoldRate", passport.checkAuthentication, homeController.getLiveGoldRate);
router.post("/goldPriceForm", passport.checkAuthentication, common_function.checkPermission("goldPrice"), homeController.updateGoldPriceForm);

router.get("/cart", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.cartPage);
router.get("/addToCart", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.addToCart);
router.get("/delFromCart/:id", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.delFromCart);
router.get("/clearCart", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.clearCart);
router.get("/estimateRetail", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateRetailPage);
router.get("/estimateWholesale", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateWholesalePage);
router.get("/estimateWholesale/:id", passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateWholesaleBillPage);
router.get("/soldRetailPage", passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldRetailPage);
router.post("/soldRetailForm", passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldRetailForm);
router.get("/soldWholesalePage", passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldWholesalePage);
router.post("/soldWholesaleForm", passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldWholesaleForm);

router.get("/billPage", passport.checkAuthentication, common_function.checkPermission("billView"), homeController.billPage);
router.get("/bill", passport.checkAuthentication, common_function.checkPermission("billView"), homeController.billView);


router.get("/inventorySelection", passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.invertorySelectionPage);
router.get("/inventory", passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.inventoryPage);
router.get("/inventory-query", passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.inventoryQuery);
router.get("/dataPage", passport.checkAuthentication, common_function.checkPermission("dataPage"), stockViewController.dataPage);
router.get("/analytics", passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.analyticsPage);
router.get("/dailySheet", passport.checkAuthentication, common_function.checkPermission("dataDailySheet"), stockViewController.dailySheetPage);
router.post("/customSheetPage", passport.checkAuthentication, common_function.checkPermission("dataBackDateSheet"), stockViewController.customSheetPage);
router.post("/backDateSheet", passport.checkAuthentication, common_function.checkPermission("dataBackDateSheet"), stockViewController.backDateSheetPage);
router.get("/allStock", passport.checkAuthentication, common_function.checkPermission("dataAllStock"), stockViewController.allStockPage);
router.get("/allStockApi", passport.checkAuthentication, common_function.checkPermission("dataAllInStock"), stockViewController.allStockApi);


router.get("/user_profile", passport.checkAuthentication, usersController.profilePage);
router.post("/user_profile_form", passport.checkAuthentication, usersController.profileForm);
router.get("/dimoss-website", dimossController.DimossWebsite);
router.post("/backup", passport.checkAuthentication, scheduler.Backup);
router.post("/import", scheduler.ImportData);
router.get("/clearSite", passport.checkAuthentication, common_function.checkPermission("admin"), backupMailer.DeleteAllDataPage);
router.post("/deleteAllData", passport.checkAuthentication, common_function.checkPermission("admin"), backupMailer.DeleteAllData);
module.exports = router;
