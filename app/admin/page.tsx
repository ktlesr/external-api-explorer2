"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, RotateCcw, Sparkles, Database, Settings2, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface Config {
  modelName: string
  systemInstruction: string
  ragCorpus: string
  similarityTopK: number
  temperature: number
  topP: number
  maxOutputTokens: number
}

export default function AdminPage() {
  const [config, setConfig] = useState<Config>({
    modelName: "gemini-2.5-flash-preview-09-2025",
    systemInstruction: "",
    ragCorpus: "",
    similarityTopK: 10,
    temperature: 0.1,
    topP: 0.95,
    maxOutputTokens: 65535,
  })

  const [isSaving, setIsSaving] = useState(false)

  // LocalStorage'dan config yükle
  useEffect(() => {
    const savedConfig = localStorage.getItem("vertex-ai-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    } else {
      // Default config'i yükle
      fetch("/api/config")
        .then((res) => res.json())
        .then((data) => {
          setConfig(data)
          localStorage.setItem("vertex-ai-config", JSON.stringify(data))
        })
        .catch((err) => console.error("Config yükleme hatası:", err))
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // LocalStorage'a kaydet
      localStorage.setItem("vertex-ai-config", JSON.stringify(config))

      // API'ye de gönder (opsiyonel - gelecekte veritabanı için)
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      toast.success("Ayarlar başarıyla kaydedildi!")
    } catch (error) {
      toast.error("Ayarlar kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data)
        localStorage.setItem("vertex-ai-config", JSON.stringify(data))
        toast.success("Ayarlar varsayılana sıfırlandı")
      })
      .catch((err) => {
        toast.error("Sıfırlama hatası")
        console.error(err)
      })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Vertex AI Admin Panel</h1>
                <p className="text-sm text-muted-foreground">API Konfigürasyon Yönetimi</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={handleReset} className="gap-2 bg-transparent">
              <RotateCcw className="size-4" />
              Varsayılana Sıfırla
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="size-4" />
              {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="model" className="gap-2">
                <Settings2 className="size-4" />
                Model Ayarları
              </TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2">
                <FileText className="size-4" />
                System Prompt
              </TabsTrigger>
              <TabsTrigger value="rag" className="gap-2">
                <Database className="size-4" />
                RAG Ayarları
              </TabsTrigger>
            </TabsList>

            {/* Model Ayarları */}
            <TabsContent value="model" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Konfigürasyonu</CardTitle>
                  <CardDescription>Vertex AI model parametrelerini ayarlayın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Model Name */}
                  <div className="space-y-2">
                    <Label htmlFor="modelName">Model Adı</Label>
                    <Input
                      id="modelName"
                      value={config.modelName}
                      onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                      placeholder="gemini-2.5-flash-preview-09-2025"
                    />
                    <p className="text-xs text-muted-foreground">Kullanılacak Vertex AI model adı</p>
                  </div>

                  <Separator />

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperature</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.temperature.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="temperature"
                      value={[config.temperature]}
                      onValueChange={([value]) => setConfig({ ...config, temperature: value })}
                      min={0}
                      max={2}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Düşük değerler daha tutarlı, yüksek değerler daha yaratıcı sonuçlar verir
                    </p>
                  </div>

                  {/* Top P */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topP">Top P</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.topP.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="topP"
                      value={[config.topP]}
                      onValueChange={([value]) => setConfig({ ...config, topP: value })}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Nucleus sampling parametresi</p>
                  </div>

                  {/* Max Output Tokens */}
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Maksimum Çıktı Token</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.maxOutputTokens}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          maxOutputTokens: Number.parseInt(e.target.value) || 65535,
                        })
                      }
                      min={1}
                      max={65535}
                    />
                    <p className="text-xs text-muted-foreground">
                      Modelin üretebileceği maksimum token sayısı (1-65535)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Prompt */}
            <TabsContent value="prompt" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Instruction</CardTitle>
                  <CardDescription>Modelin davranışını belirleyen sistem talimatı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={config.systemInstruction}
                    onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
                    placeholder="System instruction'ı buraya girin..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Model her istekte bu talimatları takip edecektir. Türkçe veya İngilizce yazabilirsiniz.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RAG Ayarları */}
            <TabsContent value="rag" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>RAG (Retrieval-Augmented Generation)</CardTitle>
                  <CardDescription>Vertex AI RAG Corpus bağlantı ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* RAG Corpus */}
                  <div className="space-y-2">
                    <Label htmlFor="ragCorpus">RAG Corpus ID</Label>
                    <Input
                      id="ragCorpus"
                      value={config.ragCorpus}
                      onChange={(e) => setConfig({ ...config, ragCorpus: e.target.value })}
                      placeholder="projects/.../locations/.../ragCorpora/..."
                    />
                    <p className="text-xs text-muted-foreground">Vertex AI Studio'dan aldığınız RAG Corpus tam yolu</p>
                  </div>

                  <Separator />

                  {/* Similarity Top K */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="similarityTopK">Similarity Top K</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.similarityTopK}</span>
                    </div>
                    <Slider
                      id="similarityTopK"
                      value={[config.similarityTopK]}
                      onValueChange={([value]) => setConfig({ ...config, similarityTopK: value })}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">RAG'den kaç adet benzer doküman getirilecek (1-50)</p>
                  </div>

                  <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">💡 Not:</p>
                    <p>
                      RAG Corpus ID boş bırakılırsa, sistem RAG olmadan çalışacaktır. Sadece model parametreleri
                      kullanılacaktır.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">API Endpoint Bilgisi</p>
                  <p className="text-sm text-muted-foreground">
                    Kaydettiğiniz ayarlar{" "}
                    <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">
                      /api/vertex
                    </code>{" "}
                    endpoint'inde kullanılacaktır. Chatbot uygulamanızdan bu endpoint'e istek atarken header'a{" "}
                    <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">x-api-key</code>{" "}
                    eklemeyi unutmayın.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
