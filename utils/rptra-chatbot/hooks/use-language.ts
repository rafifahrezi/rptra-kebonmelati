"use client"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/i18n"

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("id")

  useEffect(() => {
    // Get language from localStorage or browser preference
    const savedLang = localStorage.getItem("preferred-language") as Language
    const browserLang = navigator.language.startsWith("id") ? "id" : "en"

    setLanguage(savedLang || browserLang)
  }, [])

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem("preferred-language", newLang)
  }

  return { language, changeLanguage }
}
