const express = require("express");
const router = express.Router();
const passport = require("passport");
const customerController = require("../controllers/customer_controller");
const common_function = require("../controllers/common_function");


router.get("/customer", passport.checkAuthentication, common_function.checkPermission("CustomerView"), customerController.CustomerPage);
router.get("/customerTable", passport.checkAuthentication, common_function.checkPermission("CustomerView"), customerController.CustomerPageTable);

router.post("/customer/add-customer", passport.checkAuthentication, common_function.checkPermission("CustomerAdd"), customerController.addCustomerApi);
router.post("/customer/edit-customer", passport.checkAuthentication, common_function.checkPermission("CustomerEdit"), customerController.editCustomerApi);
router.post("/customer/add-payment", passport.checkAuthentication, common_function.checkPermission("CustomerAddPayment"), customerController.addPaymentCustomerApi);
router.post("/customer/delete-payment", passport.checkAuthentication, common_function.checkPermission("CustomerDelPayment"), customerController.delPaymentCustomerApi);
router.post("/customer/delete-bill", passport.checkAuthentication, common_function.checkPermission("CustomerDelBill"), customerController.delBillCustomerApi);
router.post("/customer/delete-customer", passport.checkAuthentication, common_function.checkPermission("CustomerDel"), customerController.delCustomerApi);
router.post("/customer/settle-customer", passport.checkAuthentication, common_function.checkPermission("CustomerSettle"), customerController.settleCustomerApi);


module.exports = router;
