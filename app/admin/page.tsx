"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import AdminPanel from "@/components/admin-panel"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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

export default function AdminPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    supabaseUrl: "",
    supabaseAnonKey: "",
    internalApiKey: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  // --- Auth check ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/login")
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // --- LocalStorage + ilk config yükleme ---
  useEffect(() => {
    const init = async () => {
      const savedApiKeys = localStorage.getItem("api-keys")
      if (savedApiKeys) {
        const keys = JSON.parse(savedApiKeys)
        setApiKeys((prev) => ({ ...prev, ...keys }))
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

  // --- Supabase'ten son config'i çek ---
  const fetchLatestConfig = async (url: string, key: string) => {
    setIsLoading(true)
    try {
      const supabaseClient = createClient(url, key)

      const { data, error } = await supabaseClient
        .from("vertex_configs")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()

      // 0 satır hatasını (PGRST116) yok say
      if (error && error.code !== "PGRST116") throw error

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
          setApiKeys((prev) => ({
            ...prev,
            internalApiKey: data.internal_api_key,
          }))
        }

        toast.success("Ayarlar yüklendi")
      }

      setConnectionStatus("success")
    } catch (error) {
      console.error(error)
      setConnectionStatus("error")
      toast.error("Veri çekilemedi")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Supabase URL / anon key kaydet + test ---
  const handleSaveConnection = async () => {
    if (!apiKeys.supabaseUrl || !apiKeys.supabaseAnonKey) {
      toast.error("Alanları doldurun")
      return
    }

    localStorage.setItem("api-keys", JSON.stringify(apiKeys))
    await fetchLatestConfig(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)
  }

  // --- Config kaydet: config_key='default' üzerinden tek kayıt mantığı ---
  const handleSaveConfig = async () => {
    if (connectionStatus !== "success") {
      toast.error("Supabase bağlantısı yok.")
      return
    }

    setIsSaving(true)

    try {
      const supabaseClient = createClient(apiKeys.supabaseUrl, apiKeys.supabaseAnonKey)

      const dbPayload = {
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

      // 1) config_key='default' satırını bul
      const { data: existingConfig, error: selectError } = await supabaseClient
        .from("vertex_configs")
        .select("id")
        .eq("config_key", "default")
        .maybeSingle()

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = 0 satır, onu hata saymıyoruz
        throw selectError
      }

      let error

      if (existingConfig) {
        // 2) Varsa o kaydı güncelle
        const result = await supabaseClient
          .from("vertex_configs")
          .update(dbPayload)
          .eq("id", existingConfig.id)

        error = result.error
      } else {
        // 3) Yoksa yeni ekle – config_key'i mutlaka gönder
        const result = await supabaseClient
          .from("vertex_configs")
          .insert([{ config_key: "default", ...dbPayload }])

        error = result.error
      }

      if (error) throw error

      toast.success("Ayarlar başarıyla kaydedildi!")
    } catch (error: any) {
      console.error(error)
      toast.error(`Hata: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm("Sıfırlamak istediğinize emin misiniz?")) {
      setConfig(DEFAULT_CONFIG)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Burada AdminPanel'e nasıl props verdiğin tamamen senin mevcut tasarımına bağlı.
  // Şu an için mevcut kodunu bozmamak adına aynı bırakıyorum.
  // Eğer AdminPanel config/apiKeys/save handler'ları props olarak bekliyorsa, buraya ekleyebilirsin.
  return <AdminPanel />
}
