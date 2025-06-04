const express = require("express");
const router = express.Router();

const locationController = require("../controllers");

router.post("/search", locationController.search);

module.exports = router;
