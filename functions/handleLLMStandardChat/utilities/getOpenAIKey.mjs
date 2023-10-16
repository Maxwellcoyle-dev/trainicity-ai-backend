import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "amplify-ai-project/dev/openaikey";
const client = new SecretsManagerClient({
  region: "us-east-2",
});

export const getOpenAIKey = async () => {
  try {
    // Retrieve the secret value from Secrets Manager
    const openAiSecret = await client.send(
      new GetSecretValueCommand({ SecretId: secret_name })
    );

    const apiKey = openAiSecret.SecretString;
    const OPENAI_API_KEY = JSON.parse(apiKey).OPENAI_API_KEY;

    return OPENAI_API_KEY;
  } catch (error) {
    console.log({ error });
    return error;
  }
};
