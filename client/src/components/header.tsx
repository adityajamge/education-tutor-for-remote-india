import { GraduationCap, Info } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Education Tutor</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Learning Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="h-5 w-5" />
                <span className="sr-only">About</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Education Tutor</DialogTitle>
                <DialogDescription className="space-y-3 pt-2">
                  <p>
                    An AI-powered tutoring system designed for students in rural India,
                    providing answers based on state-board textbook content.
                  </p>
                  <p className="text-sm">
                    <strong>Features:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                    <li>Context compression for low-bandwidth environments</li>
                    <li>Curriculum-aligned answers from textbooks</li>
                    <li>Efficient token usage with ScaleDown API</li>
                    <li>Fast response times optimized for rural connectivity</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">
                    Developed by Aditya Jamge, Omanand Swami, and Pratik Patil
                    as part of Intel Unnati Industrial Training Program with HPE.
                  </p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
