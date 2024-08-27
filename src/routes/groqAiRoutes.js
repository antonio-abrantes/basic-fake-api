const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Groq = require("groq-sdk");

router.post("/completions", authMiddleware, async (req, res) => {
  const { apiKey, promptContext, prompt, model } = req.body;

  if (!apiKey || !promptContext || !prompt) {
    return res.status(400).json({
      status: false,
      message: "apiKey, promptContext, e prompt são obrigatórios",
      result: null,
    });
  }

  const groq = new Groq({ apiKey });

  const retryRequest = async (attempts = 3, delay = 1000) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content:
              "Conforme o contexto: " +
              promptContext +
              ", siga estritamente o que é pedido a seguir: " +
              prompt,
          },
        ],
        model: model,
      });

      return completion;
    } catch (error) {
      if (
        attempts === 0 ||
        ![503, 502, 504].includes(error?.response?.status)
      ) {
        throw error;
      }
      console.log(
        `Erro na API da Groq, tentativa restante: ${attempts}. Tentando novamente em ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(attempts - 1, delay * 2); // Retry with exponential backoff
    }
  };

  try {
    const completion = await retryRequest();

    console.log({ name: "GroqResult", data: completion });

    const result = completion.choices[0]?.message?.content || "";
    const cleanedJsonString = result.replace(/```json|```/g, "").trim();

    try {
      const jsonObject = JSON.parse(cleanedJsonString);
      res.json({
        status: true,
        message: "Solicitação concluída com sucesso",
        jsonObject,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "Erro ao processar o JSON",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Erro ao processar a solicitação: ", error.message);
    res.status(500).json({
      status: false,
      message: "Ocorreu um erro ao processar a solicitação",
      result: null,
    });
  }
});

module.exports = router;
