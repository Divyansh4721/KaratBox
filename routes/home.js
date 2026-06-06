const express = require('express');
const router = express.Router();
const passport = require('passport');
const homeController = require('../controllers/home_controller');
const stockController = require('../controllers/stock_controller');
const stockViewController = require('../controllers/stock_view_controller');
const adminController = require('../controllers/admin_controller');
const listController = require('../controllers/list_controller');
const dimossController = require('../controllers/dimoss_controller');
const customerController = require('../controllers/customer_controller');
const scheduler = require('../controllers/scheduler');
const backupMailer = require('../mailers/backup_mailer');
const common_function = require('../controllers/common_function');


router.get('/', passport.checkAuthentication, homeController.homePage);
router.post('/goldPriceForm', passport.checkAuthentication, common_function.checkPermission("goldPrice"), homeController.updateGoldPriceForm);


router.get('/stock/:id', passport.checkAuthentication, common_function.checkPermission("stockView"), stockController.stockViewPage);
router.get('/stock_add', passport.checkAuthentication, common_function.checkPermission("stockAdd"), stockController.stockAddPage);
router.post('/stock_add_form', passport.checkAuthentication, common_function.checkPermission("stockAdd"), stockController.stockAddForm);
router.get('/stock_edit/:id', passport.checkAuthentication, common_function.checkPermission("stockEdit"), stockController.stockEditPage);
router.post('/stock_edit_form', passport.checkAuthentication, common_function.checkPermission("stockEdit"), stockController.stockEditForm);
router.get('/stock_image_edit/:id', passport.checkAuthentication, common_function.checkPermission("stockImageEdit"), stockController.stockImageEditPage);
router.post('/stock_image_edit_form', passport.checkAuthentication, common_function.checkPermission("stockImageEdit"), stockController.stockImageEditForm);
router.get('/editMultipleStock', passport.checkAuthentication, common_function.checkPermission("stockEditMultiple"), stockController.editMultipleStock);
router.post('/editMultipleStockForm', passport.checkAuthentication, common_function.checkPermission("stockEditMultiple"), stockController.editMultipleStockForm);
router.get('/printTag', passport.checkAuthentication, common_function.checkPermission("tags"), stockController.printTag);
router.get('/printMultipleTags', passport.checkAuthentication, common_function.checkPermission("tags"), stockController.printMultipleTags);


router.get('/category', passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.categoryPage);
router.get('/categoryForm', passport.checkAuthentication, common_function.checkPermission("stockView"), stockViewController.categoryForm);
router.get('/dataPage', passport.checkAuthentication, common_function.checkPermission("dataPage"), stockViewController.dataPage);
router.get('/dailySheet', passport.checkAuthentication, common_function.checkPermission("dataDailySheet"), stockViewController.dailySheetPage);
router.post('/customSheetPage', passport.checkAuthentication, common_function.checkPermission("dataBackDateSheet"), stockViewController.customSheetPage);
router.post('/backDateSheet', passport.checkAuthentication, common_function.checkPermission("dataBackDateSheet"), stockViewController.backDateSheetPage);
router.get('/allStock', passport.checkAuthentication, common_function.checkPermission("dataAllStock"), stockViewController.allStockPage);
router.get('/allInStock', passport.checkAuthentication, common_function.checkPermission("dataAllInStock"), stockViewController.allInStockPage);
router.get('/allOutStock', passport.checkAuthentication, common_function.checkPermission("dataAllOutStock"), stockViewController.allOutStockPage);


router.get('/cart', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.cartPage);
router.get('/addToCart', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.addToCart);
router.get('/delFromCart/:id', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.delFromCart);
router.get('/clearCart', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.clearCart);
router.get('/estimateRetail', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateRetailPage);
router.get('/estimateWholesale', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateWholesalePage);
router.get('/estimateWholesale/:id', passport.checkAuthentication, common_function.checkPermission("stockView"), homeController.estimateWholesaleBillPage);


router.get('/soldRetailPage', passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldRetailPage);
router.post('/soldRetailForm', passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldRetailForm);
router.get('/soldWholesalePage', passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldWholesalePage);
router.post('/soldWholesaleForm', passport.checkAuthentication, common_function.checkPermission("stockSell"), homeController.soldWholesaleForm);
router.get('/billPage', passport.checkAuthentication, common_function.checkPermission("billView"), homeController.billPage);
router.get('/bill', passport.checkAuthentication, common_function.checkPermission("billView"), homeController.billView);


router.get('/approvalPage', passport.checkAuthentication, common_function.checkPermission("approvalAdd"), homeController.approvalAddPage);
router.post('/approvalForm', passport.checkAuthentication, common_function.checkPermission("approvalAdd"), homeController.approvalAddForm);
router.get('/approvalViewPage', passport.checkAuthentication, common_function.checkPermission("approvalView"), homeController.approvalViewPage);
router.get('/approvalRecvPage', passport.checkAuthentication, common_function.checkPermission("approvalView"), homeController.approvalRecvPage);
router.post('/approvalRecvForm', passport.checkAuthentication, common_function.checkPermission("approvalRecv"), homeController.approvalRecvForm);


router.get('/customerForm', passport.checkAuthentication, common_function.checkPermission("CustomerView"), customerController.CustomerPageForm);
router.get('/customer', passport.checkAuthentication, common_function.checkPermission("CustomerView"), customerController.CustomerPage);
router.get('/customerTable', passport.checkAuthentication, common_function.checkPermission("CustomerView"), customerController.CustomerPageTable);
router.get('/addCustomer', passport.checkAuthentication, common_function.checkPermission("CustomerAdd"), customerController.addCustomerPage);
router.post('/addCustomerForm', passport.checkAuthentication, common_function.checkPermission("CustomerAdd"), customerController.addCustomerForm);
router.post('/addPaymentCustomer', passport.checkAuthentication, common_function.checkPermission("CustomerAddPayment"), customerController.addPaymentCustomer);
router.get('/editCustomer/:id', passport.checkAuthentication, common_function.checkPermission("CustomerEdit"), customerController.editCustomerPage);
router.post('/editCustomerForm', passport.checkAuthentication, common_function.checkPermission("CustomerEdit"), customerController.editCustomerForm);
router.get('/delPaymentCustomer', passport.checkAuthentication, common_function.checkPermission("CustomerDelPayment"), customerController.delPaymentCustomer);
router.get('/delBillCustomer', passport.checkAuthentication, common_function.checkPermission("CustomerDelBill"), customerController.delBillCustomer);
router.get('/settleCustomer/:id', passport.checkAuthentication, common_function.checkPermission("CustomerSettle"), customerController.settleCustomer);


router.post('/tagNameForm', passport.checkAuthentication, common_function.checkPermission("ListMaster"), listController.updateTagNameForm);
router.get('/list_master', passport.checkAuthentication, common_function.checkPermission("ListMaster"), listController.listMasterPage);
router.get('/Kaarigar', passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.kaarigarPage);
router.post('/addKaarigar', passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.addKaarigarPage);
router.post('/editKaarigar', passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.editKaarigarPage);
router.post('/delKaarigar', passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.delKaarigarPage);
router.get('/Ornament', passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.ornamentPage);
router.post('/addOrnament', passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.addOrnamentPage);
router.post('/editOrnament', passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.editOrnamentPage);
router.post('/delOrnament', passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.delOrnamentPage);
router.get('/Prefix', passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.prefixPage);
router.post('/addPrefix', passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.addPrefixPage);
router.post('/editPrefix', passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.editPrefixPage);
router.post('/delPrefix', passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.delPrefixPage);
router.get('/Purity', passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.purityPage);
router.post('/addPurity', passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.addPurityPage);
router.post('/editPurity', passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.editPurityPage);
router.post('/delPurity', passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.delPurityPage);
router.get('/StockType', passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.stockTypePage);
router.post('/addStockType', passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.addStockTypePage);
router.post('/editStockType', passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.editStockTypePage);
router.post('/delStockType', passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.delStockTypePage);
router.get('/StoneDealer', passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.stoneDealerPage);
router.post('/addStoneDealer', passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.addStoneDealerPage);
router.post('/editStoneDealer', passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.editStoneDealerPage);
router.post('/delStoneDealer', passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.delStoneDealerPage);
router.get('/StoneType', passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.stoneTypePage);
router.post('/addStoneType', passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.addStoneTypePage);
router.post('/editStoneType', passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.editStoneTypePage);
router.post('/delStoneType', passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.delStoneTypePage);


router.get('/environment', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.environment);
router.post('/environment_form', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.environmentForm);
router.get('/session', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.sessionPage);
router.get('/session-delete/:id', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.sessionDelete);
router.get('/permission', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage);
router.get('/permission_user/:id', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage_UserButton);
router.get('/permission_user_tempPerm/:id', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage_TempPermission);
router.get('/permission_user_create', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage_UserCreatePage);
router.post('/permission_user_create_form', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage_UserCreateForm);
router.post('/permission_user_form/:id', passport.checkAuthentication, common_function.checkPermission("admin"), adminController.permissionPage_UserForm);



router.get('/dimoss-website', dimossController.DimossWebsite);




router.get('/dev', adminController.DeveloperConsole);
router.post('/backup', passport.checkAuthentication, scheduler.Backup);
router.post('/import', scheduler.ImportData);
router.get('/clearSite', passport.checkAuthentication, common_function.checkPermission("admin"), backupMailer.DeleteAllDataPage);
router.post('/deleteAllData', passport.checkAuthentication, common_function.checkPermission("admin"), backupMailer.DeleteAllData);

module.exports = router;