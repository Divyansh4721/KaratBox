const express = require("express");
const router = express.Router();
const passport = require("passport");
const listController = require("../controllers/list_controller");
const common_function = require("../controllers/common_function");

router.get("/list_master", passport.checkAuthentication, common_function.checkPermission("ListMaster"), listController.listMasterPage);
router.post("/list_master/update-tag-name", passport.checkAuthentication, common_function.checkPermission("ListMaster"), listController.updateTagNameFormApi);

router.get("/list_master/kaarigar", passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.kaarigarPage);
router.post("/list_master/kaarigar/add-kaarigar", passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.addKaarigarApi);
router.post("/list_master/kaarigar/edit-kaarigar", passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.editKaarigarApi);
router.post("/list_master/kaarigar/delete-kaarigar", passport.checkAuthentication, common_function.checkPermission("ListKaarigar"), listController.delKaarigarApi);

router.get("/list_master/ornament", passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.ornamentPage);
router.post("/list_master/ornament/add-ornament", passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.addOrnamentApi);
router.post("/list_master/ornament/edit-ornament", passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.editOrnamentApi);
router.post("/list_master/ornament/delete-ornament", passport.checkAuthentication, common_function.checkPermission("ListOrnament"), listController.delOrnamentApi);

router.get("/list_master/prefix", passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.prefixPage);
router.post("/list_master/prefix/add-prefix", passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.addPrefixApi);
router.post("/list_master/prefix/edit-prefix", passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.editPrefixApi);
router.post("/list_master/prefix/delete-prefix", passport.checkAuthentication, common_function.checkPermission("ListPrefix"), listController.delPrefixApi);

router.get("/list_master/purity", passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.purityPage);
router.post("/list_master/purity/add-purity", passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.addPurityApi);
router.post("/list_master/purity/edit-purity", passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.editPurityApi);
router.post("/list_master/purity/delete-purity", passport.checkAuthentication, common_function.checkPermission("ListPurity"), listController.delPurityApi);

router.get("/list_master/stocktype", passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.stockTypePage);
router.post("/list_master/stocktype/add-stocktype", passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.addStockTypeApi);
router.post("/list_master/stocktype/edit-stocktype", passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.editStockTypeApi);
router.post("/list_master/stocktype/delete-stocktype", passport.checkAuthentication, common_function.checkPermission("ListStockType"), listController.delStockTypeApi);

router.get("/list_master/stonedealer", passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.stoneDealerPage);
router.post("/list_master/stonedealer/add-stonedealer", passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.addStoneDealerApi);
router.post("/list_master/stonedealer/edit-stonedealer", passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.editStoneDealerApi);
router.post("/list_master/stonedealer/delete-stonedealer", passport.checkAuthentication, common_function.checkPermission("ListStoneDealer"), listController.delStoneDealerApi);

router.get("/list_master/stonetype", passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.stoneTypePage);
router.post("/list_master/stonetype/add-stonetype", passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.addStoneTypeApi);
router.post("/list_master/stonetype/edit-stonetype", passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.editStoneTypeApi);
router.post("/list_master/stonetype/delete-stonetype", passport.checkAuthentication, common_function.checkPermission("ListStoneType"), listController.delStoneTypeApi);

module.exports = router;
