import readlineSync from 'readline-sync';
import { processInput } from './llama/llamaAgent';


console.log("👋 Welcome to Swastify AI Agent!");
console.log("Type your message below:");

async function main() {
  while (true) {
    const input = readlineSync.question('You: ');
    if (input.toLowerCase() === 'exit') break;

    const response = await processInput(input);
    console.log('AI:', response);
  }
}

main();
