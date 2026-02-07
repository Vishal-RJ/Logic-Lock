# LogicLock IDE - Setup Instructions

## 🔑 Setting Your API Key

The API key is now stored securely in VS Code settings instead of being hardcoded.

### Method 1: Using VS Code Settings UI

1. Open **Settings** (Ctrl+, or Cmd+,)
2. Search for "**LogicLock**"
3. Enter your **Gemini API Key** in the field
4. (Optional) Configure Ollama settings for offline mode

### Method 2: Using settings.json

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Preferences: Open User Settings (JSON)"
3. Add:

```json
{
  "logiclock.geminiApiKey": "AIzaSyCl5TYmhFFV8KMW9Yol9_IzDts5INZ-qkY",
  "logiclock.ollamaEndpoint": "http://localhost:11434",
  "logiclock.ollamaModel": "gemma:2b"
}
```

### Get Your API Key

- **Gemini API**: https://aistudio.google.com

## 🧪 Testing the Extension

1. **Press F5** to launch Extension Development Host
2. **Configure API key** using one of the methods above
3. **Open a file** and **paste >5 lines** or **>200 characters** of code
4. Click "**Ask Socratic Coach**" when the warning appears
5. **Chat with the coach** - it will use analogies and never give you direct code!

## 🔒 Security

Your API key is stored in VS Code's user settings and is **never committed to version control**.
