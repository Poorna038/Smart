require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("SmartLingua Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});