const express = require("express");
const axios = require("axios");

const router = express.Router();

const openAiEndpoint = "https://api.openai.com/v1/chat/completions";

const command =
  "Localize a etiqueta ou cartaz de preço na imagem e identifique o nome e o preço do produto correspondente. Se houver múltiplos preços na mesma imagem, priorize o produto cujo preço estiver mais centralizado.";

router.post("/analyze-price", async (req, res) => {
  try {
    const { apiKey, imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .send({ status: false, error: "A URL da imagem é obrigatória." });
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: command },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    };

    const response = await axios.post(openAiEndpoint, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const result = response.data.choices[0].message.content;

    res.send({ status: true, message: "Consulta realizada com sucesso!", result });
  } catch (error) {
    console.error(
      "Erro ao realizar a consulta:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .send({ status: false, error: "Erro ao realizar a consulta." });
  }
});

module.exports = router;
