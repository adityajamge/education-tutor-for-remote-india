import { useState } from "react"
import { Send, Mic, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FloatingInputProps {
  onSubmit: (question: string, action?: string) => void
  isLoading: boolean
}

export function FloatingInput({ onSubmit, isLoading }: FloatingInputProps) {
  const [question, setQuestion] = useState("")

  const handleSubmit = (action?: string) => {
    if (question.trim() && !isLoading) {
      onSubmit(question.trim(), action)
      setQuestion("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <div className="relative">
        <div className="relative rounded-3xl bg-card border border-border/50 shadow-2xl backdrop-blur-xl">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your textbooks..."
            className={cn(
              "min-h-[60px] max-h-[200px] border-0 bg-transparent px-6 py-4 pr-24 resize-none text-base",
              "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            )}
            disabled={isLoading}
          />
          
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-accent"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
              <span className="sr-only">Voice input</span>
            </Button>
            
            <Button
              type="button"
              size="icon"
              disabled={!question.trim() || isLoading}
              onClick={() => handleSubmit()}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send question</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 justify-center">
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-accent transition-colors px-4 py-2 rounded-full"
            onClick={() => handleSubmit("search")}
          >
            <BookOpen className="h-3 w-3 mr-1.5" />
            Search Textbook
          </Badge>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-accent transition-colors px-4 py-2 rounded-full"
            onClick={() => handleSubmit("explain")}
          >
            <Lightbulb className="h-3 w-3 mr-1.5" />
            Explain with Example
          </Badge>
        </div>
      </div>
    </div>
  )
}
