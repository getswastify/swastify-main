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
exports.getCurrentAuthToken = exports.handleUserMessage = void 0;
const core_1 = require("./core");
// Store messages with their auth tokens
const globalMessages = [];
// Store the current auth token for tool execution
let currentAuthToken = "";
// Update the handleUserMessage function
function handleUserMessage(userInput, authToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userInput) {
            throw new Error("Message is required");
        }
        // Store the auth token for tool execution
        currentAuthToken = authToken;
        // Add the user message (without modifying it)
        globalMessages.push({
            role: "user",
            content: userInput,
            auth_token: authToken, // Store for reference, but AI won't use this directly
        });
        // Log the messages going to the LLM
        console.log("--- Input Messages to LLM ---");
        console.log(JSON.stringify(globalMessages, null, 2));
        console.log("Current auth token:", currentAuthToken);
        // Call the agent
        const response = yield core_1.agent.invoke({
            messages: globalMessages.map((msg) => ({ role: msg.role, content: msg.content })), // Only pass role and content
        }, {
            configurable: {
                thread_id: authToken,
            },
        });
        // Log the full response from the LLM/agent
        console.log("--- LLM Response ---");
        console.log(JSON.stringify(response, null, 2));
        // Extract latest assistant message
        const assistantMsg = response.messages[response.messages.length - 1];
        const assistantContent = typeof assistantMsg.content === "string"
            ? assistantMsg.content
            : Array.isArray(assistantMsg.content)
                ? assistantMsg.content.map((c) => { var _a; return (typeof c === "string" ? c : ((_a = c.text) !== null && _a !== void 0 ? _a : "")); }).join(" ")
                : "";
        // Push assistant reply
        globalMessages.push({
            role: "assistant",
            content: assistantContent,
        });
        return assistantContent;
    });
}
exports.handleUserMessage = handleUserMessage;
// Export the function to get the current auth token
function getCurrentAuthToken() {
    return currentAuthToken;
}
exports.getCurrentAuthToken = getCurrentAuthToken;
