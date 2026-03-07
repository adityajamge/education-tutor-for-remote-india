import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Zap, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AnswerDisplayProps {
  question: string
  answer: string
  stats?: {
    originalTokens?: number
    compressedTokens?: number
    compressionRatio?: number
    responseTime?: number
  }
  isLoading?: boolean
}

export function AnswerDisplay({ question, answer, stats, isLoading }: AnswerDisplayProps) {
  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground/90">
              {question}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {stats.originalTokens && stats.compressedTokens && (
              <Badge variant="secondary" className="gap-1.5">
                <Zap className="h-3 w-3" />
                {stats.compressionRatio}% compression
              </Badge>
            )}
            {stats.originalTokens && (
              <Badge variant="outline" className="gap-1.5">
                {stats.originalTokens} → {stats.compressedTokens} tokens
              </Badge>
            )}
            {stats.responseTime && (
              <Badge variant="outline" className="gap-1.5">
                <Clock className="h-3 w-3" />
                {stats.responseTime}s
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
