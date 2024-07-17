const express = require("express");
const { userAdmin, tokenApp } = require("../utils/constants");
const router = express.Router();

router.post("/token", (req, res) => {
  try {
    const { user, password } = req.body;
    // console.log({ user, password });
    if (user === userAdmin.user && password === userAdmin.password) {
      return res.json({ token: tokenApp });
    } else {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    console.error("Erro na rota /token:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

module.exports = router;
