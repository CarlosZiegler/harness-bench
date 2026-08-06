import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("pulseboard-theme")
    const nextIsDark = storedTheme ? storedTheme === "dark" : true
    setIsDark(nextIsDark)
    document.documentElement.classList.toggle("dark", nextIsDark)
  }, [])

  function toggleTheme() {
    const nextIsDark = !isDark
    setIsDark(nextIsDark)
    document.documentElement.classList.toggle("dark", nextIsDark)
    window.localStorage.setItem(
      "pulseboard-theme",
      nextIsDark ? "dark" : "light"
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
