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
import { Save, RotateCcw, Sparkles, Database, Settings2, FileText, Cloud, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Varsayılanlar
const DEFAULT_CONFIG = {
  modelName: "gemini-2.5-flash-preview-09-2025",
  systemInstruction: "",
  ragCorpus: "",
  similarityTopK: 10,
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 65535,
}

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
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Sayfa Yüklendiğinde: API'den Veriyi Çek (Server Env kullanır)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config')
        if (!res.ok) throw new Error("Veri çekilemedi")
        
        const data = await res.json()
        if (data) {
            setConfig(data)
            toast.success("Ayarlar sunucudan yüklendi")
        }
      } catch (error) {
        console.error(error)
        toast.error("Ayarlar yüklenemedi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // 2. Kaydetme İşlemi (API'ye gönderir)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!res.ok) throw new Error("Kayıt başarısız")

      toast.success("Ayarlar başarıyla kaydedildi!")
    } catch (error) {
      toast.error("Kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if(confirm("Ayarları varsayılana döndürmek istediğinize emin misiniz?")) {
        setConfig(DEFAULT_CONFIG)
        toast.info("Arayüz sıfırlandı. Kalıcı olması için 'Kaydet'e basın.")
    }
  }

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Ayarlar Yükleniyor...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vertex AI Yönetim</h1>
                <p className="text-xs text-muted-foreground">Server-Side Config Management</p>
              </div>
            </div>
            <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Üst Butonlar */}
        <div className="flex justify-end gap-3 sticky top-24 z-40">
            <div className="bg-card/80 backdrop-blur border p-1.5 rounded-xl flex gap-2 shadow-sm">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="size-4 mr-2" /> Sıfırla
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Cloud className="size-4 mr-2" />}
                    {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </div>

        <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="model" className="rounded-lg gap-2"><Settings2 className="size-4" /> Model</TabsTrigger>
              <TabsTrigger value="prompt" className="rounded-lg gap-2"><FileText className="size-4" /> Prompt</TabsTrigger>
              <TabsTrigger value="rag" className="rounded-lg gap-2"><Database className="size-4" /> RAG</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: MODEL --- */}
            <TabsContent value="model" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Model Ayarları</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Model Adı</Label>
                    <Input value={config.modelName} onChange={e => setConfig({...config, modelName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label>Temperature: {config.temperature}</Label>
                        <Slider value={[config.temperature]} onValueChange={([v]) => setConfig({...config, temperature: v})} max={2} step={0.1} />
                    </div>
                    <div className="space-y-4">
                        <Label>Top P: {config.topP}</Label>
                        <Slider value={[config.topP]} onValueChange={([v]) => setConfig({...config, topP: v})} max={1} step={0.05} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Output Tokens</Label>
                    <Input type="number" value={config.maxOutputTokens} onChange={e => setConfig({...config, maxOutputTokens: parseInt(e.target.value)})} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: PROMPT --- */}
            <TabsContent value="prompt" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Sistem Talimatı</CardTitle></CardHeader>
                <CardContent>
                  <Textarea 
                    value={config.systemInstruction}
                    onChange={e => setConfig({...config, systemInstruction: e.target.value})}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Botun kimliği..."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 3: RAG --- */}
            <TabsContent value="rag" className="mt-6">
              <Card>
                <CardHeader><CardTitle>RAG Ayarları</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Corpus ID</Label>
                    <Input value={config.ragCorpus} onChange={e => setConfig({...config, ragCorpus: e.target.value})} placeholder="projects/..." />
                  </div>
                  <div className="space-y-4">
                    <Label>Chunk Sayısı (Top K): {config.similarityTopK}</Label>
                    <Slider value={[config.similarityTopK]} onValueChange={([v]) => setConfig({...config, similarityTopK: v})} min={1} max={50} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
