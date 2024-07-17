const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    title: "API Test Tonilab",
    version: "1.0.1",
    author: "Antônio Abrantes",
  });
});

app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
