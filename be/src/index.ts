import "dotenv/config";
import express, { Request, Response } from "express";
import Anthropic from '@anthropic-ai/sdk';
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const app = express();

// Configure CORS
app.use(cors({
    origin: ['https://code-dock-nrs5gwoaa-krishna9358s-projects.vercel.app','https://code-dock-iota.vercel.app','https://code-dock-iota.vercel.app/template','https://code-dock-iota.vercel.app/builder', 'https://code-dock-iota.vercel.app','https://code-dock-iota.vercel.app/builder', 'http://localhost:5173',"https://localhost:5173/builder", 'https://codedock.krishnamohan.tech', 'https://codedock.krishnamohan.tech/builder' , 'http://codedock.dns.army' , 'https://codedock.dns.army' , 'https://codedock.dns.army/builder'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.post("/template", async (req: Request, res: Response) => {
    const prompt = req.body.prompt;
    
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    if (!response.content || response.content.length === 0) {
        res.status(400).json({message: "Invalid response from AI model"});
        return;
    }
    const content = response.content[0];
    const answer = content.type === 'text' ? content.text.trim().toLowerCase() : '';


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
    const updatedSystemPrompt = systemPrompt + `\n\nIMPORTANT: You are an expert in Node.js and React. You are given a list of files and a prompt. You need to write the code for the prompt. Write the correct code with proper indentation and formatting. There should be no extra text or comments.
    - Make components that are reusable and can be used in other projects. Make it properly typed, with proper props and return types. Dont forget to export the component. If you fail to do so, you will get a penalty.
    - Properly generate the components and create component folder for the component if needed.
    - I am using pnpm as package manager. So use pnpm as package manager to install the dependencies. Be very careful with the dependencies especially for lucide-react.
    - If you are using lucide-react, make sure to use the correct icon name.' 
    `
    
    
    const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8191,
        system: updatedSystemPrompt,
        messages: messages
    });

    if (!response.content || response.content.length === 0) {
        res.status(400).json({message: "Invalid response from AI model"});
        return;
    }

    const content = response.content[0];
    const responseText = content.type === 'text' ? content.text : '';

    res.json({
        response: responseText
    });
})

app.listen(3000);
