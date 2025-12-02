"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  RotateCcw,
  Sparkles,
  Database,
  Settings2,
  FileText,
  Key,
  Cloud,
  Loader2,
  ShieldCheck,
  LogOut,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useNavigate } from "react-router-dom"

const DEFAULT_CONFIG = {
  modelName: "gemini-2.5-flash",
  systemInstruction: "",
  ragCorpus: "",
  similarityTopK: 50,
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 65535,
  vertexProjectId: "",
  vertexClientEmail: "",
  vertexPrivateKey: "",
}

interface Config {
  modelName: string
  systemInstruction: string
  ragCorpus: string
  similarityTopK: number
  temperature: number
  topP: number
  maxOutputTokens: number
  vertexProjectId: string
  vertexClientEmail: string
  vertexPrivateKey: string
}

interface ApiKeys {
  supabaseUrl: string
  supabaseAnonKey: string
  internalApiKey: string
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    supabaseUrl: "",
    supabaseAnonKey: "",
    internalApiKey: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLatestConfig()
  }, [])

  const fetchLatestConfig = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("vertex_configs")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfig({
          modelName: data.model_name || DEFAULT_CONFIG.modelName,
          systemInstruction: data.system_instruction || "",
          ragCorpus: data.rag_corpus || "",
          similarityTopK: data.similarity_top_k || 50,
          temperature: data.temperature ?? 0.1,
          topP: data.top_p ?? 0.95,
          maxOutputTokens: data.max_output_tokens || 65535,
          vertexProjectId: data.vertex_project_id || "",
          vertexClientEmail: data.vertex_client_email || "",
          vertexPrivateKey: data.vertex_private_key || "",
        })
        if (data.internal_api_key) {
          setApiKeys((prev) => ({ ...prev, internalApiKey: data.internal_api_key || "" }))
        }
        toast.success("Ayarlar yüklendi")
      } else {
        toast.info("Henüz kayıtlı ayar bulunamadı")
      }
    } catch (error) {
      toast.error("Veri çekilemedi: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConnection = async () => {
    await fetchLatestConfig()
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      const dbPayload = {
        config_key: 'default',
        model_name: config.modelName,
        system_instruction: config.systemInstruction,
        rag_corpus: config.ragCorpus,
        similarity_top_k: config.similarityTopK,
        temperature: config.temperature,
        top_p: config.topP,
        max_output_tokens: config.maxOutputTokens,
        internal_api_key: apiKeys.internalApiKey,
        vertex_project_id: config.vertexProjectId,
        vertex_client_email: config.vertexClientEmail,
        vertex_private_key: config.vertexPrivateKey,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from("vertex_configs")
        .upsert(dbPayload, { onConflict: 'config_key' })
      if (error) throw error
      toast.success("Tüm ayarlar kaydedildi!")
      await fetchLatestConfig()
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm("Sıfırlamak istediğinize emin misiniz?")) setConfig(DEFAULT_CONFIG)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Çıkış yapıldı")
      navigate("/login")
    } catch (error) {
      toast.error("Çıkış yapılamadı")
    }
  }

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 p-4 sticky top-0 z-50 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <h1 className="text-xl font-bold">Vertex AI Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={handleLogout} title="Çıkış Yap">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex justify-end gap-3 sticky top-20 z-40">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" /> Sıfırla
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Cloud className="mr-2 size-4" />} Kaydet
          </Button>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="connection" className="gap-2">
              <Key className="size-4" /> Bağlantı
            </TabsTrigger>
            <TabsTrigger value="credentials" className="gap-2">
              <ShieldCheck className="size-4" /> Kimlik
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-2">
              <Settings2 className="size-4" /> Model
            </TabsTrigger>
            <TabsTrigger value="prompt" className="gap-2">
              <FileText className="size-4" /> Prompt
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2">
              <Database className="size-4" /> RAG
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Supabase Bağlantısı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={apiKeys.supabaseUrl}
                  onChange={(e) => setApiKeys({ ...apiKeys, supabaseUrl: e.target.value })}
                  placeholder="Supabase URL"
                />
                <Input
                  type="password"
                  value={apiKeys.supabaseAnonKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, supabaseAnonKey: e.target.value })}
                  placeholder="Anon Key"
                />
                <Input
                  type="password"
                  value={apiKeys.internalApiKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, internalApiKey: e.target.value })}
                  placeholder="Internal Chat API Key"
                />
                <Button onClick={handleSaveConnection}>Bağlan</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Cloud Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Project ID</Label>
                  <Input
                    value={config.vertexProjectId}
                    onChange={(e) => setConfig({ ...config, vertexProjectId: e.target.value })}
                    placeholder="aicb-479506"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    value={config.vertexClientEmail}
                    onChange={(e) => setConfig({ ...config, vertexClientEmail: e.target.value })}
                    placeholder="service-account@..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Private Key</Label>
                  <Textarea
                    value={config.vertexPrivateKey}
                    onChange={(e) => setConfig({ ...config, vertexPrivateKey: e.target.value })}
                    placeholder="-----BEGIN PRIVATE KEY----- ..."
                    className="font-mono text-xs min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label>Model Adı</Label>
                  <Input
                    value={config.modelName}
                    onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Temperature (Yaratıcılık)</Label>
                      <span className="px-2 py-0.5 rounded-md bg-muted font-mono text-xs border">
                        {config.temperature.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[config.temperature]}
                      onValueChange={([v]) => setConfig({ ...config, temperature: v })}
                      max={2}
                      step={0.05}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Top P (Olasılık)</Label>
                      <span className="px-2 py-0.5 rounded-md bg-muted font-mono text-xs border">
                        {config.topP.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[config.topP]}
                      onValueChange={([v]) => setConfig({ ...config, topP: v })}
                      max={1}
                      step={0.05}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Similarity Top K </Label>
                      <span className="px-2 py-0.5 rounded-md bg-muted font-mono text-xs border">
                        {config.similarityTopK.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[config.similarityTopK]}
                      onValueChange={([v]) => setConfig({ ...config, similarityTopK: v })}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Output Tokens</Label>
                  <Input
                    type="number"
                    value={config.maxOutputTokens}
                    onChange={(e) => setConfig({ ...config, maxOutputTokens: Number.parseInt(e.target.value) || 8192 })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompt" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  value={config.systemInstruction}
                  onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
                  className="min-h-[400px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rag" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>RAG Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Corpus ID</Label>
                  <Input
                    value={config.ragCorpus}
                    onChange={(e) => setConfig({ ...config, ragCorpus: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Top K (Chunk Sayısı)</Label>
                    <span className="font-mono">{config.similarityTopK}</span>
                  </div>
                  <Slider
                    value={[config.similarityTopK]}
                    onValueChange={([v]) => setConfig({ ...config, similarityTopK: v })}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
