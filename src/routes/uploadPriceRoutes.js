const express = require("express");
const { Client } = require("minio");
const uuid = require("uuid");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const { minioData } = require("../utils/constants");

const router = express.Router();

const minioClient = new Client(minioData);

const bucketName = "upload-images";

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

router.post("/upload-price", authMiddleware, async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res
        .status(400)
        .send({ status: false, error: "A imagem base64 é obrigatória." });
    }

    // Extrair o tipo de conteúdo da base64 (ex: "data:image/jpeg;base64,")
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res
        .status(400)
        .send({ status: false, error: "Formato base64 inválido." });
    }

    const contentType = matches[1];
    const imageBuffer = Buffer.from(matches[2], "base64");

    // Verifica se o tipo de conteúdo é um dos permitidos
    if (!allowedImageTypes.includes(contentType)) {
      return res
        .status(400)
        .send({ status: false, error: "Tipo de imagem não suportado." });
    }

    const extension = mime.extension(contentType);
    const uniqueId = uuid.v4();
    const fileName = `${uniqueId}.${extension}`;
    const filePath = path.join(__dirname, fileName);

    // Salvar a imagem localmente
    fs.writeFileSync(filePath, imageBuffer);

    // Upload para o MinIO
    await minioClient.fPutObject(bucketName, fileName, filePath, {
      "Content-Type": contentType,
    });

    // Deletar a imagem localmente após o upload
    fs.unlinkSync(filePath);

    // Gerar link de acesso público (presigned URL)
    const url = await minioClient.presignedGetObject(bucketName, fileName);

    res.send({
      status: true,
      message: "Upload bem-sucedido!",
      id: uniqueId,
      url,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).send({ status: false, error: "Erro ao fazer upload." });
  }
});

module.exports = router;
