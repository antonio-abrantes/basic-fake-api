const express = require("express");
const cors = require("cors");
const app = express();
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadPriceRoutes = require('./routes/uploadPriceRoutes');
const openAiRoutes = require('./routes/openAiRoutes');
const groqAiRoutes = require('./routes/groqAiRoutes');
const evoRoutes = require("./routes/evoRoutes");
const processRoutes = require("./routes/processDBRoutes");

const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    title: "API Test Tonilab",
    version: "1.1.2",
    author: "Antônio Abrantes",
  });
});

app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);
app.use('/api', uploadPriceRoutes);
app.use('/api/analyze', openAiRoutes);
app.use('/api/groq', groqAiRoutes);
app.use('/api/evoRoutes', evoRoutes);
app.use('/api/process', processRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
