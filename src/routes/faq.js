const express = require("express");
const fs = require('fs').promises;
const path = require('path');

const faqRoutes = express.Router();

faqRoutes.post('/create-faq', async (req, res) => {
    try {
        const { faqData, faqId } = req.body;
        const faqDataTemp = `{{START_FAQ}} ${faqData} {{END_FAQ}}`;
        console.log(faqDataTemp);
        
        const faqDir = path.join(__dirname, '../faqs');
        await fs.mkdir(faqDir, { recursive: true });
        
        // Processamento 1: Criar arquivo individual do FAQ
        const individualFaqPath = path.join(faqDir, `${faqId}.txt`);
        await fs.writeFile(individualFaqPath, faqDataTemp);
        
        // Processamento 2: Adicionar ao arquivo faqList.txt
        const faqListPath = path.join(__dirname, '../faqList.txt');
        await fs.appendFile(faqListPath, faqDataTemp + '\n\n');
        
        res.status(200).json({
            success: true,
            message: 'FAQ processado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao processar FAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar FAQ',
            error: error.message
        });
    }
});

module.exports = faqRoutes; 