const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("SmartLingua Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});