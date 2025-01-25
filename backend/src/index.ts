require("dotenv").config();

const groqApiKey = process.env.GROQ_API_KEY;

import express from "express";
import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { basePrompt as nodeBasePrompt } from "./defaults/node";

// initialization
const groq = new Groq({ apiKey: groqApiKey });
const app = express();

app.use(express.json());

// route to get the template based on the user prompt project type
app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Return either a react or node based on what you think this project should be. Only return the single word 'react' or 'node' in your response.",
      },
      { role: "user", content: prompt }, // prompt from user body
    ],
    model: "llama3-8b-8192",
  });

  // getting the answer from the LLM what is tech stack of the project
  const answer = chatCompletion.choices[0].message.content;
  if (answer == "react" || answer == "React") {
    // base prompt to go to llm models
    // ui prompt to go to ui to create files
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: [reactBasePrompt],
    });
  } else if (answer == "node" || answer == "Node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: [nodeBasePrompt],
    });
  } else {
    res.status(403).json({
      error:
        "Invalid response from LLM as template is not supported or wrong response from LLM",
    });
  }
});

// route to get the chat response from the LLM to generate the actual ui code according to the user prompt
app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: getSystemPrompt(),
      },
      { role: "user", content: JSON.stringify(messages) },
    ],
    model: "llama3-8b-8192",
    stream: true,
  });

  // ? This is optional part , creating it just for the sake of streaming otherwise it is not needed.
  let result = "";
  for await (const chunk of response) {
    result += chunk.choices[0]?.delta?.content || ""; // to write the response to the console without a new line
  }

  res.json({
    response: result,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//! This is for testing the LLM model and prompts and is not used in the production.
// // to create a chat completion
// async function main() {
//   const chatCompletion = await groq.chat.completions.create({
//     //system prompt is for the llm to know the constraints and capabilities and identify himself
//     //user prompt is for the user to ask the llm to do something
//     messages: [
//       { role: "system", content: getSystemPrompt() },
//       { role: "user", content: BASE_PROMPT }, //Base prompt -> for all the prompts to go
//       {
//         role: "user",
//         content: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//       }, // Base prompt to specify the file structure to go with user prompt
//       { role: "user", content: "write the todo app in react" }, // user specified prompt
//     ],
//     model: "llama3-8b-8192",
//     temperature: 0, // controls randomness
//     // max_tokens: 1024, // max number of tokens in the response
//     top_p: 1, // controls randomness
//     stream: true, // to stream the response
//     stop: null,
//   });

//   // to stream the response
//   for await (const chunk of chatCompletion) {
//     process.stdout.write(chunk.choices[0]?.delta?.content || ""); // to write the response to the console without a new line
//   }
// }

// main();
