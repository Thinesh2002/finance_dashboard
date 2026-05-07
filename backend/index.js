require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/user_route");
const transactionRoutes = require("./routes/transaction_route/transaction");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", authRoutes);
app.use("/api/transactions", transactionRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
