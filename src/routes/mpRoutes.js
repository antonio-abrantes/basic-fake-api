const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middlewares/authMiddleware");
const { mpCredentials } = require("../utils/constants");

const mpRoutes = express.Router();

mpRoutes.get("/payments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: false,
      msg: "O parâmetro ID é obrigatório.",
    });
  }

  const url = `https://api.mercadopago.com/v1/payments/${id}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: mpCredentials.token,
  };

  try {
    const response = await axios.get(url, { headers });

    return res.status(200).json({
      status: true,
      msg: "Pagamento obtido com sucesso!",
      data: response.data,
    });
  } catch (error) {
    console.error("Erro ao buscar o pagamento:", error.message);

    let errorMsg = "Erro ao buscar o pagamento.";
    if (error.response) {
      errorMsg += ` Erro: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      errorMsg += " Nenhuma resposta foi recebida do servidor.";
    } else {
      errorMsg += ` Erro na configuração: ${error.message}`;
    }

    return res.status(500).json({
      status: false,
      msg: errorMsg,
    });
  }
});

module.exports = mpRoutes;
