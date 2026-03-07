import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface QuestionInputProps {
  onSubmit: (question: string) => void
  isLoading: boolean
}

export function QuestionInput({ onSubmit, isLoading }: QuestionInputProps) {
  const [question, setQuestion] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading) {
      onSubmit(question.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question here..."
        className={cn(
          "min-h-[60px] max-h-[200px] pr-14 resize-none text-base shadow-sm rounded-2xl",
          "focus-visible:ring-2 focus-visible:ring-primary"
        )}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!question.trim() || isLoading}
        className="absolute bottom-2 right-2 h-9 w-9 rounded-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send question</span>
      </Button>
    </form>
  )
}
