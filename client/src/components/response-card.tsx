import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ResponseCardProps {
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

export function ResponseCard({ question, answer, stats, isLoading }: ResponseCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-border/50 bg-card/50 backdrop-blur">
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
    <Card className="w-full max-w-4xl mx-auto border-border/50 bg-card/50 backdrop-blur shadow-xl">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-foreground/90">
          {question}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/80">
            {answer}
          </p>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
            {stats.originalTokens && stats.compressedTokens && (
              <Badge variant="secondary" className="gap-1.5 bg-accent/50">
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
