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
import { toast } from "sonner"
import { Save, RotateCcw, Sparkles, Database, Settings2, FileText, Key, Cloud, Loader2, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const DEFAULT_CONFIG = {
  modelName: "gemini-1.5-flash-001", // Vertex için kararlı sürüm
  systemInstruction: "",
  ragCorpus: "",
  similarityTopK: 10,
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 8192,
  // Yeni Alanlar (Varsayılan Boş)
  vertexProjectId: "",
  vertexClientEmail: "",
  vertexPrivateKey: "",
}

// ... (Interface tanımları Config içine yeni alanları ekleyerek güncellendi)
interface Config {
  modelName: string
  systemInstruction: string
  ragCorpus: string
  similarityTopK: number
  temperature: number
  topP: number
  maxOutputTokens: number
  // Yeni Alanlar
  vertexProjectId: string
  vertexClientEmail: string
  vertexPrivateKey: string
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

  useEffect(() => {
    const init = async () => {
      const savedApiKeys = localStorage.getItem("api-keys")
      if (savedApiKeys) {
        const keys = JSON.parse(savedApiKeys)
        setApiKeys(prev => ({ ...prev, ...keys }))
        if (keys.supabaseUrl && keys.supabaseAnonKey) {
          await fetchLatestConfig(keys.supabaseUrl, keys.supabaseAnonKey)
        } else { setIsLoading(false) }
      } else { setIsLoading(false) }
    }
    init()
  }, [])

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
          maxOutputTokens: data.max_output_tokens || 8192,
          // Yeni Alanları Çek
          vertexProjectId: data.vertex_project_id || "",
          vertexClientEmail: data.vertex_client_email || "",
          vertexPrivateKey: data.vertex_private_key || "",
        })
        if (data.internal_api_key) setApiKeys(prev => ({ ...prev, internalApiKey: data.internal_api_key }))
        toast.success("Ayarlar yüklendi")
      }
      setConnectionStatus('success')
    } catch (error) {
      console.error(error)
      setConnectionStatus('error')
      toast.error("Veri çekilemedi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    if (connectionStatus !== 'success') {
      toast.error("Supabase bağlantısı yok.")
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
        // Yeni Alanları Kaydet
        vertex_project_id: config.vertexProjectId,
        vertex_client_email: config.vertexClientEmail,
        vertex_private_key: config.vertexPrivateKey,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase.from('vertex_configs').insert([dbPayload])
      if (error) throw error
      toast.success("Tüm ayarlar kaydedildi!")
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // ... (handleSaveConnection, handleReset vb. aynı kalıyor) ...
  const handleSaveConnection = async () => { /* ... Eski kodun aynısı ... */ }
  const handleReset = () => { /* ... Eski kodun aynısı ... */ }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header aynı kalıyor... */}
      <header className="border-b bg-card/50 p-4 sticky top-0 z-50 backdrop-blur"><h1 className="text-xl font-bold">Vertex AI Admin</h1></header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex justify-end gap-3 sticky top-20 z-40">
            <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Cloud className="mr-2 size-4" />} Kaydet
            </Button>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="connection" className="gap-2"><Key className="size-4" /> DB Bağlantı</TabsTrigger>
              <TabsTrigger value="credentials" className="gap-2"><ShieldCheck className="size-4" /> Google Key</TabsTrigger>
              <TabsTrigger value="model" className="gap-2"><Settings2 className="size-4" /> Model</TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2"><FileText className="size-4" /> Prompt</TabsTrigger>
              <TabsTrigger value="rag" className="gap-2"><Database className="size-4" /> RAG</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: DB BAĞLANTI (Aynı) --- */}
            <TabsContent value="connection">
                {/* ... Eski Connection Tab içeriği aynen buraya ... */}
                <Card><CardHeader><CardTitle>Supabase Bağlantısı</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={apiKeys.supabaseUrl} onChange={e => setApiKeys({...apiKeys, supabaseUrl: e.target.value})} placeholder="Supabase URL" /><Input type="password" value={apiKeys.supabaseAnonKey} onChange={e => setApiKeys({...apiKeys, supabaseAnonKey: e.target.value})} placeholder="Anon Key" /><Input type="password" value={apiKeys.internalApiKey} onChange={e => setApiKeys({...apiKeys, internalApiKey: e.target.value})} placeholder="Internal Chat API Key" /><Button onClick={handleSaveConnection}>Bağlan</Button></CardContent></Card>
            </TabsContent>

            {/* --- YENİ TAB: GOOGLE CREDENTIALS --- */}
            <TabsContent value="credentials" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Cloud Kimlik Bilgileri</CardTitle>
                  <CardDescription>Vertex AI Service Account (JSON) dosyasındaki bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Project ID</Label>
                    <Input 
                        value={config.vertexProjectId} 
                        onChange={e => setConfig({...config, vertexProjectId: e.target.value})}
                        placeholder="Örn: aicb-479506" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Email</Label>
                    <Input 
                        value={config.vertexClientEmail} 
                        onChange={e => setConfig({...config, vertexClientEmail: e.target.value})}
                        placeholder="service-account@project.iam.gserviceaccount.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Private Key</Label>
                    <Textarea 
                        value={config.vertexPrivateKey} 
                        onChange={e => setConfig({...config, vertexPrivateKey: e.target.value})}
                        placeholder="-----BEGIN PRIVATE KEY----- ..." 
                        className="font-mono text-xs min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">JSON dosyasındaki "private_key" değerini tırnaklar olmadan, tamamını yapıştırın.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ... Diğer Tablar (Model, Prompt, RAG) aynı kalıyor ... */}
            <TabsContent value="model"><Card><CardContent className="pt-6 space-y-4"><Label>Model</Label><Input value={config.modelName} onChange={e=>setConfig({...config, modelName: e.target.value})} /><Label>Temp</Label><Slider value={[config.temperature]} onValueChange={([v])=>setConfig({...config, temperature: v})} max={1}/></CardContent></Card></TabsContent>
            <TabsContent value="prompt"><Card><CardContent className="pt-6"><Textarea value={config.systemInstruction} onChange={e=>setConfig({...config, systemInstruction: e.target.value})} className="min-h-[300px]"/></CardContent></Card></TabsContent>
            <TabsContent value="rag"><Card><CardContent className="pt-6 space-y-4"><Label>Corpus ID</Label><Input value={config.ragCorpus} onChange={e=>setConfig({...config, ragCorpus: e.target.value})} /><Label>Top K: {config.similarityTopK}</Label><Slider value={[config.similarityTopK]} onValueChange={([v])=>setConfig({...config, similarityTopK: v})} min={1} max={50}/></CardContent></Card></TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
