import { useState, useRef, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Loader2, Upload, Cloud, FolderOpen, FileUp, X, FileText } from "lucide-react"

interface RagImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type SourceType = "gcs" | "googleDrive" | "localFile"
type ParserType = "default" | "llm" | "layout"

const LLM_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
]

const PROCESSOR_REGIONS = ["eu", "us"]

const SUPPORTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "text/html": [".html"],
  "text/csv": [".csv"],
  "application/json": [".json"],
  "application/jsonl": [".jsonl"],
  "application/x-ndjson": [".jsonl"],
  "text/markdown": [".md"],
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase()
}

function isFileTypeSupported(file: File): boolean {
  const ext = getFileExtension(file.name)
  const supportedExtensions = Object.values(SUPPORTED_FILE_TYPES).flat()
  return supportedExtensions.includes(ext)
}

export function RagImportModal({ open, onOpenChange, onSuccess }: RagImportModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Source settings
  const [sourceType, setSourceType] = useState<SourceType>("gcs")
  const [gcsUri, setGcsUri] = useState("")
  const [driveResourceId, setDriveResourceId] = useState("")
  
  // Local file upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Chunking settings
  const [chunkSize, setChunkSize] = useState(1024)
  const [chunkOverlap, setChunkOverlap] = useState(256)
  const [maxEmbeddingRequestsPerMin, setMaxEmbeddingRequestsPerMin] = useState(1000)
  
  // Parser settings
  const [parserType, setParserType] = useState<ParserType>("default")
  
  // LLM Parser options
  const [llmModel, setLlmModel] = useState("gemini-1.5-flash")
  const [llmMaxParsingRequests, setLlmMaxParsingRequests] = useState<number | undefined>()
  const [llmCustomPrompt, setLlmCustomPrompt] = useState("")
  
  // Document AI Layout Parser options
  const [layoutProcessorRegion, setLayoutProcessorRegion] = useState("eu")
  const [layoutProcessorId, setLayoutProcessorId] = useState("")
  const [layoutMaxParsingRequests, setLayoutMaxParsingRequests] = useState(120)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    
    const newFiles: File[] = []
    const errors: string[] = []
    
    Array.from(files).forEach(file => {
      if (!isFileTypeSupported(file)) {
        errors.push(`${file.name}: Desteklenmeyen dosya türü`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Dosya boyutu 20MB'ı aşıyor`)
        return
      }
      newFiles.push(file)
    })
    
    if (errors.length > 0) {
      toast.error(errors.join("\n"))
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getMimeType = (file: File): string => {
    const ext = getFileExtension(file.name)
    if (ext === ".jsonl") return "application/jsonl"
    return file.type || "application/octet-stream"
  }

  const handleImport = async () => {
    // Validation
    if (sourceType === "gcs" && !gcsUri) {
      toast.error("GCS URI gerekli")
      return
    }
    if (sourceType === "googleDrive" && !driveResourceId) {
      toast.error("Google Drive Resource ID gerekli")
      return
    }
    if (sourceType === "localFile" && selectedFiles.length === 0) {
      toast.error("En az bir dosya seçin")
      return
    }
    if (parserType === "layout" && !layoutProcessorId) {
      toast.error("Document AI Processor ID gerekli")
      return
    }

    setIsImporting(true)

    try {
      const parserConfig: any = {}
      if (parserType === "llm") {
        parserConfig.model = llmModel
        if (llmMaxParsingRequests) {
          parserConfig.maxParsingRequestsPerMin = llmMaxParsingRequests
        }
        if (llmCustomPrompt) {
          parserConfig.customParsingPrompt = llmCustomPrompt
        }
      } else if (parserType === "layout") {
        parserConfig.processorRegion = layoutProcessorRegion
        parserConfig.processorId = layoutProcessorId
        parserConfig.maxParsingRequestsPerMin = layoutMaxParsingRequests
      }

      let data, error

      if (sourceType === "localFile") {
        // Convert files to base64 and upload
        toast.info("Dosyalar yükleniyor...")
        
        const filesData = await Promise.all(
          selectedFiles.map(async (file) => ({
            name: file.name,
            content: await fileToBase64(file),
            mimeType: getMimeType(file),
            size: file.size,
          }))
        )

        const result = await supabase.functions.invoke("rag-engine", {
          body: {
            action: "upload-and-import",
            files: filesData,
            chunkSize,
            chunkOverlap,
            maxEmbeddingRequestsPerMin,
            parserType,
            parserConfig,
          },
        })
        data = result.data
        error = result.error
      } else {
        // Existing GCS/Google Drive flow
        const source: any = { type: sourceType }
        if (sourceType === "gcs") {
          source.uri = gcsUri
        } else if (sourceType === "googleDrive") {
          source.resourceId = driveResourceId
        }

        const result = await supabase.functions.invoke("rag-engine", {
          body: {
            action: "import-files",
            source,
            chunkSize,
            chunkOverlap,
            maxEmbeddingRequestsPerMin,
            parserType,
            parserConfig,
          },
        })
        data = result.data
        error = result.error
      }

      if (error) throw error

      toast.success("İçe aktarma işlemi başlatıldı")
      
      // Check if we got an operation name for long-running operation
      if (data.name) {
        toast.info(`İşlem devam ediyor: ${data.name.split("/").pop()}`)
      }

      onSuccess()
    } catch (error) {
      toast.error("İçe aktarma başarısız: " + (error as Error).message)
    } finally {
      setIsImporting(false)
    }
  }

  const resetForm = () => {
    setSourceType("gcs")
    setGcsUri("")
    setDriveResourceId("")
    setSelectedFiles([])
    setChunkSize(1024)
    setChunkOverlap(256)
    setMaxEmbeddingRequestsPerMin(1000)
    setParserType("default")
    setLlmModel("gemini-1.5-flash")
    setLlmMaxParsingRequests(undefined)
    setLlmCustomPrompt("")
    setLayoutProcessorRegion("eu")
    setLayoutProcessorId("")
    setLayoutMaxParsingRequests(120)
  }

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Dosya İçe Aktar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Veri Kaynağı</Label>
            <RadioGroup
              value={sourceType}
              onValueChange={(v: string) => setSourceType(v as SourceType)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="gcs"
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                  sourceType === "gcs" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="gcs" id="gcs" className="sr-only" />
                <Cloud className="size-6" />
                <div>
                  <p className="font-medium text-sm">Google Cloud Storage</p>
                  <p className="text-xs text-muted-foreground">gs://bucket/path</p>
                </div>
              </Label>
              <Label
                htmlFor="googleDrive"
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                  sourceType === "googleDrive" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="googleDrive" id="googleDrive" className="sr-only" />
                <FolderOpen className="size-6" />
                <div>
                  <p className="font-medium text-sm">Google Drive</p>
                  <p className="text-xs text-muted-foreground">File/Folder ID</p>
                </div>
              </Label>
              <Label
                htmlFor="localFile"
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                  sourceType === "localFile" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="localFile" id="localFile" className="sr-only" />
                <FileUp className="size-6" />
                <div>
                  <p className="font-medium text-sm">Yerel Dosya</p>
                  <p className="text-xs text-muted-foreground">Bilgisayardan yükle</p>
                </div>
              </Label>
            </RadioGroup>

            {sourceType === "gcs" && (
              <div className="space-y-2">
                <Label>GCS URI *</Label>
                <Input
                  value={gcsUri}
                  onChange={(e) => setGcsUri(e.target.value)}
                  placeholder="gs://my-bucket/documents/"
                />
                <p className="text-xs text-muted-foreground">
                  Klasör için "/" ile bitirin, tek dosya için tam yolu girin
                </p>
              </div>
            )}

            {sourceType === "googleDrive" && (
              <div className="space-y-2">
                <Label>Resource ID *</Label>
                <Input
                  value={driveResourceId}
                  onChange={(e) => setDriveResourceId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                />
                <p className="text-xs text-muted-foreground">
                  Google Drive dosya veya klasör ID'si
                </p>
              </div>
            )}

            {sourceType === "localFile" && (
              <div className="space-y-3">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.html,.csv,.json,.jsonl,.md"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <FileUp className="size-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Dosyaları buraya sürükleyin</p>
                  <p className="text-sm text-muted-foreground">veya tıklayarak seçin</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOCX, TXT, HTML, CSV, JSON, JSONL, MD • Max 20MB/dosya
                  </p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Seçilen Dosyalar ({selectedFiles.length})</Label>
                    <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 px-3 py-2">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chunking Settings */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Parçalama Ayarları</Label>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Chunk Size</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{chunkSize}</span>
                </div>
                <Slider
                  value={[chunkSize]}
                  onValueChange={([v]) => setChunkSize(v)}
                  min={256}
                  max={4096}
                  step={128}
                />
                <p className="text-xs text-muted-foreground">Her parçanın maksimum token sayısı</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Chunk Overlap</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{chunkOverlap}</span>
                </div>
                <Slider
                  value={[chunkOverlap]}
                  onValueChange={([v]) => setChunkOverlap(v)}
                  min={0}
                  max={1024}
                  step={64}
                />
                <p className="text-xs text-muted-foreground">Parçalar arası örtüşme</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Embedding Requests/Min</Label>
              <Input
                type="number"
                value={maxEmbeddingRequestsPerMin}
                onChange={(e) => setMaxEmbeddingRequestsPerMin(parseInt(e.target.value) || 1000)}
              />
            </div>
          </div>

          {/* Parser Selection */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Layout Parser</Label>
            
            <RadioGroup
              value={parserType}
              onValueChange={(v: string) => setParserType(v as ParserType)}
              className="space-y-3"
            >
              <Label
                htmlFor="parser-default"
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  parserType === "default" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="default" id="parser-default" className="mt-1" />
                <div>
                  <p className="font-medium">Default</p>
                  <p className="text-sm text-muted-foreground">Temel metin çıkarma</p>
                </div>
              </Label>

              <Label
                htmlFor="parser-llm"
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  parserType === "llm" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="llm" id="parser-llm" className="mt-1" />
                <div>
                  <p className="font-medium">LLM Parser</p>
                  <p className="text-sm text-muted-foreground">
                    Çeşitli formatlardaki semantik içeriği anlamak ve yorumlamak için LLM modellerini kullanan gelişmiş ayrıştırıcı.
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="parser-layout"
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  parserType === "layout" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="layout" id="parser-layout" className="mt-1" />
                <div>
                  <p className="font-medium">Document AI Layout Parser</p>
                  <p className="text-sm text-muted-foreground">
                    Belgeden metin, tablo ve listeler gibi içerik öğelerini çıkarır.
                  </p>
                </div>
              </Label>
            </RadioGroup>

            {/* LLM Parser Options */}
            {parserType === "llm" && (
              <div className="ml-7 space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Model *</Label>
                  <Select value={llmModel} onValueChange={setLlmModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maximum parsing requests per min (opsiyonel)</Label>
                  <Input
                    type="number"
                    value={llmMaxParsingRequests || ""}
                    onChange={(e) => setLlmMaxParsingRequests(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Örn: 100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom parsing prompt (opsiyonel)</Label>
                  <Textarea
                    value={llmCustomPrompt}
                    onChange={(e) => setLlmCustomPrompt(e.target.value)}
                    placeholder="Özel ayrıştırma talimatlarınızı girin..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Belirtilmezse varsayılan prompt kullanılır.
                  </p>
                </div>
              </div>
            )}

            {/* Document AI Layout Parser Options */}
            {parserType === "layout" && (
              <div className="ml-7 space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Processor region *</Label>
                  <Select value={layoutProcessorRegion} onValueChange={setLayoutProcessorRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESSOR_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Processor ID *</Label>
                  <Input
                    value={layoutProcessorId}
                    onChange={(e) => setLayoutProcessorId(e.target.value)}
                    placeholder="Processor ID'yi girin"
                  />
                  <p className="text-xs text-muted-foreground">
                    Document AI'dan processor ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Maximum parsing requests per min *</Label>
                  <Input
                    type="number"
                    value={layoutMaxParsingRequests}
                    onChange={(e) => setLayoutMaxParsingRequests(parseInt(e.target.value) || 120)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                İçe Aktar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
