const express = require("express");
const fs = require("fs");
const { Pool } = require("pg");
const router = express.Router();
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const { pgCredentiasl } = require("../utils/constants");

// Configurações de conexão ao banco de dados
const pool = new Pool(pgCredentiasl);

// Função auxiliar para esperar um pequeno tempo entre inserções
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST: /processdb
router.post("/processdb", authMiddleware, async (req, res) => {
  const { processar } = req.body;

  // Verificar a senha fornecida
  if (processar !== "processar") {
    return res.status(403).json({ message: "Senha incorreta" });
  }

  // Caminho para o arquivo client_list.json
  const filePath = path.join(__dirname, "../data/client_list.json");

  // Ler o arquivo JSON
  let jsonData;
  try {
    jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao ler o arquivo JSON", error });
  }

  // Extrair os dados
  const clientes = jsonData.data;

  console.log(`JSON contém ${clientes.length} registros.`);

  let inseridosComSucesso = 0;
  let idsProcessados = new Set(); // Para rastrear IDs processados

  try {
    // Estabelecer a conexão com o banco de dados
    const client = await pool.connect();

    try {
      for (const cliente of clientes) {
        const {
          id, // Verifique se o id está disponível e é único
          code,
          fullname,
          phone,
          cpf,
          quantity,
          total_amount,
          discount_amount,
          final_amount,
          status,
        } = cliente;

        if (idsProcessados.has(id)) {
          console.log(`Registro com ID: ${id} já foi processado. Pulando...`);
          continue; // Ignora se o ID já foi processado
        }

        // Adiciona o ID ao conjunto de processados
        idsProcessados.add(id);
        console.log(`Processando cliente com ID: ${id}`);

        // Inserir no banco de dados
        const query = `
          INSERT INTO customers (code, fullname, phone, cpf, quantity, total_amount, discount_amount, final_amount, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const values = [
          code,
          fullname,
          phone,
          cpf || null,
          quantity,
          total_amount,
          discount_amount || null,
          final_amount,
          status,
        ];

        try {
          await client.query(query, values);
          inseridosComSucesso++;
        } catch (insertError) {
          console.error(`Erro ao inserir cliente ${code}:`, insertError);
        }

        // Timeout pequeno entre inserções
      }
    } finally {
      client.release(); // Libera o cliente de volta ao pool
    }
  } catch (dbError) {
    return res
      .status(500)
      .json({ message: "Erro ao conectar ao banco de dados", error: dbError });
  }

  // Responder com o resultado final
  res.status(200).json({
    message: "Processamento concluído",
    registrosLidos: clientes.length,
    registrosInseridos: inseridosComSucesso,
    idsProcessados: Array.from(idsProcessados), // Opcional, para verificar os IDs processados
  });
});

router.get('/customers', async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        id, 
        code, 
        fullname, 
        phone, 
        cpf, 
        quantity, 
        total_amount, 
        discount_amount, 
        final_amount, 
        status
      FROM 
        customers
    `;
    const values = [];

    // Se o query param 'status' for passado, adiciona a condição de filtro
    if (status) {
      query += ` WHERE status = $1`;
      values.push(status);
    }

    const result = await client.query(query, values);

    // Retorna os dados e a contagem de registros
    res.json({
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao consultar o banco de dados', error);
    res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
  } finally {
    client.release(); // Libera o client de volta para o pool
  }
});

router.put('/customers/status', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, code, status } = req.body; // ID, code e status recebidos no corpo da requisição

    // Validação básica para garantir que o id, code e status sejam fornecidos
    if (!id || !code || !status) {
      return res.status(400).json({ error: 'Os campos id, code e status são obrigatórios.' });
    }

    // Verifica se o status é válido
    const validStatuses = ['paid', 'pending', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}.` });
    }

    // Atualiza o campo status do cliente com base no ID e no code
    const query = `
      UPDATE customers 
      SET status = $1 
      WHERE id = $2 AND code = $3
      RETURNING *;
    `;
    const values = [status, id, code];

    const result = await client.query(query, values);

    // Verifica se algum registro foi atualizado
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado ou código inválido.' });
    }

    // Retorna o cliente atualizado
    res.json({
      message: 'Status atualizado com sucesso.',
      updatedCustomer: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar o status', error);
    res.status(500).json({ error: 'Erro ao atualizar o status do cliente' });
  } finally {
    client.release(); // Libera o client de volta para o pool
  }
});

module.exports = router;
