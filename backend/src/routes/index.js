const express = require("express");
const router = express.Router();

const locationController = require("../controllers");

router.post("/maps/search", locationController.search);

module.exports = router;
