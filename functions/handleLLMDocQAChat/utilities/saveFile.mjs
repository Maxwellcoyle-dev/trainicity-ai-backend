import path from "path";
import fs from "fs";

// Extract the file name from the key of the object
const extractFileName = (key) => {
  const parts = key.split("/");
  return parts[parts.length - 1];
};

// Sanitize the file name
const sanitizeFileName = (filename) => {
  return filename.replace(/[^a-zA-Z0-9. -]/g, "_");
};

// Save the file to the specified location
// Expects a buffer and a filename
// Use in conjunction with getFile
export const saveFile = (buffer, filename) => {
  const folderPath = "/tmp"; // point to the /tmp directory
  const newFilename = extractFileName(filename);
  const sanitizedFilename = sanitizeFileName(newFilename);
  const filePath = path.join(folderPath, sanitizedFilename);

  try {
    if (!buffer) {
      console.error("Buffer is undefined for file:", newFilename);
      return;
    }

    // Check if directory exists, if not create it
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`File saved at ${filePath}`);
    return filePath;
  } catch (err) {
    console.error("Error saving the file:", err);
  }
};
