import "dotenv/config";
import express, { Request, Response } from "express";
import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();

// Configure CORS
app.use(cors({
    origin: 'code-dock-1rmnbgqfb-krishna9358s-projects.vercel.app/builder', // 👈 allow only your Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.post("/template", async (req: Request, res: Response) => {
    const prompt = req.body.prompt;
    
    const response = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        model: 'qwen-qwq-32b',
        max_tokens: 200,
        temperature: 0
    })

    const answer = response.choices[0]?.message?.content?.trim().toLowerCase(); // react or node
    if (answer?.includes("react")) {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if (answer?.includes("node")) {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }

    res.status(400).json({message: "Invalid response from AI model"})
    return;
})

app.post("/chat", async (req: Request, res: Response) => {
    const messages = req.body.messages;
    const systemPrompt = getSystemPrompt();
    
    const response = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...messages
        ],
        model: 'qwen-qwq-32b',
        max_tokens: 8000,
        temperature: 0
    })

    console.log(response);

    res.json({
        response: response.choices[0]?.message?.content
    });
})

app.listen(3000);

