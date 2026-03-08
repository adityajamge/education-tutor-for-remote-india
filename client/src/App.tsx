import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea, { type Message, TypingIndicator } from './components/ChatArea';
import ChatInput from './components/ChatInput';
import TokenStatsBar from './components/TokenStatsBar';
import PdfPanel from './components/PdfPanel';
import { useDocuments } from './hooks/useDocuments';
import './App.css';

function AppContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tokenStats, setTokenStats] = useState<{
    originalTokens: number;
    compressedTokens: number;
    savings: number;
  } | null>(null);

  // Hook for managing documents and PDF uploads via Backend APIs
  const { documents, isUploading, error, uploadFiles, removeDocument, endSession } = useDocuments();

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getSimulatedResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);

      // Simulated token stats
      setTokenStats({
        originalTokens: Math.floor(Math.random() * 2000) + 1000,
        compressedTokens: Math.floor(Math.random() * 500) + 200,
        savings: Math.floor(Math.random() * 30) + 50,
      });
    }, 1500 + Math.random() * 1000);
  }, []);

  const handleQuestionSelect = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  return (
    <div className="app" id="app-root">
      <Sidebar
        onQuestionSelect={handleQuestionSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="main">
        {/* Top bar */}
        <header className="topbar" id="topbar">
          <div className="topbar__left">
            <h2 className="topbar__title">Chat</h2>
            {tokenStats && <TokenStatsBar stats={tokenStats} />}
          </div>
          <div className="topbar__right">
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="main__content">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <ChatArea messages={messages} />
          )}
          {isLoading && (
            <div className="main__typing">
              <TypingIndicator />
            </div>
          )}
        </div>

        {/* PDF Panel - shows uploaded docs and handles uploads */}
        <PdfPanel
          documents={documents}
          isUploading={isUploading}
          error={error}
          onUpload={uploadFiles}
          onRemove={removeDocument}
          onClearSession={endSession}
        />

        {/* Input area */}
        <ChatInput onSend={sendMessage} disabled={isLoading || isUploading} />
      </main>
    </div>
  );
}

// Simulated responses for demo purposes
function getSimulatedResponse(question: string): string {
  const lowerQ = question.toLowerCase();

  if (lowerQ.includes('photosynthesis')) {
    return `## 🌱 Photosynthesis

Photosynthesis is the process by which **green plants** convert sunlight into food (glucose).

### The Equation:
\`\`\`
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
\`\`\`

### Key Points:
- Takes place in **chloroplasts** (specifically in the chlorophyll)
- Requires **sunlight**, **carbon dioxide**, and **water**
- Produces **glucose** (food) and **oxygen** (released into air)

### Two Stages:
1. **Light Reaction** – Occurs in the thylakoid membrane, converts light energy
2. **Dark Reaction (Calvin Cycle)** – Occurs in the stroma, produces glucose

> 💡 *Fun fact: Without photosynthesis, there would be no oxygen on Earth for us to breathe!*`;
  }

  if (lowerQ.includes('pythagoras') || lowerQ.includes('pythagorean')) {
    return `## 📐 Pythagoras Theorem

The **Pythagorean theorem** states that in a **right-angled triangle**:

> **a² + b² = c²**

Where:
- **a** and **b** are the two shorter sides (legs)
- **c** is the longest side (hypotenuse)

### Example:
If a = 3 and b = 4, then:
\`\`\`
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5
\`\`\`

### Applications:
- Finding distances
- Construction and architecture
- Navigation and map reading`;
  }

  if (lowerQ.includes('water cycle')) {
    return `## 💧 The Water Cycle

The water cycle describes the continuous movement of water on, above, and below the Earth's surface.

### Stages:
1. **Evaporation** – Sun heats water in oceans/rivers, turning it into vapor
2. **Condensation** – Water vapor rises, cools, and forms clouds
3. **Precipitation** – Water falls back as rain, snow, or hail
4. **Collection** – Water collects in rivers, lakes, and oceans

### Key Facts:
- The water cycle has **no beginning or end** – it's continuous
- About **97%** of Earth's water is in the oceans
- Only **3%** is freshwater, and most is frozen in glaciers`;
  }

  if (lowerQ.includes('newton')) {
    return `## 🍎 Newton's Laws of Motion

### First Law (Law of Inertia):
> An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.

**Example:** A book on a table won't move unless someone pushes it.

### Second Law (F = ma):
> Force equals mass times acceleration.

**Example:** Pushing a heavy box requires more force than pushing a light one.

### Third Law (Action-Reaction):
> For every action, there is an equal and opposite reaction.

**Example:** When you push against a wall, the wall pushes back against you with equal force.`;
  }

  return `Thank you for your question! Let me help you understand this topic.

Based on your query: **"${question}"**

I'll search through the relevant textbook content and provide you with a comprehensive explanation. Here's what I found:

### Key Concepts:
- This topic is commonly covered in state-board curriculum
- Understanding the fundamentals is crucial for exam preparation
- Practice with examples helps reinforce the concepts

### Summary:
This is a simulated response for demonstration purposes. Once the backend is connected, I'll provide detailed explanations from your actual textbook content, compressed efficiently using ScaleDown API for faster responses.

> 📚 *Tip: Try asking specific questions about topics from your textbook for the best answers!*`;
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
