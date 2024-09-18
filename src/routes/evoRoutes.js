const express = require('express');
const axios = require('axios');
const authMiddleware = require("../middlewares/authMiddleware");
const { evoApiBaseUrl, evoApiKey } = require("../utils/constants");

const evoRoutes = express.Router();

// Substitua apiBaseUrl e apiKey pelos seus valores reais
const apiBaseUrl = evoApiBaseUrl
const apiKey = evoApiKey;

evoRoutes.post('/sendMessage', authMiddleware, async (req, res) => {
    const { botName, number, textMessage } = req.body;

    // Validações básicas
    if (!botName || !number || !textMessage) {
        return res.status(400).json({
            status: false,
            msg: 'Parâmetros botName, number e textMessage são obrigatórios.',
        });
    }

    const url = `${apiBaseUrl}/message/sendText/${botName}`;
    const body = {
        number: number,
        text: textMessage
    };
    const headers = {
        'Content-Type': 'application/json',
        'Apikey': apiKey
    };

    try {
        const response = await axios.post(url, body, { headers });

        return res.status(200).json({
            status: true,
            msg: 'Mensagem enviada com sucesso!',
            data: response.data
        });
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error.message);

        let errorMsg = 'Erro ao enviar a mensagem.';
        if (error.response) {
            // O request foi feito e o servidor respondeu com um código de status fora da faixa 2xx
            errorMsg += ` Erro: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            // O request foi feito mas nenhuma resposta foi recebida
            errorMsg += ' Nenhuma resposta foi recebida do servidor.';
        } else {
            // Algo aconteceu na configuração do request que provocou um erro
            errorMsg += ` Erro na configuração: ${error.message}`;
        }

        return res.status(500).json({
            status: false,
            msg: errorMsg
        });
    }
});

module.exports = evoRoutes;
