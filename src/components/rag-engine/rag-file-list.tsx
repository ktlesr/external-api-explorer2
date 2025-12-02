"use client"

import { Button } from "@/components/ui/button"
import { Trash2, FileText, Clock, HardDrive } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RagFile {
  name: string
  displayName: string
  description?: string
  sizeBytes?: string
  ragFileType?: string
  createTime?: string
  updateTime?: string
}

interface RagFileListProps {
  files: RagFile[]
  onDelete: (fileName: string) => void
}

function formatBytes(bytes: string | undefined): string {
  if (!bytes) return "-"
  const num = parseInt(bytes, 10)
  if (num === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(num) / Math.log(k))
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function extractFileName(fullName: string): string {
  // Extract display name from full resource name
  const parts = fullName.split("/")
  return parts[parts.length - 1] || fullName
}

export function RagFileList({ files, onDelete }: RagFileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="size-12 mx-auto mb-4 opacity-50" />
        <p>Henüz dosya yok</p>
        <p className="text-sm">Yukarıdaki "Dosya İçe Aktar" butonunu kullanarak dosya ekleyebilirsiniz.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Dosya Adı</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <HardDrive className="size-3" />
                Boyut
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                Oluşturulma
              </div>
            </TableHead>
            <TableHead className="w-[80px]">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.name}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate max-w-[300px]" title={file.displayName}>
                      {file.displayName || extractFileName(file.name)}
                    </p>
                    {file.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                  {file.ragFileType || "RAG_FILE_TYPE_UNSPECIFIED"}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatBytes(file.sizeBytes)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(file.createTime)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(file.name)}
                  title="Sil"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
