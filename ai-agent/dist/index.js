"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const readline = __importStar(require("readline"));
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const tools_1 = require("@langchain/core/tools");
const agents_1 = require("langchain/agents");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// ==== CONFIG ====
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // replace with your real key
const MODEL = "meta-llama/llama-3-8b-instruct";
// ==== TOOL ====
const listDoctorsTool = new tools_1.DynamicTool({
    name: "listDoctorsTool",
    description: "List 5 doctors with name, doctorId, speciality, and location",
    func: () => __awaiter(void 0, void 0, void 0, function* () {
        const doctors = [
            { name: "Dr. Arjun R", doctorId: "d001", speciality: "Cardiologist", location: "Bangalore" },
            { name: "Dr. Sneha K", doctorId: "d002", speciality: "Dermatologist", location: "Mumbai" },
            { name: "Dr. Vikram M", doctorId: "d003", speciality: "Neurologist", location: "Delhi" },
            { name: "Dr. Priya N", doctorId: "d004", speciality: "Pediatrician", location: "Chennai" },
            { name: "Dr. Aakash T", doctorId: "d005", speciality: "ENT", location: "Hyderabad" },
        ];
        return doctors
            .map((doc, i) => `${i + 1}. ${doc.name} (${doc.speciality}) – ${doc.location} [ID: ${doc.doctorId}]`)
            .join("\n");
    }),
});
// ==== LLM ====
const llm = new openai_1.ChatOpenAI({
    temperature: 0,
    modelName: MODEL,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
    apiKey: OPENROUTER_API_KEY,
});
// ==== CLI SETUP ====
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const ask = (q) => new Promise((res) => rl.question(q, res));
// ==== MAIN ====
function runAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = new prompts_1.PromptTemplate({
            inputVariables: ["input", "agent_scratchpad", "tools", "tool_names"],
            template: `
You are an AI assistant called gundu bhai for a medical appointment system. You have access to the following tools:

{tools}

Use the following format to reason and answer:

Question: the input question you must answer  
Thought: think through what the user is asking and what data you need  
Action: the action to take, must be one of [{tool_names}]  
Action Input: the input to the action (e.g., filters like specialization or language)  
Observation: the result of the action (list of doctors, or empty)  
... (repeat Thought/Action/Observation as needed)  
Thought: I now know the final answer  
Final Answer: the final answer to the original question in a helpful and conversational tone

Begin!

Question: {input}  
Thought: {agent_scratchpad}
  `
        });
        const agent = yield (0, agents_1.createReactAgent)({
            llm,
            tools: [listDoctorsTool],
            prompt,
        });
        const executor = new agents_1.AgentExecutor({
            agent,
            tools: [listDoctorsTool],
            verbose: false,
        });
        console.log("🤖 Gundu Bhaai is ready to help ya!\n");
        while (true) {
            const input = yield ask("🧑 You: ");
            const result = yield executor.invoke({ input });
            console.log(`\n🤖 Gundu Bhaai:\n${result.output}\n`);
        }
    });
}
runAgent();
