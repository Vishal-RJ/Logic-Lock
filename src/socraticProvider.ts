import * as vscode from 'vscode';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { SOCRATIC_SYSTEM_PROMPT } from './prompts';

export class SocraticProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'logiclock.socraticView';
    private _view?: vscode.WebviewView;
    private _pendingContext: { fileContent: string, blockedPaste: string } | null = null;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleMessage(data.value);
                    break;
            }
        });

        // If context was set before the view resolved, send a hint
        if (this._pendingContext) {
            this._triggerInitialCoachMessage();
        }
    }

    public handleBlockedPaste(fileContent: string, blockedPaste: string) {
        this._pendingContext = { fileContent, blockedPaste };
        if (this._view) {
            this._view.show?.(true);
            this._triggerInitialCoachMessage();
        }
    }

    private _triggerInitialCoachMessage() {
        if (!this._view) return;
        this._view.webview.postMessage({
            type: 'addMessage',
            role: 'ai',
            text: "I noticed you were trying to paste a large block of code. 🚨 Let's think through the logic together! What outcome are you trying to achieve with that block? Describe it in plain words."
        });
    }

    private async _handleMessage(userMessage: string) {
        if (!this._view) return;

        // Add user message to UI
        this._view.webview.postMessage({ type: 'addMessage', role: 'user', text: userMessage });

        const contextPrompt = this._pendingContext
            ? `\n\nCONTEXT:\nFile Content:\n${this._pendingContext.fileContent}\n\nBlocked Paste Content:\n${this._pendingContext.blockedPaste}`
            : "";

        // Get configuration from VS Code settings
        const config = vscode.workspace.getConfiguration('logiclock');
        const apiKey = config.get<string>('geminiApiKey', '');
        const ollamaEndpoint = config.get<string>('ollamaEndpoint', 'http://localhost:11434');
        const ollamaModel = config.get<string>('ollamaModel', 'gemma:2b');

        try {
            // Attempt Gemini API (Online Mode)
            if (!apiKey) {
                throw new Error('No API key configured. Please set your Gemini API key in LogicLock settings.');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent([
                SOCRATIC_SYSTEM_PROMPT + contextPrompt,
                userMessage
            ]);
            const response = await result.response;
            const text = response.text();

            this._view.webview.postMessage({ type: 'addMessage', role: 'ai', text: text });
        } catch (error: any) {
            console.warn("Gemini API failed or offline. Attempting local Ollama fallback...");

            try {
                // Offline Fallback: Ollama (Gemma 2B)
                const ollamaResponse = await axios.post(`${ollamaEndpoint}/api/generate`, {
                    model: ollamaModel,
                    prompt: SOCRATIC_SYSTEM_PROMPT + contextPrompt + "\nUser: " + userMessage,
                    stream: false
                });

                const text = ollamaResponse.data.response;
                this._view.webview.postMessage({ type: 'addMessage', role: 'ai', text: `(Offline Mode) ${text}` });
            } catch (ollamaError: any) {
                this._view.webview.postMessage({ type: 'addMessage', role: 'error', text: `Connection Error: ${error.message}. Offline mode also unavailable. Please set your API key in LogicLock settings or start Ollama.` });
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
                <title>Socratic Coach</title>
                <style>
                    :root {
                        --bg-color: #0f172a;
                        --glass-bg: rgba(30, 41, 59, 0.7);
                        --accent: #38bdf8;
                        --text: #f8fafc;
                        --secondary-text: #94a3b8;
                    }
                    body { 
                        font-family: 'Outfit', sans-serif; 
                        display: flex; 
                        flex-direction: column; 
                        height: 100vh; 
                        margin: 0; 
                        padding: 16px; 
                        box-sizing: border-box; 
                        background: var(--bg-color); 
                        color: var(--text);
                        overflow: hidden;
                    }
                    #chat-container { 
                        flex: 1; 
                        overflow-y: auto; 
                        padding: 10px; 
                        margin-bottom: 16px; 
                        scrollbar-width: thin;
                        scrollbar-color: var(--accent) transparent;
                    }
                    #chat-container::-webkit-scrollbar { width: 4px; }
                    #chat-container::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }

                    .message { 
                        margin-bottom: 20px; 
                        padding: 12px 16px; 
                        border-radius: 12px; 
                        max-width: 85%; 
                        line-height: 1.5;
                        font-size: 14px;
                        animation: fadeIn 0.3s ease-out;
                        position: relative;
                        backdrop-filter: blur(8px);
                    }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                    .user { 
                        background: var(--accent); 
                        color: #000; 
                        align-self: flex-end; 
                        margin-left: auto;
                        border-bottom-right-radius: 2px;
                        font-weight: 500;
                    }
                    .ai { 
                        background: var(--glass-bg); 
                        color: var(--text);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-bottom-left-radius: 2px;
                    }
                    .ai::before {
                        content: 'Coach';
                        display: block;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--accent);
                        margin-bottom: 4px;
                        font-weight: 600;
                    }
                    .error { background: #ef4444; color: white; }

                    #input-area {
                        display: flex;
                        background: var(--glass-bg);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        padding: 8px;
                        gap: 8px;
                        align-items: center;
                    }
                    input { 
                        flex: 1; 
                        padding: 10px; 
                        border: none; 
                        background: transparent; 
                        color: var(--text); 
                        font-family: inherit;
                        outline: none;
                    }
                    input::placeholder { color: var(--secondary-text); }
                    
                    button { 
                        padding: 10px 20px; 
                        cursor: pointer; 
                        background: var(--accent); 
                        color: #000; 
                        border: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    button:hover { transform: scale(1.05); filter: brightness(1.1); }
                </style>
            </head>
            <body>
                <div style="font-weight:600; font-size:18px; margin-bottom:12px; color:var(--accent);">LogicLock <span style="color:var(--text); font-weight:300;">Coach</span></div>
                <div id="chat-container"></div>
                <div id="input-area">
                    <input type="text" id="user-input" placeholder="Explain your logic...">
                    <button id="send-btn">Ask</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const chatContainer = document.getElementById('chat-container');
                    const userInput = document.getElementById('user-input');
                    const sendBtn = document.getElementById('send-btn');

                    function addMessage(role, text) {
                        const div = document.createElement('div');
                        div.className = 'message ' + role;
                        div.textContent = text;
                        chatContainer.appendChild(div);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'addMessage':
                                addMessage(message.role, message.text);
                                break;
                        }
                    });

                    sendBtn.addEventListener('click', () => {
                        const val = userInput.value;
                        if (val) {
                            addMessage('user', val);
                            vscode.postMessage({ type: 'sendMessage', value: val });
                            userInput.value = '';
                        }
                    });

                    userInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') sendBtn.click();
                    });
                </script>
            </body>
            </html>
        `;
    }
}
