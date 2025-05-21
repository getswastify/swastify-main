"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserMessage = void 0;
// src/core/agent.ts
const core_1 = require("./core");
const threadId = "gundu-main-thread";
const globalMessages = [];
async function handleUserMessage(userInput) {
    // Push user message
    globalMessages.push({ role: 'user', content: userInput });
    const response = await core_1.agent.invoke({
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
}
exports.handleUserMessage = handleUserMessage;
