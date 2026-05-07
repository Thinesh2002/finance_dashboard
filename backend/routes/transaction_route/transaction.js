const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transaction_controllers/transaction");

router.get("/all", transactionController.getTransactions);
router.get("/summary", transactionController.getFinanceSummary);
router.get("/next-id", transactionController.getNextTransactionId);
router.get("/:id", transactionController.getTransactionById);
router.post("/create", transactionController.createTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);


module.exports = router;