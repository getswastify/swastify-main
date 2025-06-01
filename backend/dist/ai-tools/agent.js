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
exports.getConversation = exports.handleUserMessage = void 0;
const core_1 = require("./core");
const authContext_1 = require("./authContext");
const getUserId_1 = require("../utils/getUserId");
// In-memory convo store per session (auth token based)
const userConversations = {};
function handleUserMessage(userInput) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userInput)
            throw new Error("Message is required");
        const authToken = (0, authContext_1.getCurrentAuthToken)();
        const userId = (0, getUserId_1.getUserId)(authToken);
        if (!userId)
            throw new Error("No userId found");
        // Init convo if not there
        if (!userConversations[authToken]) {
            userConversations[authToken] = { messages: [] };
        }
        const sessionMessages = userConversations[authToken].messages;
        // Add user message to convo
        sessionMessages.push({
            role: "user",
            content: userInput,
        });
        console.log(`--- LLM Input for User ${userId} ---`);
        console.log(JSON.stringify(sessionMessages, null, 2));
        const response = yield core_1.agent.invoke({ messages: sessionMessages }, {
            configurable: {
                thread_id: userId,
            },
        });
        const assistantMsg = response.messages.at(-1);
        const assistantContent = assistantMsg && typeof assistantMsg.content === "string"
            ? assistantMsg.content
            : assistantMsg && Array.isArray(assistantMsg.content)
                ? assistantMsg.content.map((c) => { var _a; return (typeof c === "string" ? c : ((_a = c.text) !== null && _a !== void 0 ? _a : "")); }).join(" ")
                : "";
        // Add assistant reply to convo
        sessionMessages.push({
            role: "assistant",
            content: assistantContent,
        });
        return assistantContent;
    });
}
exports.handleUserMessage = handleUserMessage;
function getConversation() {
    var _a, _b;
    const authToken = (0, authContext_1.getCurrentAuthToken)();
    return (_b = (_a = userConversations[authToken]) === null || _a === void 0 ? void 0 : _a.messages) !== null && _b !== void 0 ? _b : [];
}
exports.getConversation = getConversation;
