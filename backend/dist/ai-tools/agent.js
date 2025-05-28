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
const prismaConnection_1 = require("../utils/prismaConnection");
const userConversations = {};
function handleUserMessage(userInput) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userInput)
            throw new Error("Message is required");
        const authToken = (0, authContext_1.getCurrentAuthToken)();
        const userId = (0, getUserId_1.getUserId)(authToken);
        if (!userId)
            throw new Error("No userId found");
        let convo = yield prismaConnection_1.prisma.conversation.findUnique({ where: { userId } });
        if (!convo) {
            convo = yield prismaConnection_1.prisma.conversation.create({
                data: {
                    userId,
                    messages: [],
                },
            });
        }
        // Ensure convo.messages is typed correctly
        const messagesArray = Array.isArray(convo.messages)
            ? convo.messages
            : [];
        const updatedMessages = [...messagesArray, {
                role: "user",
                content: userInput
            }];
        console.log(`--- LLM Input for User ${userId} ---`);
        console.log(JSON.stringify(updatedMessages, null, 2));
        // Convert messages to the expected BaseMessageLike[] format if needed
        const formattedMessages = updatedMessages.map(msg => msg ? ({
            role: msg.role,
            content: msg.content,
        }) : null).filter((msg) => msg !== null);
        const response = yield core_1.agent.invoke({ messages: formattedMessages }, {
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
        updatedMessages.push({
            role: "assistant",
            content: assistantContent,
        });
        // Save updated convo
        yield prismaConnection_1.prisma.conversation.update({
            where: { userId },
            data: { messages: updatedMessages },
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
