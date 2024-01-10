// LLM
import { ChatOpenAI } from "langchain/chat_models/openai";

// Chain
import { ConversationalRetrievalQAChain } from "langchain/chains";

// Embedding / Vector Store
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// utility functions
import { getThread } from "./getThread.mjs";
import { prepDocs } from "./prepDocs.mjs";
import { setMemoryBuffer } from "./setMemoryBuffer.mjs";
import { updateThread } from "./updateThread.mjs";

// messageID
import { v4 as uuidv4 } from "uuid";

// payload definition
// const payload = {
//   apiKey: "",
//   question: "",
//   userID: "",
//   threadID: "",
// };

export const main = async (payload) => {
  try {
    // get 2 versions of the messages array
    // 1. for the buffer memory
    // 2. for the message update
    const { bufferMessageList, messageList } = await getThread(
      payload.userID,
      payload.threadID
    );

    let newMessageList = [];
    // if there are no messages for this thread,
    // update the thread messages with the new message from the user
    // else do the same but add the new message to the end of the array
    if (!messageList || messageList?.length === 0) {
      newMessageList = [
        {
          role: "user",
          content: payload.question,
          messageID: uuidv4(),
        },
      ];
      const newMessagePayload = {
        newMessageList: newMessageList,
        userID: payload.userID,
        threadID: payload.threadID,
      };
      updateThread(newMessagePayload);
    } else {
      newMessageList = [
        ...messageList,
        {
          role: "user",
          content: payload.question,
          messageID: uuidv4(),
        },
      ];
      const newMessagePayload = {
        newMessageList: newMessageList,
        userID: payload.userID,
        threadID: payload.threadID,
      };
      updateThread(newMessagePayload);
    }

    // send messages array to memory buffer
    const bufferMemory = await setMemoryBuffer(bufferMessageList);

    // Load the documents to use as context.
    const splitDocs = await prepDocs();

    // Set up embeddings with the OpenAIEmbeddings class.
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: payload.apiKey,
    });

    // Create a vector store - pass documents and openAIEmbeddings.
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    // Create a chat model to use in the chain
    const model = new ChatOpenAI({
      model: "gpt-4-1106-preview",
      openAIApiKey: payload.apiKey,
    });

    // Create a chain that uses the OpenAI LLM and MemoryVectorStore.
    // in options pass in the memory buffer + returnSourceDocuments: true / false
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
        memory: bufferMemory,
      }
    );

    // call the chain using the question from the payload - user submission
    const res = await chain.call({
      question: payload.question,
    });

    console.log("Res: ", res);

    newMessageList.push({
      role: "assistant",
      content: res.text,
      messageID: uuidv4(),
    });
    const newMessagePayload = {
      newMessageList: newMessageList,
      userID: payload.userID,
      threadID: payload.threadID,
    };
    updateThread(newMessagePayload);

    return { res };
  } catch (error) {
    console.log({ error });
    return error;
  }
};
