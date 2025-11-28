"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js" // Supabase importu eklendi
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, RotateCcw, Sparkles, Database, Settings2, FileText, Key, Cloud } from "lucide-react"
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

interface ApiKeys {
  supabaseUrl: string
  supabaseAnonKey: string
  internalApiKey: string
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

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    supabaseUrl: "",
    supabaseAnonKey: "",
    internalApiKey: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // 1. Sayfa Yüklendiğinde: Önce Anahtarları Al, Sonra Veriyi Çek
  useEffect(() => {
    // A. API Anahtarlarını LocalStorage'dan al
    const savedApiKeys = localStorage.getItem("api-keys")
    let currentKeys = null

    if (savedApiKeys) {
      currentKeys = JSON.parse(savedApiKeys)
      setApiKeys(currentKeys)
      
      // Eğer anahtarlar varsa bağlantıyı test et ve veriyi çek
      if (currentKeys.supabaseUrl && currentKeys.supabaseAnonKey) {
        checkSupabaseConnection(currentKeys.supabaseUrl, currentKeys.supabaseAnonKey)
        fetchConfigFromSupabase(currentKeys.supabaseUrl, currentKeys.supabaseAnonKey)
      }
    }

    // B. Eğer Supabase yoksa, LocalStorage'daki config'i yükle (Yedek)
    if (!currentKeys?.supabaseUrl) {
      const savedConfig = localStorage.getItem("vertex-ai-config")
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    }
  }, [])

  // Supabase'den En Son Config'i Çeken Fonksiyon
  const fetchConfigFromSupabase = async (url: string, key: string) => {
    setIsLoadingData(true)
    try {
      const supabase = createClient(url, key)
      
      // En son eklenen kaydı getir (created_at'e göre tersten sırala)
      const { data, error } = await supabase
        .from('vertex_configs')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası (normaldir)
        console.error("Supabase veri çekme hatası:", error)
        throw error
      }

      if (data) {
        // Veritabanındaki (snake_case) veriyi State'e (camelCase) dönüştür
        setConfig({
          modelName: data.model_name || "gemini-2.5-flash-preview-09-2025",
          systemInstruction: data.system_instruction || "",
          ragCorpus: data.rag_corpus || "",
          similarityTopK: data.similarity_top_k || 10,
          temperature: data.temperature || 0.1,
          topP: data.top_p || 0.95,
          maxOutputTokens: data.max_output_tokens || 65535,
        })
        toast.info("Ayarlar Supabase'den yüklendi")
      }
    } catch (error) {
      console.error("Veri yüklenemedi:", error)
      // Hata olursa local'den yüklemeyi dene
      const savedConfig = localStorage.getItem("vertex-ai-config")
      if (savedConfig) setConfig(JSON.parse(savedConfig))
    } finally {
      setIsLoadingData(false)
    }
  }

  const checkSupabaseConnection = async (url: string, key: string) => {
    if (!url || !key) return
    try {
      // Basit bir bağlantı testi için Supabase client kullanıyoruz
      const supabase = createClient(url, key)
      // Tablo var mı diye kontrol etmek için boş bir sorgu atıyoruz
      const { count, error } = await supabase
        .from('vertex_configs')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      setIsConnected(true)
    } catch (error) {
      console.error("Bağlantı hatası:", error)
      setIsConnected(false)
    }
  }

  const handleSaveApiKeys = async () => {
    if (!apiKeys.supabaseUrl || !apiKeys.supabaseAnonKey || !apiKeys.internalApiKey) {
      toast.error("Lütfen tüm API anahtar alanlarını doldurun")
      return
    }

    try {
      localStorage.setItem("api-keys", JSON.stringify(apiKeys))
      await checkSupabaseConnection(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
      
      // Anahtarları kaydettikten sonra hemen veriyi çekmeyi dene
      await fetchConfigFromSupabase(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
      
      toast.success("API anahtarları kaydedildi ve bağlantı kuruldu!")
    } catch (error) {
      toast.error("API anahtarları kaydedilirken hata oluştu")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Önce LocalStorage'a yedekle (Her ihtimale karşı)
      localStorage.setItem("vertex-ai-config", JSON.stringify(config))

      // 2. Supabase Bağlantısı varsa oraya INSERT et
      if (isConnected && apiKeys.supabaseUrl && apiKeys.supabaseAnonKey) {
        const supabase = createClient(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
        
        // Veritabanı formatına (snake_case) çevir
        const dbPayload = {
          model_name: config.modelName,
          system_instruction: config.systemInstruction,
          rag_corpus: config.ragCorpus,
          similarity_top_k: config.similarityTopK,
          temperature: config.temperature,
          top_p: config.topP,
          max_output_tokens: config.maxOutputTokens,
          // created_at ve updated_at Supabase tarafından otomatik atanır (default now())
        }

        const { error } = await supabase
          .from('vertex_configs')
          .insert([dbPayload])

        if (error) throw error
      }

      // 3. API Route'a gönder (Opsiyonel: Eğer runtime config kullanıyorsan)
      // Bu adım Next.js API'sinin anlık olarak haberdar olması için gerekebilir
      // ama Supabase kullanıyorsan API oradan da okuyabilir.
      try {
        await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        })
      } catch (e) {
        console.warn("Local API update failed (ignorable if using Supabase)", e)
      }

      toast.success(isConnected ? "Ayarlar Supabase veritabanına kaydedildi!" : "Ayarlar yerel olarak kaydedildi!")
    } catch (error: any) {
      toast.error(`Kayıt hatası: ${error.message || "Bilinmeyen hata"}`)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const defaultConfig: Config = {
        modelName: "gemini-2.5-flash-preview-09-2025",
        systemInstruction: "",
        ragCorpus: "",
        similarityTopK: 10,
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 65535,
    }
    setConfig(defaultConfig)
    localStorage.setItem("vertex-ai-config", JSON.stringify(defaultConfig))
    toast.success("Ayarlar varsayılana sıfırlandı (Kaydetmeyi unutmayın)")
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
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">API Konfigürasyon Yönetimi</p>
                    {isLoadingData && <span className="text-xs text-blue-500 animate-pulse">(Veri Yükleniyor...)</span>}
                </div>
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
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[140px]">
              {isConnected ? <Cloud className="size-4" /> : <Save className="size-4" />}
              {isSaving ? "Kaydediliyor..." : isConnected ? "Buluta Kaydet" : "Yerel Kaydet"}
            </Button>
          </div>

          <Tabs defaultValue="api-keys" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api-keys" className="gap-2">
                <Key className="size-4" />
                API Ayarları
              </TabsTrigger>
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

            <TabsContent value="api-keys" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Anahtarları & Bağlantı</CardTitle>
                  <CardDescription>Supabase ve güvenlik ayarlarınızı yapılandırın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Supabase URL */}
                  <div className="space-y-2">
                    <Label htmlFor="supabaseUrl">Supabase URL</Label>
                    <Input
                      id="supabaseUrl"
                      type="url"
                      value={apiKeys.supabaseUrl}
                      onChange={(e) => setApiKeys({ ...apiKeys, supabaseUrl: e.target.value })}
                      placeholder="https://your-project.supabase.co"
                    />
                  </div>

                  {/* Supabase Anon Key */}
                  <div className="space-y-2">
                    <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                    <Input
                      id="supabaseAnonKey"
                      type="password"
                      value={apiKeys.supabaseAnonKey}
                      onChange={(e) => setApiKeys({ ...apiKeys, supabaseAnonKey: e.target.value })}
                      placeholder="Supabase Anon/Public Key"
                    />
                  </div>

                  <Separator />

                  {/* Internal API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="internalApiKey">Internal API Key (Opsiyonel)</Label>
                    <Input
                      id="internalApiKey"
                      type="password"
                      value={apiKeys.internalApiKey}
                      onChange={(e) => setApiKeys({ ...apiKeys, internalApiKey: e.target.value })}
                      placeholder="Chatbot güvenliği için belirlediğiniz şifre"
                    />
                  </div>

                  {isConnected ? (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                          Supabase Bağlantısı Başarılı
                        </p>
                        <p className="text-xs text-muted-foreground">Ayarlarınız artık veritabanında saklanıyor.</p>
                      </div>
                    </div>
                  ) : (
                    apiKeys.supabaseUrl && (
                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-yellow-500" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                          Bağlantı kontrol ediliyor veya başarısız...
                        </p>
                      </div>
                    )
                  )}

                  <Button onClick={handleSaveApiKeys} className="w-full gap-2">
                    <Save className="size-4" />
                    Bağlantıyı Test Et ve Kaydet
                  </Button>

                  {/* SQL Info */}
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm">
                    <p className="font-medium text-foreground mb-2">📌 Gerekli SQL Tablosu</p>
                    <p className="text-muted-foreground mb-3">
                      Supabase SQL Editöründe bu tabloyu oluşturduğunuzdan emin olun:
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto select-all">
                      {`CREATE TABLE vertex_configs (
  id BIGSERIAL PRIMARY KEY,
  model_name TEXT,
  system_instruction TEXT,
  rag_corpus TEXT,
  similarity_top_k INTEGER,
  temperature FLOAT,
  top_p FLOAT,
  max_output_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Ayarları */}
            <TabsContent value="model" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Konfigürasyonu</CardTitle>
                  <CardDescription>Gemini model parametrelerini ayarlayın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="modelName">Model Adı</Label>
                    <Input
                      id="modelName"
                      value={config.modelName}
                      onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                      placeholder="gemini-2.5-flash-preview-09-2025"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperature (Yaratıcılık)</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.temperature.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="temperature"
                      value={[config.temperature]}
                      onValueChange={([value]) => setConfig({ ...config, temperature: value })}
                      min={0} max={2} step={0.01}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topP">Top P</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.topP.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="topP"
                      value={[config.topP]}
                      onValueChange={([value]) => setConfig({ ...config, topP: value })}
                      min={0} max={1} step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Maksimum Token</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.maxOutputTokens}
                      onChange={(e) => setConfig({ ...config, maxOutputTokens: parseInt(e.target.value) || 8192 })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Prompt */}
            <TabsContent value="prompt" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Talimatı (Prompt)</CardTitle>
                  <CardDescription>Modelin nasıl davranacağını belirleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={config.systemInstruction}
                    onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
                    placeholder="Sen bir yatırım uzmanısın..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* RAG Ayarları */}
            <TabsContent value="rag" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>RAG (Veri Bağlantısı)</CardTitle>
                  <CardDescription>Vertex AI Corpus ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ragCorpus">RAG Corpus ID</Label>
                    <Input
                      id="ragCorpus"
                      value={config.ragCorpus}
                      onChange={(e) => setConfig({ ...config, ragCorpus: e.target.value })}
                      placeholder="projects/..."
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="similarityTopK">Getirilecek Chunk Sayısı (Top K)</Label>
                      <span className="text-sm font-medium text-muted-foreground">{config.similarityTopK}</span>
                    </div>
                    <Slider
                      id="similarityTopK"
                      value={[config.similarityTopK]}
                      onValueChange={([value]) => setConfig({ ...config, similarityTopK: value })}
                      min={1} max={50} step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
