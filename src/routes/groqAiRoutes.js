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

    const result = completion.choices[0]?.message?.content || "";
    // console.log("Result OK: ", result);
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
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Ocorreu um erro ao processar a solicitação",
      result: null,
    });
  }
});

module.exports = router;
