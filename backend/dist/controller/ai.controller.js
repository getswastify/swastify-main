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
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceBook = void 0;
const agent_1 = require("../ai-tools/agent");
const voiceBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userInput = req.body.message;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userInput) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'Not Authenticated! User ID is required' });
    }
    try {
        const reply = yield (0, agent_1.handleUserMessage)(userInput, userId);
        res.json({ reply });
    }
    catch (err) {
        console.error('💥 Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.voiceBook = voiceBook;
