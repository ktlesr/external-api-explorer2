import { useState } from "react"
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
import { Loader2, Upload, Cloud, FolderOpen } from "lucide-react"

interface RagImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type SourceType = "gcs" | "googleDrive"
type ParserType = "default" | "llm" | "layout"

const LLM_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
]

const PROCESSOR_REGIONS = ["eu", "us"]

export function RagImportModal({ open, onOpenChange, onSuccess }: RagImportModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  
  // Source settings
  const [sourceType, setSourceType] = useState<SourceType>("gcs")
  const [gcsUri, setGcsUri] = useState("")
  const [driveResourceId, setDriveResourceId] = useState("")
  
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
    if (parserType === "layout" && !layoutProcessorId) {
      toast.error("Document AI Processor ID gerekli")
      return
    }

    setIsImporting(true)

    try {
      const source: any = { type: sourceType }
      if (sourceType === "gcs") {
        source.uri = gcsUri
      } else if (sourceType === "googleDrive") {
        source.resourceId = driveResourceId
      }

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

      const { data, error } = await supabase.functions.invoke("rag-engine", {
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
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="gcs"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  sourceType === "gcs" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="gcs" id="gcs" />
                <Cloud className="size-5" />
                <div>
                  <p className="font-medium">Google Cloud Storage</p>
                  <p className="text-xs text-muted-foreground">gs://bucket/path</p>
                </div>
              </Label>
              <Label
                htmlFor="googleDrive"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  sourceType === "googleDrive" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="googleDrive" id="googleDrive" />
                <FolderOpen className="size-5" />
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-xs text-muted-foreground">File/Folder ID</p>
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
