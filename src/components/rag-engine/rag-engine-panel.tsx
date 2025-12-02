"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { RefreshCw, Plus, Database, FileText, Loader2 } from "lucide-react"
import { RagFileList } from "./rag-file-list"
import { RagImportModal } from "./rag-import-modal"

interface RagFile {
  name: string
  displayName: string
  description?: string
  sizeBytes?: string
  ragFileType?: string
  createTime?: string
  updateTime?: string
}

interface CorpusInfo {
  name: string
  displayName: string
  description?: string
  ragEmbeddingModelConfig?: {
    vertexPredictionEndpoint?: {
      endpoint?: string
    }
  }
}

export function RagEnginePanel() {
  const [files, setFiles] = useState<RagFile[]>([])
  const [corpusInfo, setCorpusInfo] = useState<CorpusInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [ragCorpus, setRagCorpus] = useState<string>("")

  useEffect(() => {
    loadRagCorpus()
  }, [])

  const loadRagCorpus = async () => {
    try {
      const { data, error } = await supabase
        .from("vertex_configs")
        .select("rag_corpus")
        .eq("config_key", "default")
        .maybeSingle()

      if (error) throw error
      if (data?.rag_corpus) {
        setRagCorpus(data.rag_corpus)
        await Promise.all([fetchFiles(), fetchCorpusInfo()])
      } else {
        toast.error("RAG Corpus ayarlanmamış. Lütfen önce RAG sekmesinden corpus ID'yi girin.")
      }
    } catch (error) {
      toast.error("Config yüklenemedi: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("rag-engine", {
        body: { action: "list-files" },
      })

      if (error) throw error
      setFiles(data.ragFiles || [])
    } catch (error) {
      console.error("Files fetch error:", error)
      toast.error("Dosyalar yüklenemedi")
    }
  }

  const fetchCorpusInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("rag-engine", {
        body: { action: "get-corpus" },
      })

      if (error) throw error
      setCorpusInfo(data)
    } catch (error) {
      console.error("Corpus info fetch error:", error)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await Promise.all([fetchFiles(), fetchCorpusInfo()])
    setIsLoading(false)
    toast.success("Yenilendi")
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return

    try {
      const { error } = await supabase.functions.invoke("rag-engine", {
        body: { action: "delete-file", fileName },
      })

      if (error) throw error
      toast.success("Dosya silindi")
      await fetchFiles()
    } catch (error) {
      toast.error("Silme başarısız: " + (error as Error).message)
    }
  }

  const handleImportSuccess = () => {
    setIsImportModalOpen(false)
    fetchFiles()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!ragCorpus) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Database className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">RAG Corpus Yapılandırılmamış</h3>
          <p className="text-muted-foreground">
            Lütfen önce "RAG" sekmesinden Corpus ID'yi yapılandırın.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Corpus Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="size-4" />
            Corpus Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Corpus:</span>
              <p className="font-mono text-xs break-all">{ragCorpus}</p>
            </div>
            {corpusInfo && (
              <>
                <div>
                  <span className="text-muted-foreground">Display Name:</span>
                  <p>{corpusInfo.displayName || "-"}</p>
                </div>
                {corpusInfo.ragEmbeddingModelConfig?.vertexPredictionEndpoint?.endpoint && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Embedding Model:</span>
                    <p className="font-mono text-xs">
                      {corpusInfo.ragEmbeddingModelConfig.vertexPredictionEndpoint.endpoint.split("/").pop()}
                    </p>
                  </div>
                )}
              </>
            )}
            <div>
              <span className="text-muted-foreground">Toplam Dosya:</span>
              <p className="font-semibold">{files.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Plus className="size-4 mr-2" />
          Dosya İçe Aktar
        </Button>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            RAG Dosyaları ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RagFileList files={files} onDelete={handleDeleteFile} />
        </CardContent>
      </Card>

      {/* Import Modal */}
      <RagImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
}
