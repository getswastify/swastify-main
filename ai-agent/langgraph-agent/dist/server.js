"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const agent_1 = require("./core/agent");
const app = (0, express_1.default)();
const PORT = 3002;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.post('/api/message', async (req, res) => {
    const userInput = req.body.message;
    if (!userInput) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const reply = await (0, agent_1.handleUserMessage)(userInput);
        res.json({ reply });
    }
    catch (err) {
        console.error('💥 Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Gundu is live at http://localhost:${PORT}`);
});
