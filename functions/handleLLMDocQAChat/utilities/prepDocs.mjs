// Loaders
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

// Text splitter
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const prepDocs = async () => {
  try {
    // Load the documents to use as context.
    const loader = new DirectoryLoader("/tmp", {
      ".pdf": (path) => new PDFLoader(path),
      ".docx": (path) => new DocxLoader(path),
      ".txt": (path) => new TextLoader(path),
    });
    const loadedDocs = await loader.load();

    // Split the documents into chunks.
    // 1. set up a text splitter with options
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // 2. call splitDocuments on the text splitter
    const splitDocs = await textSplitter.splitDocuments(loadedDocs);
    return splitDocs;
  } catch (err) {
    console.error("prepDocs Error: ", err);
  }
};
