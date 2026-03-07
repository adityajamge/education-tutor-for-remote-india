import { BookOpen, Sparkles, Zap } from "lucide-react"
import { Card, CardContent } from "./ui/card"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <BookOpen className="h-16 w-16 text-primary" />
      </div>
      
      <h2 className="text-3xl font-bold mb-3 text-center">
        Welcome to Education Tutor
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8 text-lg">
        Ask any question related to your textbooks and get instant, accurate answers
        powered by AI.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Answers</h3>
                <p className="text-sm text-muted-foreground">
                  Get curriculum-aligned answers from state-board textbooks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fast & Efficient</h3>
                <p className="text-sm text-muted-foreground">
                  Optimized for low-bandwidth with context compression
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
