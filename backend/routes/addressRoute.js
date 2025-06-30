const express = require("express");
const AddressController = require("../controllers/AddressController");
const router = express.Router({ mergeParams: true });

// GET /users/:userId/addresses
router.get("/", AddressController.getAll);

// POST /users/:userId/addresses
router.post("/", AddressController.create);

// PUT /users/:userId/addresses/:addrId
router.put("/:addrId", AddressController.update);

// DELETE /users/:userId/addresses/:addrId
router.delete("/:addrId", AddressController.remove);

// PATCH /users/:userId/addresses/:addrId/default
router.patch("/:addrId/default", AddressController.setDefault);

module.exports = router;
