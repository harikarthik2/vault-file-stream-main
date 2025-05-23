import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Eye, Lock, Share2, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShareFileModal from "./ShareFileModal";
import { FileVersion } from "@/types/files";

interface File {
  id: string;
  name: string;
  size: string;
  type: string;
  encryptionKey?: string;
  date: string;
  version?: number;
  versions?: FileVersion[];
}

interface FileListProps {
  files: File[];
  onDownload: (fileId: string, encryptionKey: string) => void;
  onView?: (fileId: string, encryptionKey: string) => void;
  onDelete: (fileId: string) => void;
  onVersionDownload?: (fileId: string, versionId: string, encryptionKey: string) => void;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  onDownload, 
  onView, 
  onDelete, 
  onVersionDownload 
}) => {
  const [decryptionKey, setDecryptionKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"download" | "view">("download");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<{id: string, name: string} | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  
  const getFileIcon = (fileType: string) => {
    const iconClasses = "h-10 w-10 p-2 rounded-lg";
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <div className={`${iconClasses} bg-red-500/20 text-red-500`}>PDF</div>;
      case 'doc':
      case 'docx':
        return <div className={`${iconClasses} bg-blue-500/20 text-blue-500`}>DOC</div>;
      case 'xls':
      case 'xlsx':
        return <div className={`${iconClasses} bg-green-500/20 text-green-500`}>XLS</div>;
      case 'ppt':
      case 'pptx':
        return <div className={`${iconClasses} bg-orange-500/20 text-orange-500`}>PPT</div>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <div className={`${iconClasses} bg-purple-500/20 text-purple-500`}>IMG</div>;
      default:
        return <div className={`${iconClasses} bg-gray-500/20 text-gray-500`}>FILE</div>;
    }
  };
  
  const handleActionClick = (file: File, action: "download" | "view") => {
    setSelectedFile(file);
    setDecryptionKey("");
    setActionType(action);
    setIsDecryptModalOpen(true);
  };
  
  const handleDecryptSubmit = () => {
    if (!selectedFile) return;
    
    if (actionType === "download") {
      onDownload(selectedFile.id, decryptionKey);
    } else if (actionType === "view" && onView) {
      onView(selectedFile.id, decryptionKey);
    }
    setIsDecryptModalOpen(false);
  };
  
  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete);
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleShareClick = (fileId: string, fileName: string) => {
    setFileToShare({ id: fileId, name: fileName });
    setIsShareModalOpen(true);
  };
  
  const handleViewVersions = (file: File) => {
    setSelectedFile(file);
    setIsVersionModalOpen(true);
  };
  
  const handleVersionDownload = () => {
    if (!selectedFile || !selectedVersion) return;
    
    if (onVersionDownload) {
      onVersionDownload(selectedFile.id, selectedVersion, decryptionKey);
    }
    
    setIsVersionModalOpen(false);
    setDecryptionKey("");
    setSelectedVersion(null);
  };
  
  if (files.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
        <p className="text-slate-400 mb-6">Upload your first encrypted file to get started</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
              <th className="p-4">Name</th>
              <th className="p-4">Size</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="p-4">
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <div className="ml-3">
                      <p className="text-white font-medium">{file.name}</p>
                      <div className="flex items-center text-xs text-slate-400">
                        <span>{file.type.toUpperCase()}</span>
                        {file.version && file.version > 1 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            v{file.version}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{file.size}</td>
                <td className="p-4 text-slate-300">{file.date}</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleActionClick(file, "download")}
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShareClick(file.id, file.name)}
                    >
                      <Share2 size={16} className="mr-1" />
                      Share
                    </Button>
                    
                    {file.versions && file.versions.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewVersions(file)}
                      >
                        <History size={16} className="mr-1" />
                        Versions
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                      onClick={() => handleActionClick(file, "view")}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => handleDeleteClick(file.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Decryption Modal */}
      <Dialog open={isDecryptModalOpen} onOpenChange={setIsDecryptModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Enter Decryption Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the encryption key to {actionType === "download" ? "decrypt and download" : "view"} {selectedFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="decryptionKey" className="text-white">Encryption Key</Label>
              <Input 
                id="decryptionKey"
                type="password"
                placeholder="Enter your encryption key"
                value={decryptionKey}
                onChange={(e) => setDecryptionKey(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDecryptModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDecryptSubmit}>
              {actionType === "download" ? "Download File" : "View File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* File Versions Modal */}
      <Dialog open={isVersionModalOpen} onOpenChange={setIsVersionModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>File Versions</DialogTitle>
            <DialogDescription className="text-slate-400">
              Previous versions of {selectedFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedFile?.versions && selectedFile.versions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFile.versions.map((version) => (
                  <div 
                    key={version.id} 
                    className={`p-3 rounded-md flex items-center justify-between ${
                      selectedVersion === version.id ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-slate-700'
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                    role="button"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">Version {version.version}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>
                    <input 
                      type="radio" 
                      checked={selectedVersion === version.id}
                      onChange={() => setSelectedVersion(version.id)}
                      className="h-4 w-4 text-purple-600"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No previous versions available</p>
            )}
            
            {selectedVersion && (
              <div className="mt-4 grid gap-2">
                <Label htmlFor="version-decrypt-key" className="text-white">Encryption Key</Label>
                <Input 
                  id="version-decrypt-key"
                  type="password"
                  placeholder="Enter encryption key to download version"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleVersionDownload} 
              disabled={!selectedVersion || !decryptionKey}
            >
              Download Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share File Modal */}
      {fileToShare && (
        <ShareFileModal
          isOpen={isShareModalOpen}
          fileId={fileToShare.id}
          fileName={fileToShare.name}
          onClose={() => {
            setIsShareModalOpen(false);
            setFileToShare(null);
          }}
        />
      )}
    </div>
  );
};

export default FileList;
