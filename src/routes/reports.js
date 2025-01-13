const express = require("express");
const puppeteer = require('puppeteer');
const moment = require('moment');

const reportRoutes = express.Router();

async function criarRelatorioPdf(dadosPedido, empresaPersonalizada, config) {
    let formatoPapel = 'A4';  // Começa com A4 como padrão
    let isPapelContinuo = false; // Começa como false
    let dimensoes = ['210']; // Valor padrão A4 (210mm)

    if (config && config.type_of_paper) {
        // Se type_of_paper não estiver vazio
        if (config.type_of_paper.trim().toLowerCase() === 'a4') {
            formatoPapel = 'A4';
            isPapelContinuo = false;
        } else {
            dimensoes = config.type_of_paper.split(',').map(dim => dim.trim());
            
            if (dimensoes.length === 2) {
                // Papel com largura e altura definidas
                isPapelContinuo = false;
            } else if (dimensoes.length === 1 && dimensoes[0]) {
                // Papel contínuo - apenas largura
                isPapelContinuo = true;
            }
        }
    } else {
        // Se type_of_paper estiver vazio ou não existir
        formatoPapel = undefined;
        isPapelContinuo = true;
        dimensoes = ['210']; // Força largura do A4
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: ${isPapelContinuo ? `${dimensoes[0]}mm auto` : 'auto'};
                    margin: ${isPapelContinuo ? '10mm' : '40px 40px 32px 40px'};
                }
                body { 
                    font-family: Arial, sans-serif;
                    margin: 0;
                    position: relative;
                    ${isPapelContinuo ? `
                    page-break-inside: avoid;
                    overflow-y: visible;
                    ` : ''}
                }
                .header { 
                    text-align: center;
                    margin-bottom: 20px;
                }
                .title { 
                    font-size: 16px; 
                    font-weight: bold; 
                    margin-bottom: 10px;
                }
                .line { 
                    border-top: 1px solid #ECECEC; 
                    margin: 10px 0;
                }
                .pedido-title {
                    text-align: center;
                    margin: 1rem 0;
                }
                .content-section {
                    margin: 20px 0;
                }
                .content-section-info {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                }
                .content-section-info * {
                    margin-bottom: 2px;
                }
                .item {
                    margin-bottom: 15px;
                }
                .item-details {
                    margin-left: 20px;
                    margin-bottom: 10px;
                    position: relative;
                    padding-right: 12px;
                    background-color: #f9f9f9;
                }
                .item-price {
                    position: absolute;
                    right: 0;
                    text-align: right;
                    white-space: nowrap;
                }
                .summary {
                    margin: 20px 0;
                    padding-right: 0;
                    position: relative;
                }
                .summary-row {
                    margin: 5px 0;
                    position: relative;
                    padding-right: 12px;
                }
                .summary-row span:last-child {
                    position: absolute;
                    right: 0;
                    text-align: right;
                    white-space: nowrap;
                }
                .footer { 
                    display: ${isPapelContinuo ? 'none' : 'block'};
                    text-align: right;
                    font-size: 8px;
                    padding-right: 20px;
                    margin-bottom: 5px;
                }
                h3 {
                    margin-top: 25px;
                    margin-bottom: 15px;
                    color: #333;
                }
                .observations {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f9f9f9;
                }
                
                ${isPapelContinuo ? `
                .footer { 
                    display: none;
                }` : ''}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${empresaPersonalizada.name}</div>
                <div>${empresaPersonalizada.address}</div>
                <div>CNPJ: ${empresaPersonalizada.cnpj}</div>
            </div>

            <div class="line"></div>
            
            <div class="pedido-title">
                <h2>Via do Pedido</h2>
            </div>

            <div class="line"></div>

            <div class="content-section-info">
                <div><strong>${empresaPersonalizada.customer_name}</strong></div>
                <div>Realizado em ${moment(dadosPedido.orderDate).format('DD/MM/YYYY [às] HH:mm')}</div>
                <div>Previsão de Entrega: ${moment(dadosPedido.orderDeliveryForecast).format('DD/MM/YYYY')}</div>
            </div>

            <div class="line"></div>

            <h3>Itens do Pedido</h3>
            <div class="content-section">
                ${dadosPedido.items.map(item => `
                    <div class="item">
                        <strong>${item.productExternalCode} ${item.productName}</strong>
                        <div class="item-details">
                            ${item.quantity} ${item.unitOfMeasure} x R$ ${item.price.toFixed(2)}
                            <span style="float: right">R$ ${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="line"></div>

            <h3>Resumo de valores</h3>
            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>R$ ${dadosPedido.totalAmount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Desconto</span>
                    <span>- R$ ${dadosPedido.discountValue.toFixed(2)}</span>
                </div>
                <div class="summary-row" style="font-weight: bold">
                    <span>Total a pagar</span>
                    <span>R$ ${dadosPedido.finalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div class="line"></div>

            <h3>Condição de Pagamento</h3>
            <div class="content-section">
                ${dadosPedido.payments.map(payment => `
                    <div>${payment.installments}x no ${payment.paymentMethodName}</div>
                `).join('')}
            </div>

            <h3>Observação</h3>
            <div class="observations">
                ${dadosPedido.observations}
            </div>

            </body>
            </html>
    `;

    // Configurações base do PDF
    let pdfOptions = {
        format: formatoPapel?.toLowerCase(),
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
            top: isPapelContinuo ? "10mm" : "40px",
            right: isPapelContinuo ? "10mm" : "40px",
            bottom: isPapelContinuo ? "10mm" : "32px",
            left: isPapelContinuo ? "10mm" : "40px"
        }
    };

    // Configuração das dimensões personalizadas
    if (config?.type_of_paper) {
        const paperType = config.type_of_paper.trim();
        
        if (paperType === '') {
            pdfOptions = {
                ...pdfOptions,
                format: 'a4',
                displayHeaderFooter: false,
                preferCSSPageSize: true
            };
        } else if (paperType.toLowerCase() === 'a4') {
            pdfOptions.displayHeaderFooter = true;
            pdfOptions.headerTemplate = '<div></div>';
            pdfOptions.footerTemplate = `
                <div style="text-align: right; font-size: 8px; width: 100%; padding-right: 40px;">
                    <span class="pageNumber"></span>/<span class="totalPages"></span>
                </div>
            `;
        } else {
            const dimensoes = paperType.split(',').map(dim => dim.trim());
            
            if (dimensoes.length === 1 && dimensoes[0]) {
                // Papel contínuo - apenas largura
                pdfOptions = {
                    ...pdfOptions,
                    format: undefined,
                    width: `${dimensoes[0]}mm`,
                    height: '297mm',
                    preferCSSPageSize: true,
                    displayHeaderFooter: false
                };
            } else if (dimensoes.length === 2) {
                // Papel com largura e altura definidas
                pdfOptions = {
                    ...pdfOptions,
                    format: undefined,
                    width: `${dimensoes[0]}mm`,
                    height: `${dimensoes[1]}mm`,
                    preferCSSPageSize: true,
                    displayHeaderFooter: true,
                    headerTemplate: '<div></div>',
                    footerTemplate: `
                        <div style="text-align: right; font-size: 8px; width: 100%; padding-right: 40px;">
                            <span class="pageNumber"></span>/<span class="totalPages"></span>
                        </div>
                    `
                };
            }
        }
    } else {
        pdfOptions = {
            ...pdfOptions,
            format: 'a4',
            displayHeaderFooter: false,
            preferCSSPageSize: true
        };
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        // Gera o PDF
        const buffer = await page.pdf(pdfOptions);

        // Fecha o navegador
        await browser.close();

        return buffer;
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        throw error;
    }
}

reportRoutes.post('/generate-pdf', async (req, res) => {
    try {
        const { dados_pedido, empresa_personalizada, config } = req.body;
        
        if (!dados_pedido || !empresa_personalizada) {
            return res.status(400).json({ error: "Dados do pedido são obrigatórios" });
        }

        const buffer = await criarRelatorioPdf(dados_pedido, empresa_personalizada, config);
        
        // Configuração correta dos headers
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': buffer.length,
            'Content-Disposition': `attachment; filename=relatorio_pedido-${dados_pedido.orderNumber}.pdf`
        });

        // Envia o buffer como um stream
        res.end(buffer);

    } catch (error) {
        console.error('Erro no endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = reportRoutes; 