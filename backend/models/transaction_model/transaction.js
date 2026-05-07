const db = require("../../db/db");

const Transaction = {
  getAll: async () => {
    const sql = `SELECT * FROM transactions ORDER BY date DESC`;
    const [rows] = await db.query(sql);
    return rows;
  },

  getById: async (id) => {
    const sql = `SELECT * FROM transactions WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

getNextId: async () => {
  const [lastRow] = await db.query(
    `SELECT transaction_id FROM transactions ORDER BY id DESC LIMIT 1`
  );

  let nextId = "TK001"; 
  if (lastRow.length > 0 && lastRow[0].transaction_id) {
    const lastIdNum = parseInt(lastRow[0].transaction_id.replace("TK", ""), 10);
    nextId = `TK${(lastIdNum + 1).toString().padStart(3, "0")}`;
  }
  return nextId;
},

  create: async (data) => {
    const [lastRow] = await db.query(
      `SELECT transaction_id FROM transactions ORDER BY id DESC LIMIT 1`
    );

    let nextId = "TK001";

    if (lastRow.length > 0 && lastRow[0].transaction_id) {
      const lastIdStr = lastRow[0].transaction_id;
      const lastIdNum = parseInt(lastIdStr.replace("TK", ""), 10);
      const nextIdNum = isNaN(lastIdNum) ? 1 : lastIdNum + 1;
      nextId = `TK${nextIdNum.toString().padStart(3, "0")}`;
    }

    const sql = `
      INSERT INTO transactions 
      (transaction_id, type, category, description, amount, payment_method, reference_id, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      nextId,
      data.type,
      data.category,
      data.description,
      data.amount,
      data.payment_method,
      data.reference_id || null,
      data.date,
    ]);

    return { ...result, transaction_id: nextId };
  },

  update: async (id, data) => {
    const sql = `
      UPDATE transactions 
      SET type = ?, category = ?, description = ?, amount = ?, payment_method = ?, reference_id = ?, date = ? 
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      data.type,
      data.category,
      data.description,
      data.amount,
      data.payment_method,
      data.reference_id,
      data.date,
      id,
    ]);
    return result;
  },

  delete: async (id) => {
    const sql = `DELETE FROM transactions WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
  },

  getSummary: async () => {
    const sql = `
      SELECT 
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense,
        SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS profit
      FROM transactions
    `;
    const [rows] = await db.query(sql);
    return rows[0];
  },
};

module.exports = Transaction;