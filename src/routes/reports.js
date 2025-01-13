const express = require("express");
const pdf = require('html-pdf');
const moment = require('moment');

const reportRoutes = express.Router();

function criarRelatorioPdf(dadosPedido, empresaPersonalizada, config) {
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

    let options = {
        format: formatoPapel,
        width: isPapelContinuo ? `${dimensoes[0]}mm` : undefined,
        height: isPapelContinuo ? '297mm' : undefined,
        border: {
            top: "40px",
            right: "40px",
            bottom: isPapelContinuo ? "0" : "16px",
            left: "40px"
        }
    };

    // Adiciona footer apenas se não for papel contínuo E for A4 com numeração
    if (!isPapelContinuo && config?.type_of_paper?.trim().toLowerCase() === 'a4') {
        options.footer = {
            height: "16mm",
            contents: {
                default: '<div style="text-align: right; font-size: 8px; position: fixed; bottom: 16px; right: 40px;">{{page}}/{{pages}}</div>'
            }
        };
    }

    // Configuração das dimensões
    if (config && config.type_of_paper && config.type_of_paper.toLowerCase() !== 'a4') {
        const dimensoes = config.type_of_paper.split(',').map(dim => dim.trim());
        
        if (dimensoes.length === 1 && dimensoes[0]) {
            // Papel contínuo - apenas largura
            const largura = parseInt(dimensoes[0]);
            
            options = {
                ...options,
                format: undefined,
                width: `${largura}mm`,
                height: '297mm', // Altura inicial mínima (A4)
                border: {
                    top: "10mm",
                    right: "10mm",
                    bottom: "10mm",
                    left: "10mm"
                }
            };

            // Configurações específicas para papel contínuo
            options.zoomFactor = '1',
            options.renderDelay = 1000;
            options.quality = '100';
            options.type = 'pdf';
            options.orientation = 'portrait';
            options.timeout = 120000;
            
            delete options.footer;

        } else if (dimensoes.length === 2) {
            // Papel com largura e altura definidas
            options.width = `${dimensoes[0]}mm`;
            options.height = `${dimensoes[1]}mm`;
        }
    }

    return new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Erro ao gerar buffer do PDF:', err);
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

reportRoutes.post('/generate-pdf', async (req, res) => {
    try {
        const { dados_pedido, empresa_personalizada, config } = req.body;
        
        if (!dados_pedido || !empresa_personalizada) {
            return res.status(400).json({ error: "Dados do pedido são obrigatórios" });
        }

        const buffer = await criarRelatorioPdf(dados_pedido, empresa_personalizada, config);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_pedido-${dados_pedido.orderNumber}.pdf`);
        res.send(buffer);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = reportRoutes; 