const express = require("express");
const router = express.Router();
router.use("/", require("./home"));

router.use("/", require("./khatabook"));
router.use("/", require("./list_master"));
router.use("/", require("./customer"));
router.use("/", require("./admin"));
router.use("/", require("./approval"));
router.use("/", require("./stock"));
router.use("/", require("./print"));

router.use("/users", require("./users"));
module.exports = router;
