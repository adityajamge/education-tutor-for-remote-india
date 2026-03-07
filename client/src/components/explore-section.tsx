import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight, Atom, Leaf, Scale, Apple, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"

const topics = [
  {
    id: 1,
    icon: Atom,
    title: "Pythagorean Theorem",
    description: "Learn about right triangles and the famous a² + b² = c² formula",
    color: "bg-blue-500",
  },
  {
    id: 2,
    icon: Leaf,
    title: "Photosynthesis",
    description: "How plants convert sunlight into energy and produce oxygen",
    color: "bg-green-500",
  },
  {
    id: 3,
    icon: Scale,
    title: "Indian Constitution",
    description: "Fundamental rights, duties, and the structure of Indian democracy",
    color: "bg-amber-500",
  },
  {
    id: 4,
    icon: Apple,
    title: "Newton's Laws",
    description: "Three laws of motion that govern how objects move",
    color: "bg-purple-500",
  },
  {
    id: 5,
    icon: Droplet,
    title: "Water Cycle",
    description: "Evaporation, condensation, precipitation, and collection",
    color: "bg-cyan-500",
  },
]

interface ExploreSectionProps {
  onTopicClick: (topic: string) => void
}

export function ExploreSection({ onTopicClick }: ExploreSectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Explore</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          See more
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur"
              onClick={() => onTopicClick(`Explain ${topic.title}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className={cn("h-10 w-10", topic.color)}>
                    <AvatarFallback className="bg-transparent">
                      <Icon className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate">{topic.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
