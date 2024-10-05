const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Importando o cors

const app = express();
const PORT = 5000;

// Usando o middleware CORS
app.use(cors()); // Isso permite todas as origens

// Configura o middleware
app.use(bodyParser.json());

// Cria o diretório uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Rota para cadastrar aluno
app.post('/cadastrar', (req, res) => {
    const { periodo, responsavel_buscar, nome_aluno, nome_mae, nome_pai, data_nascimento, endereco, cidade, telefone, email, serie_aluno } = req.body;

    const conteudo = `
    Nome do Aluno: ${nome_aluno}
    Período: ${periodo}
    Responsável Buscar: ${responsavel_buscar}
    Nome da Mãe: ${nome_mae}
    Nome do Pai: ${nome_pai}
    Data de Nascimento: ${data_nascimento}
    Endereço: ${endereco}
    Cidade: ${cidade}
    Telefone: ${telefone}
    Email: ${email}
    Série: ${serie_aluno}
    `;

    // Nome do arquivo
    const filePath = path.join(uploadsDir, `${nome_aluno}.txt`);

    // Escreve o arquivo
    fs.writeFile(filePath, conteudo, (err) => {
        if (err) {
            console.error('Erro ao criar o arquivo:', err);
            return res.status(500).send('Erro ao criar o arquivo');
        }
        console.log('Arquivo criado com sucesso:', filePath);
        res.send('Arquivo criado com sucesso');
    });
});

// Rota para receber os dados dos alunos
app.get('/alunos', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Erro ao ler os arquivos');
        }
        
        const alunos = [];

        // Lê cada arquivo .txt e armazena seu conteúdo
        files.forEach(file => {
            if (path.extname(file) === '.txt') {
                const filePath = path.join(uploadsDir, file);
                const data = fs.readFileSync(filePath, 'utf8');
                const alunoInfo = {};
                
                // Processa os dados do arquivo
                data.split('\n').forEach(line => {
                    const [key, value] = line.split(':').map(item => item.trim());
                    if (key && value) {
                        alunoInfo[key] = value;
                    }
                });
                
                alunoInfo.id = file; // Armazena o nome do arquivo como ID
                alunos.push(alunoInfo);
            }
        });

        res.json(alunos);
    });
});

// Rota para apagar aluno
app.post('/apagar_aluno', (req, res) => {
    const { id } = req.body; // O ID é o nome do arquivo

    const filePath = path.join(uploadsDir, id); // Constrói o caminho do arquivo

    // Verifica se o arquivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Arquivo não encontrado:', err);
            return res.status(404).send('Arquivo não encontrado');
        }

        // Remove o arquivo
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Erro ao apagar o arquivo:', err);
                return res.status(500).send('Erro ao apagar o arquivo');
            }
            console.log('Arquivo apagado com sucesso:', filePath);
            res.send('Arquivo apagado com sucesso');
        });
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
