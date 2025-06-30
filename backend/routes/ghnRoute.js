const router = require("express").Router();
const ghnController = require("../controllers/GhnController");

router.get("/province", ghnController.getProvince);

router.get("/district", ghnController.getDistrict);

router.get("/ward", ghnController.getWard);

router.get("/calculate-fee", ghnController.calculateFee);

module.exports = router;