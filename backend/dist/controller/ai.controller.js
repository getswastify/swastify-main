"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceTTS = exports.voiceBook = void 0;
const authContext_1 = require("../ai-tools/authContext");
const agent_1 = require("../ai-tools/agent");
const axios_1 = __importDefault(require("axios"));
const voiceBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userInput = req.body.message;
    if (!userInput) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // 👇 Wrap handleUserMessage in auth context
        const reply = yield (0, authContext_1.setAuthContext)(authToken, () => (0, agent_1.handleUserMessage)(userInput));
        res.json({ reply });
    }
    catch (err) {
        console.error('💥 Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.voiceBook = voiceBook;
const voiceTTS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message, voice = "alloy" } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Text is required" });
    }
    try {
        const response = yield axios_1.default.post("https://shash-mb58ygyd-northcentralus.cognitiveservices.azure.com/openai/deployments/tts/audio/speech?api-version=2025-03-01-preview", {
            model: "tts",
            input: message,
            voice: voice,
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.AZURE_AI_FOUNDRY_KEY}`,
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
        });
        res.setHeader("Content-Type", "audio/mpeg");
        res.send(response.data);
    }
    catch (err) {
        console.log(err);
        console.error("💥 Azure TTS Error:", ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        res.status(500).json({ error: "TTS generation failed" });
    }
});
exports.voiceTTS = voiceTTS;
