const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;
const apiKey = "";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());

const myPhoneNumber = '5511930040208@c.us';

// Inicializando o cliente do WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "my-bot-session" // Nome único para a sessão
    })
});

client.on('qr', (qr) => {
    console.log('Escaneie este QR Code com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot do WhatsApp está pronto!');
});

client.on('message', async (message) => {
    console.log(`Mensagem recebida: ${message.body}`);
    console.log(`De: ${message.from}`);
    console.log(`Para: ${message.to}`);
    console.log(`${message.body}`);


    if (message.from !== myPhoneNumber) return;

    try {
        const result = await model.generateContent(message.body);

        const text = result.candidates && result.candidates[0]
            ? result.candidates[0].output
            : "Desculpe, não consegui gerar uma resposta.";

        message.reply(text);
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        message.reply('Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
