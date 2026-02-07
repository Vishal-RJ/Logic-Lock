# LogicLock IDE - Complete User Experience Walkthrough

## 🎯 What LogicLock Does

LogicLock is a VS Code extension that **prevents copy-paste learning** by intercepting large code pastes and launching a **Socratic AI Coach** that guides students through logic with questions and analogies—never providing direct code.

---

## 🚀 Step-by-Step User Journey

### Phase 1: Installation & Setup
1. **User installs the extension** from the VS Code marketplace (or runs it in dev mode with F5)
2. **Extension activates** automatically when VS Code starts
3. **User sees a new "LogicLock" icon** in the Activity Bar (left sidebar) with a lock symbol

### Phase 2: The Moment of Interception
4. **Student is stuck** on a coding problem (e.g., implementing a binary search)
5. **Student finds solution online** and copies a large block of code (>5 lines or >200 chars)
6. **Student goes to VS Code** and tries to paste the code into their editor

### Phase 3: The Block
7. **💥 The paste disappears immediately** (extension runs `undo` command)
8. **⚠️ Warning notification pops up** at the bottom right:
   ```
   🚨 LogicLock: High-Velocity Paste detected! 
   Large code blocks are blocked to encourage active learning.
   
   [Ask Socratic Coach]
   ```

### Phase 4: The Socratic Session
9. **Student clicks "Ask Socratic Coach"** button
10. **LogicLock Sidebar opens** on the left with a beautiful glassmorphism UI
11. **Coach greets them** automatically:
    ```
    I noticed you were trying to paste a large block of code. 🚨 
    Let's think through the logic together! What outcome are you 
    trying to achieve with that block? Describe it in plain words.
    ```

### Phase 5: The Learning Journey
12. **Student types**: "I'm trying to search for a number in a sorted array"
13. **Coach responds** (using Gemini AI with the Socratic prompt):
    ```
    Great! Let's break this down. Imagine you're looking for a 
    specific book in a library where books are arranged alphabetically. 
    If you open a book in the middle and it's past your target letter, 
    which direction would you go? And why would this be faster than 
    checking every single book?
    ```
14. **Student thinks and responds**: "I'd go to the left side because my book would be earlier"
15. **Coach continues guiding** with follow-up questions
16. **Student eventually writes their own code** understanding the logic

### Phase 6: Offline Mode (Optional)
17. If **internet is down** or **API fails**, the extension automatically tries **local Ollama**
18. User sees: `(Offline Mode) [Response from local Gemma model]`

---

## 🎨 Visual Experience

### Main Interface
```
┌─────────────────────────────────────────┐
│  ≡  🔒 LogicLock Coach                  │  ← Glassmorphism header
├─────────────────────────────────────────┤
│                                         │
│  COACH                                  │  ← AI message badge
│  I noticed you were trying to paste     │
│  a large block of code...               │  ← Glassmorphic bubble
│                                         │
│          Your description here    ━━━━  │  ← User message (blue)
│                                         │
│  COACH                                  │
│  Great! Let's break this down...        │
│                                         │
├─────────────────────────────────────────┤
│  [Explain your logic...]      [Ask]     │  ← Input area
└─────────────────────────────────────────┘
```

### Design Features
- **Dark theme** with `#0f172a` background
- **Glassmorphism** effects with `backdrop-filter: blur(8px)`
- **Vibrant cyan accent** (`#38bdf8`)
- **Outfit font** from Google Fonts
- **Smooth animations** on message appearance
- **Hover effects** on buttons

---

## 🧪 Testing Instructions

### 1. Configure API Key (DO THIS FIRST)
1. Press `Ctrl+,` to open Settings
2. Search for "**logiclock gemini**"
3. Paste your API key: `AIzaSyCl5TYmhFFV8KMW9Yol9_IzDts5INZ-qkY`

### 2. Launch Extension
1. Press `F5` in your VS Code
2. A new window opens: **[Extension Development Host]**

### 3. Trigger the Paste Blocker
1. In the new window, create a test file: `test.js`
2. Copy this code block (8 lines):
   ```javascript
   function binarySearch(arr, target) {
     let left = 0;
     let right = arr.length - 1;
     while (left <= right) {
       const mid = Math.floor((left + right) / 2);
       if (arr[mid] === target) return mid;
       if (arr[mid] < target) left = mid + 1;
       else right = mid - 1;
     }
     return -1;
   }
   ```
3. Try to **paste it** into `test.js`

### 4. Expected Result
- Code **disappears** immediately
- **Warning appears**: "High-Velocity Paste detected!"
- Click **"Ask Socratic Coach"**
- **Sidebar opens** with the LogicLock Coach

### 5. Chat with Coach
Try these example questions:
- "Why was my paste blocked?"
- "Just give me the code for binary search"
- "How do I search through a sorted list?"

**The coach will:**
- ✅ Use analogies (library, post office, etc.)
- ✅ Ask guiding questions
- ❌ NEVER provide code blocks
- ❌ NEVER give direct answers

---

## 🛡️ Socratic AI Rules (Behind the Scenes)

The coach follows these strict rules:
1. **NEVER PROVIDE CODE BLOCKS** - Most important rule
2. **USE ANALOGIES ALWAYS** - Connect to real-world systems
3. **ASK, DON'T TELL** - Guide through questions
4. **REFUSAL-FIRST POLICY** - Politely refuse direct answer requests
5. **CONTEXTUAL AWARENESS** - Uses the blocked paste to understand gaps

---

## 📦 CLI Component (Bonus)

Students can also download coding modules:
```bash
node out/cli.js fetch binary-search-module
```

This fetches structured challenges from a remote repository.

---

## 🎓 Educational Philosophy

**Traditional Approach:**
Student stuck → Google solution → Copy-paste → No learning

**LogicLock Approach:**
Student stuck → Try to paste → Blocked → Guided questions → Understanding → Write own code

---

## 🔧 Technical Flow (Developer View)

```
User pastes code
    ↓
onDidChangeTextDocument fires
    ↓
Check: lineCount > 5 OR charCount > 200?
    ↓ YES
Execute undo()
    ↓
Show warning with button
    ↓ User clicks button
socraticProvider.handleBlockedPaste(fileContent, paste)
    ↓
Store context + Open sidebar
    ↓
Send initial coach message
    ↓
User types response
    ↓
Send to Gemini API with context + Socratic prompt
    ↓
Display response in chat
```

---

That's the complete LogicLock experience! 🎓
