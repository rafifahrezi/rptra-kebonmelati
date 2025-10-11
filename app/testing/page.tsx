"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Calendar, Gamepad2, BookOpen, Palette, Music, ArrowRight, Star } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { getTranslation } from "@/lib/i18n"

export default function HomePage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  {getTranslation(language, "home.hero.badge")}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground text-balance">
                  {getTranslation(language, "home.hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  {getTranslation(language, "home.hero.description")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/kegiatan">
                    {getTranslation(language, "home.hero.viewEvents")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/tentang">{getTranslation(language, "home.hero.aboutUs")}</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    500+ {getTranslation(language, "home.hero.activeMembers")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">50+ {getTranslation(language, "home.hero.monthlyEvents")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 flex items-center justify-center">
                <img
                  src="/children-playing-in-colorful-playground-with-famil.jpg"
                  alt="Anak-anak bermain di RPTRA BONTI"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold">4.9/5</span>
                </div>
                <p className="text-sm">Rating Kepuasan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">
              {getTranslation(language, "home.features.title")}
            </h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              {getTranslation(language, "home.features.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Gamepad2,
                titleKey: "home.features.playground.title",
                descriptionKey: "home.features.playground.description",
              },
              {
                icon: BookOpen,
                titleKey: "home.features.library.title",
                descriptionKey: "home.features.library.description",
              },
              {
                icon: Palette,
                titleKey: "home.features.art.title",
                descriptionKey: "home.features.art.description",
              },
              {
                icon: Music,
                titleKey: "home.features.music.title",
                descriptionKey: "home.features.music.description",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{getTranslation(language, feature.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pretty">
                    {getTranslation(language, feature.descriptionKey)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "500+", labelKey: "home.stats.members" },
              { number: "50+", labelKey: "home.stats.events" },
              { number: "15+", labelKey: "home.stats.programs" },
              { number: "5", labelKey: "home.stats.years" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{getTranslation(language, stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">{getTranslation(language, "home.cta.title")}</h2>
          <p className="text-lg opacity-90 text-pretty">{getTranslation(language, "home.cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/kontak">{getTranslation(language, "home.cta.contact")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/kegiatan">{getTranslation(language, "home.cta.schedule")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
