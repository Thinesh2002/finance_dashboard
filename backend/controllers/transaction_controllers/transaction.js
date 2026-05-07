const Transaction = require("../../models/transaction_model/transaction");

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.getById(req.params.id);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const data = req.body;
    
    const result = await Transaction.create(data);

    res.json({
      success: true,
      message: "Transaction Created",
      id: result.insertId,
      transaction_id: result.transaction_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    await Transaction.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Transaction Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.delete(req.params.id);
    res.json({
      success: true,
      message: "Transaction Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getFinanceSummary = async (req, res) => {
  try {
    const summary = await Transaction.getSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


exports.getNextTransactionId = async (req, res) => {
  try {
    const nextId = await Transaction.getNextId();
    res.json({ success: true, nextId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};