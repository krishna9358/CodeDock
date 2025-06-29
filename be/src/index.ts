import "dotenv/config";
import express, { Request, Response } from "express";
// import Anthropic from '@anthropic-ai/sdk';
import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";

// const anthropic = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY
// });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();

// Configure CORS
app.use(cors({
    origin: ['https://code-dock-nrs5gwoaa-krishna9358s-projects.vercel.app', 'https://code-dock-iota.vercel.app','https://code-dock-iota.vercel.app/builder', 'http://localhost:5173',"https://localhost:5173/builder", 'https://codedock.krishnamohan.tech', 'https://codedock.krishnamohan.tech/builder' , 'http://codedock.dns.army' , 'https://codedock.dns.army' , 'https://codedock.dns.army/builder'],
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
    
    // const response = await anthropic.messages.create({
    //     // model: "claude-sonnet-4-20250514",
    //     model: "claude-3-5-haiku-20241022",
    //     max_tokens: 200,
    //     messages: [
    //         {
    //             role: 'user',
    //             content: [{type: "text",
    //                 text: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra\n\n" + prompt}]
    //         }
    //     ]
    // });

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra\n\n" 
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        model: 'llama3-70b-8192',
        max_tokens: 200,
        temperature: 0

    })
    const answer = response.choices[0]?.message?.content?.trim().toLowerCase(); // react or node

    // if (!response.content || response.content.length === 0) {
    //     res.status(400).json({message: "Invalid response from AI model"});
    //     return;
    // }
    // const content = response.content[0];
    // const answer = content.type === 'text' ? content.text.trim().toLowerCase() : '';


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
    - If you are using lucide-react, make sure to use the correct icon name.
    
    FIX THE ERROR:
    SyntaxError: The requested module '/node_modules/.pnpm/lucide-react@0.344.0_react@18.3.1/node_modules/lucide-react/dist/esm/lucide-react.js?v=16f6a547' does not provide an export named '<icon-name>' 
    `
    
    
    // Convert messages to Anthropic format
    // const anthropicMessages = messages.map((msg: any) => ({
    //     role: msg.role === 'assistant' ? 'user' : msg.role,
    //     content: msg.role === 'assistant' ? updatedSystemPrompt + '\n\n' + msg.content : msg.content
    // }));

    // const response = await anthropic.messages.create({
    //     // model: "claude-3-5-haiku-20241022",
    //     // model : "claude-3-7-sonnet-20250219",
    //     // model: "claude-sonnet-4-20250514",
    //     model : "claude-3-5-sonnet-20241022",

    //     max_tokens: 8191,
    //     system: updatedSystemPrompt,
    //     messages: messages
    // });

    // if (!response.content || response.content.length === 0) {
    //     res.status(400).json({message: "Invalid response from AI model"});
    //     return;
    // }

    // const content = response.content[0];
    // const responseText = content.type === 'text' ? content.text : '';

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: updatedSystemPrompt
            },
            ...messages
        ],
        // model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        // model: 'llama3-70b-8192',
        model: 'deepseek-r1-distill-llama-70b',
        max_tokens: 8191,
        temperature: 0
    })

    res.json({
        response: response.choices[0]?.message?.content
    });
})

app.listen(3000);