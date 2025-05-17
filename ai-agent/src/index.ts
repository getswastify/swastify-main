import * as readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { createReactAgent, AgentExecutor } from "langchain/agents";
import {config} from "dotenv"

config()
// ==== CONFIG ====
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // replace with your real key
const MODEL = "meta-llama/llama-3-8b-instruct";

// ==== TOOL ====
const listDoctorsTool = new DynamicTool({
  name: "listDoctorsTool",
  description: "List 5 doctors with name, doctorId, speciality, and location",
  func: async () => {
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
  },
});

// ==== LLM ====
const llm = new ChatOpenAI({
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
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

// ==== MAIN ====
async function runAgent() {
const prompt = new PromptTemplate({
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


  const agent = await createReactAgent({
    llm,
    tools: [listDoctorsTool],
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [listDoctorsTool],
    verbose: false,
  });

  console.log("🤖 Gundu Bhaai is ready to help ya!\n");

  while (true) {
    const input = await ask("🧑 You: ");
    const result = await executor.invoke({ input });
    console.log(`\n🤖 Gundu Bhaai:\n${result.output}\n`);
  }
}

runAgent();
