const express = require("express");
const router = express.Router();
const passport = require("passport");
const khatabookController = require("../controllers/khatabook_controller");
const common_function = require("../controllers/common_function");


router.get("/khataBook", passport.checkAuthentication, common_function.checkPermission("KhataBook-View"), khatabookController.allBooksPage);
router.post("/khataBook/add-book", passport.checkAuthentication, common_function.checkPermission("KhataBook-Add"), khatabookController.addBookApi);
router.post("/khataBook/edit-book", passport.checkAuthentication, common_function.checkPermission("KhataBook-Edit"), khatabookController.editBookApi);
router.post("/khataBook/delete-book", passport.checkAuthentication, common_function.checkPermission("KhataBook-Delete"), khatabookController.delBookApi);

router.get("/khataBook/clients", passport.checkAuthentication, common_function.checkPermission("KhataBook-View"), khatabookController.allClientsPage);
router.post("/khataBook/add-client", passport.checkAuthentication, common_function.checkPermission("KhataBook-Add"), khatabookController.addClientApi);
router.post("/khataBook/edit-client", passport.checkAuthentication, common_function.checkPermission("KhataBook-Edit"), khatabookController.editClientApi);
router.post("/khataBook/delete-client", passport.checkAuthentication, common_function.checkPermission("KhataBook-Delete"), khatabookController.delClientApi);

router.get("/khataBook/entries", passport.checkAuthentication, common_function.checkPermission("KhataBook-View"), khatabookController.allEntriesPage);
router.post("/khataBook/add-entry", passport.checkAuthentication, common_function.checkPermission("KhataBook-Add"), khatabookController.addEntryApi);
router.post("/khataBook/edit-entry", passport.checkAuthentication, common_function.checkPermission("KhataBook-Edit"), khatabookController.editEntryApi);
router.post("/khataBook/delete-entry", passport.checkAuthentication, common_function.checkPermission("KhataBook-Delete"), khatabookController.delEntryApi);

router.post("/khataBook/settle", passport.checkAuthentication, common_function.checkPermission("KhataBook-Settle"), khatabookController.settleApi);


module.exports = router;

