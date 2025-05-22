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
exports.handleUserMessage = void 0;
const core_1 = require("./core");
const threadId = "gundu-main-thread";
let patientId = null;
const globalMessages = [];
function handleUserMessage(userInput, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Push user message
        globalMessages.push({ role: 'user', content: userInput });
        patientId = userId;
        const response = yield core_1.agent.invoke({
            messages: globalMessages,
        }, {
            configurable: {
                thread_id: threadId,
            },
        });
        // Extract latest assistant message
        const assistantMsg = response.messages[response.messages.length - 1];
        const assistantContent = typeof assistantMsg.content === 'string'
            ? assistantMsg.content
            : Array.isArray(assistantMsg.content)
                ? assistantMsg.content.map((c) => { var _a; return (typeof c === 'string' ? c : (_a = c.text) !== null && _a !== void 0 ? _a : ''); }).join(' ')
                : '';
        // Push assistant reply
        globalMessages.push({
            role: 'assistant',
            content: assistantContent,
        });
        return assistantContent;
    });
}
exports.handleUserMessage = handleUserMessage;
