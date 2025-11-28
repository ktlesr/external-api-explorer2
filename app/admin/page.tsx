"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, RotateCcw, Sparkles, Database, Settings2, FileText, Key, Cloud, Loader2, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Varsayılan Ayarlar
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

interface ApiKeys {
  supabaseUrl: string
  supabaseAnonKey: string
  internalApiKey: string
}

export default function AdminPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    supabaseUrl: "",
    supabaseAnonKey: "",
    internalApiKey: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // --- 1. BAŞLANGIÇ: LocalStorage'dan Anahtarları Al ve DB'ye Bağlan ---
  useEffect(() => {
    const init = async () => {
      const savedApiKeys = localStorage.getItem("api-keys")
      if (savedApiKeys) {
        const keys = JSON.parse(savedApiKeys)
        setApiKeys(prev => ({
            ...prev,
            supabaseUrl: keys.supabaseUrl || "",
            supabaseAnonKey: keys.supabaseAnonKey || "",
        }))
        
        if (keys.supabaseUrl && keys.supabaseAnonKey) {
          await fetchLatestConfig(keys.supabaseUrl, keys.supabaseAnonKey)
        } else {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // --- SUPABASE'DEN VERİ ÇEKME ---
  const fetchLatestConfig = async (url: string, key: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient(url, key)
      const { data, error } = await supabase
        .from('vertex_configs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setConfig({
          modelName: data.model_name || DEFAULT_CONFIG.modelName,
          systemInstruction: data.system_instruction || "",
          ragCorpus: data.rag_corpus || "",
          similarityTopK: data.similarity_top_k || 10,
          temperature: data.temperature || 0.1,
          topP: data.top_p || 0.95,
          maxOutputTokens: data.max_output_tokens || 65535,
        })
        if (data.internal_api_key) {
            setApiKeys(prev => ({ ...prev, internalApiKey: data.internal_api_key }))
        }
        toast.success("Ayarlar buluttan yüklendi")
      }
      setConnectionStatus('success')
    } catch (error) {
      console.error("Veri çekme hatası:", error)
      setConnectionStatus('error')
      toast.error("Veritabanına bağlanılamadı.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- BAĞLANTIYI KAYDET (Sadece LocalStorage) ---
  const handleSaveConnection = async () => {
    if (!apiKeys.supabaseUrl || !apiKeys.supabaseAnonKey) {
      toast.error("Supabase URL ve Key zorunludur")
      return
    }
    try {
      localStorage.setItem("api-keys", JSON.stringify({
          supabaseUrl: apiKeys.supabaseUrl,
          supabaseAnonKey: apiKeys.supabaseAnonKey
      }))
      await fetchLatestConfig(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
    } catch (error) {
      toast.error("Hata oluştu")
    }
  }

  // --- AYARLARI SUPABASE'E KAYDET ---
  const handleSaveConfig = async () => {
    if (connectionStatus !== 'success') {
      toast.error("Önce Supabase bağlantısını kurun.")
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
      const dbPayload = {
        model_name: config.modelName,
        system_instruction: config.systemInstruction,
        rag_corpus: config.ragCorpus,
        similarity_top_k: config.similarityTopK,
        temperature: config.temperature,
        top_p: config.topP,
        max_output_tokens: config.maxOutputTokens,
        internal_api_key: apiKeys.internalApiKey,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase.from('vertex_configs').insert([dbPayload])
      if (error) throw error
      toast.success("Tüm ayarlar Supabase'e kaydedildi!")
    } catch (error: any) {
      toast.error(`Kayıt hatası: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if(confirm("Sıfırlamak istediğinize emin misiniz?")) {
        setConfig(DEFAULT_CONFIG)
        toast.info("Arayüz sıfırlandı. DB'ye yazmak için Kaydet'e basın.")
    }
  }

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
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
                <div className="flex items-center gap-2 text-xs">
                    {connectionStatus === 'success' ? (
                        <span className="text-green-500 font-bold flex items-center gap-1">● Çevrimiçi</span>
                    ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1">● Bağlantı Yok</span>
                    )}
                </div>
              </div>
            </div>
            <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex justify-end gap-3 sticky top-24 z-40">
            <div className="bg-card/80 backdrop-blur border p-1.5 rounded-xl flex gap-2 shadow-sm">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="size-4 mr-2" /> Sıfırla
                </Button>
                <Button onClick={handleSaveConfig} disabled={isSaving || connectionStatus !== 'success'} size="sm">
                    {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Cloud className="size-4 mr-2" />}
                    Supabase'e Kaydet
                </Button>
            </div>
        </div>

        <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="connection" className="rounded-lg gap-2"><Key className="size-4" /> Bağlantı</TabsTrigger>
              <TabsTrigger value="model" className="rounded-lg gap-2"><Settings2 className="size-4" /> Model</TabsTrigger>
              <TabsTrigger value="prompt" className="rounded-lg gap-2"><FileText className="size-4" /> Prompt</TabsTrigger>
              <TabsTrigger value="rag" className="rounded-lg gap-2"><Database className="size-4" /> RAG</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: BAĞLANTI --- */}
            <TabsContent value="connection" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Bağlantısı</CardTitle>
                  <CardDescription>Bu bilgiler tarayıcınızda saklanır.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Supabase URL</Label>
                        <Input 
                            value={apiKeys.supabaseUrl} 
                            onChange={e => setApiKeys({...apiKeys, supabaseUrl: e.target.value})}
                            placeholder="https://your-project.supabase.co"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Supabase Anon Key</Label>
                        <Input 
                            type="password"
                            value={apiKeys.supabaseAnonKey} 
                            onChange={e => setApiKeys({...apiKeys, supabaseAnonKey: e.target.value})}
                            placeholder="public-anon-key"
                        />
                    </div>
                    <div className="p-4 bg-muted/30 border rounded-lg space-y-2">
                        <Label className="flex items-center gap-2">
                            <Key className="size-4 text-primary" /> 
                            Internal API Key (Veritabanında Saklanır)
                        </Label>
                        <Input 
                            type="password"
                            value={apiKeys.internalApiKey} 
                            onChange={e => setApiKeys({...apiKeys, internalApiKey: e.target.value})}
                            placeholder="Chatbot API'sini korumak için şifre"
                        />
                        <p className="text-xs text-muted-foreground">Bu şifre, veritabanına kaydedilir ve chatbot API'nizi korur.</p>
                    </div>
                    <Button onClick={handleSaveConnection} variant="secondary" className="w-full">
                        Bağlantıyı Güncelle
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: MODEL --- */}
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

            {/* --- TAB 3: PROMPT --- */}
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

            {/* --- TAB 4: RAG --- */}
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

        {/* --- EKLENEN BİLGİ KARTI --- */}
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 flex gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Info className="size-5 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">API Kullanım Bilgisi</h4>
                    <p className="text-sm text-muted-foreground">
                        Bu sayfada yaptığınız ayarlar Supabase veritabanında saklanır. Chatbot uygulamanızdan bu ayarlara erişmek için aşağıdaki endpoint'i kullanın:
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2 text-xs font-mono bg-background border p-2 rounded">
                            <span className="text-blue-500">GET</span>
                            <span>/api/config</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chatbot uygulamanızda <code className="bg-muted px-1 rounded">GET</code> isteği atarak en son 
                            konfigürasyonu ve <code className="bg-muted px-1 rounded">internal_api_key</code> değerini çekebilirsiniz.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>

      </main>
    </div>
  )
}
