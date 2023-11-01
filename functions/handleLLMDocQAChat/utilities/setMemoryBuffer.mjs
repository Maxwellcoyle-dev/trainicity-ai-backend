// memory
import { ChatMessageHistory } from "langchain/memory";
import { BufferMemory } from "langchain/memory";

// payload definition
// messages = [
//   {
//     role: "string",
//     content: "string",
//   },
// ];

export const setMemoryBuffer = async (messages) => {
  const history = new ChatMessageHistory();

  for (const message of messages) {
    if (message.role === "user") {
      await history.addUserMessage(message.content);
    } else if (message.role === "assistant") {
      await history.addAIChatMessage(message.content);
    }
  }

  console.log("history: ", history);

  // create the memory buffer
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    chatHistory: history,
    returnMessages: true,
    inputKey: "question",
    outputKey: "text",
  });

  return memory;
};
