const express = require("express");
const { userAdmin, tokenApp, users } = require("../utils/constants");
const router = express.Router();

router.post("/token", (req, res) => {
  try {
    const { user, password } = req.body;

    // Verifica se é o userAdmin
    if (user === userAdmin.user && password === userAdmin.password) {
      return res.json({ token: tokenApp, role: "admin" });
    }

    // Verifica no array de usuários
    const foundUser = users.find(
      (u) => u.user === user && u.password === password
    );

    if (foundUser) {
      return res.json({ token: tokenApp, role: foundUser.role });
    } else {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    console.error("Erro na rota /token:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

module.exports = router;
