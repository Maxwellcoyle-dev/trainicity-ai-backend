import { OpenAI } from "openai";
import { getOpenAIKey } from "./utilities/getOpenAIKey.mjs";

const OPENAI_API_KEY = await getOpenAIKey();

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const lambdaHandler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    // Handle Preflight request
    const { httpMethod } = event;

    if (httpMethod === "OPTIONS") {
      // Handle preflight request
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // or specify your allowed origins
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Max-Age": "86400", // 24 hours
        },
        body: "",
      };
      return response;
    }
    try {
      const responseMetadata = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
      };

      responseStream = awslambda.HttpResponseStream.from(
        responseStream,
        responseMetadata
      );

      console.log("event: ", event);

      const payload = JSON.parse(event.body);
      console.log("payload: ", payload);

      const newMessages = payload.messages;
      const instructions = payload.instructions;

      const response = await openai.chat.completions.create(
        {
          model: "gpt-4-1106-preview",
          stream: true,
          max_tokens: 50000,
          messages: [
            {
              role: "system",
              content: `System Instructions: Provide all responses in markdown format with GFM enabled. Include high level of detail in your markdown format to convey the content best.
                  
                  The user may want to provide you with extra context or instructions to help them achieve their goal. Please read the CHAT CONTEXT below carefully. If it is provided, use the CHAT CONTEXT to provide the highly targeted and helpful responses to the user.
                  CHAT CONTEXT: ${instructions}
                  `,
            },
            ...newMessages,
          ],
        },
        { responseType: "stream" }
      );

      console.log("Response:", response);

      for await (const payload of response) {
        try {
          if (payload.choices[0]?.finish_reason === "stop")
            responseStream.end();
          const text = payload.choices[0].delta?.content;
          if (text) {
            responseStream.write(text);
          }
        } catch (err) {
          console.error("Error:", err);
        }
      }
    } catch (err) {
      console.log(err);
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: err.message,
        }),
      };
      if (responseStream) responseStream.end();
      return response;
    }
    //   end response
    responseStream.end();
  }
);
