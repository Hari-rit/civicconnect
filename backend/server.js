const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔥 THIS MUST BE BEFORE ROUTES 🔥 */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/complaints", complaintRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/civicconnect")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
