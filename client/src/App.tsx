import { useState } from "react"
import { TopBar } from "@/components/top-bar"
import { FloatingInput } from "@/components/floating-input"
import { ResponseCard } from "@/components/response-card"
import { ExploreSection } from "@/components/explore-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getDemoResponse } from "@/lib/demo-data"

interface Answer {
  question: string
  answer: string
  stats?: {
    originalTokens?: number
    compressedTokens?: number
    compressionRatio?: number
    responseTime?: number
  }
}

// Demo mode flag - set to false when backend is ready
const DEMO_MODE = true

function App() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitQuestion = async (question: string, action?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const startTime = Date.now()
      
      if (DEMO_MODE) {
        // Demo mode - simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const answer = getDemoResponse(question)
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(2)
        
        const newAnswer: Answer = {
          question,
          answer,
          stats: {
            originalTokens: 2847,
            compressedTokens: 456,
            compressionRatio: 84,
            responseTime: parseFloat(responseTime),
          },
        }
        
        setAnswers((prev) => [newAnswer, ...prev])
      } else {
        // Production mode - actual API call
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, action }),
        })

        if (!response.ok) {
          throw new Error("Failed to get answer. Please try again.")
        }

        const data = await response.json()
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(2)

        const newAnswer: Answer = {
          question,
          answer: data.answer,
          stats: {
            originalTokens: data.originalTokens,
            compressedTokens: data.compressedTokens,
            compressionRatio: data.compressionRatio,
            responseTime: parseFloat(responseTime),
          },
        }

        setAnswers((prev) => [newAnswer, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col dot-pattern">
      <TopBar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            {error && (
              <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="mb-6">
                <ResponseCard
                  question="Loading..."
                  answer=""
                  isLoading={true}
                />
              </div>
            )}

            <div className="space-y-6 mb-6">
              {answers.map((answer, index) => (
                <ResponseCard
                  key={index}
                  question={answer.question}
                  answer={answer.answer}
                  stats={answer.stats}
                />
              ))}
            </div>

            {answers.length === 0 && !isLoading && (
              <ExploreSection onTopicClick={handleSubmitQuestion} />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4">
          <FloatingInput onSubmit={handleSubmitQuestion} isLoading={isLoading} />
        </div>
      </main>
    </div>
  )
}

export default App
