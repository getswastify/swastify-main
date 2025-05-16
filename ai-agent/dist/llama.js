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
exports.askGundu = void 0;
const prompts_1 = require("./prompts");
const tools_1 = require("./tools");
const utils_1 = require("./utils");
const askGundu = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = [
        { role: 'system', content: prompts_1.systemPrompt },
        { role: 'user', content: input },
    ];
    const response = yield (0, utils_1.chatWithLLaMA)(messages);
    if (response.tool_call) {
        const toolResult = yield (0, tools_1.toolCallHandler)(response.tool_call);
        messages.push({ role: 'tool', content: JSON.stringify(toolResult) });
        const finalReply = yield (0, utils_1.chatWithLLaMA)(messages);
        return finalReply.content;
    }
    return response.content;
});
exports.askGundu = askGundu;
