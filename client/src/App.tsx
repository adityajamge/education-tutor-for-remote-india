import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import PdfPreviewSidebar from './components/PdfPreviewSidebar';
import ThemeToggle from './components/ThemeToggle';
import WelcomeScreen from './components/WelcomeScreen';
import SplashScreen from './components/SplashScreen';
import ChatArea, { type Message, TypingIndicator } from './components/ChatArea';
import ChatInput from './components/ChatInput';
import TokenStatsBar from './components/TokenStatsBar';
import { useDocuments } from './hooks/useDocuments';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface TokenStats {
  baselineTokens: number;
  optimizedTokens: number;
  compressedTokens: number;
  routingSavings: number;
  totalSavings: number;
  selectedCount: number;
  totalCount: number;
  selectedChapters: string[];
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);
  const [showPdfSidebar, setShowPdfSidebar] = useState(false);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);

  const handleViewPdf = (pdf: { url: string; fileName: string } | null) => {
    if (pdf) {
      setPdfPreview(pdf);
      setShowPdfSidebar(true);
    } else {
      setShowPdfSidebar(false);
    }
  };

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

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ question: content }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.metadata) {
        setTokenStats({
          baselineTokens: data.metadata.baseline_estimated_tokens || 0,
          optimizedTokens: data.metadata.optimized_estimated_tokens || data.metadata.original_tokens || 0,
          compressedTokens: data.metadata.compressed_tokens || 0,
          routingSavings: data.metadata.routing_savings_pct || 0,
          totalSavings: data.metadata.total_savings_pct || 0,
          selectedCount: data.metadata.selected_sections_count || 0,
          totalCount: data.metadata.total_sections_count || 0,
          selectedChapters: (data.metadata.selected_chapters || [])
            .slice(0, 5)
            .map((entry: { fileName: string; chapterTitle: string }) => `${entry.fileName}: ${entry.chapterTitle}`),
        });
      }
    } catch (chatError) {
      console.error('Chat error:', chatError);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${chatError instanceof Error ? chatError.message : 'Failed to get response. Please upload a PDF first.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQuestionSelect = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="app" id="app-root">
      <Sidebar
        onQuestionSelect={handleQuestionSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        documents={documents}
        error={error}
        onRemove={removeDocument}
        onClearSession={endSession}
        onViewPdf={handleViewPdf}
      />

      <main className="main">
        <header className="topbar" id="topbar">
          <div className="topbar__left">
            <h2 className="topbar__title">Chat</h2>
            {tokenStats && <TokenStatsBar stats={tokenStats} />}
          </div>
          <div className="topbar__right">
            <ThemeToggle />
          </div>
        </header>

        <div className="main__content">
          {tokenStats && (
            <div className="pruning-summary">
              <strong>Context Routing:</strong> Selected {tokenStats.selectedCount}/{tokenStats.totalCount} sections.
              {tokenStats.selectedChapters.length > 0 && (
                <span className="pruning-summary__chapters"> Top chapters: {tokenStats.selectedChapters.join(' | ')}</span>
              )}
            </div>
          )}
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

        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || isUploading}
          onUpload={uploadFiles}
          isUploading={isUploading}
        />
      </main>

      <PdfPreviewSidebar
        pdfUrl={pdfPreview?.url || ''}
        fileName={pdfPreview?.fileName || ''}
        onClose={() => handleViewPdf(null)}
        show={showPdfSidebar}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
