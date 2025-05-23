
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileList from "@/components/FileList";
import EncryptionKeyModal from "@/components/EncryptionKeyModal";
import { 
  Upload, 
  Search, 
  Settings, 
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/contexts/AuthContext";
import { getUserFiles, uploadFile, downloadFile, downloadFileVersion, deleteFile } from "@/services/files";
import { signOut } from "@/services/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EncryptionMethod } from "@/components/EncryptionOptions";
import { SecureFile } from "@/types/files";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewFile, setViewFile] = useState<{ url: string; name: string } | null>(null);

  // Fetch files
  const { data: files = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ["files"],
    queryFn: getUserFiles,
    enabled: !!user
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: ({file, encryptionKey, encryptionMethod}: {
      file: File, 
      encryptionKey: string, 
      encryptionMethod: EncryptionMethod
    }) => 
      uploadFile(file, encryptionKey, { encryptionMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setIsEncryptionModalOpen(false);
      setSelectedFile(null);
      toast({
        title: "File uploaded",
        description: `Your file has been encrypted and uploaded successfully.`
      });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully."
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsEncryptionModalOpen(true);
    }
  };
  
  const handleUpload = async (encryptionKey: string, encryptionMethod: EncryptionMethod) => {
    if (!selectedFile) return;
    
    uploadFileMutation.mutate({ 
      file: selectedFile, 
      encryptionKey, 
      encryptionMethod 
    });
  };
  
  const handleCancelUpload = () => {
    setIsEncryptionModalOpen(false);
    setSelectedFile(null);
  };

  const handleDownload = (fileId: string, encryptionKey: string) => {
    downloadFile(fileId, encryptionKey)
      .then(() => {
        toast({
          title: "File downloaded",
          description: "The file has been decrypted and downloaded successfully."
        });
      })
      .catch(error => console.error("Download failed:", error));
  };

  const handleVersionDownload = (fileId: string, versionId: string, encryptionKey: string) => {
    downloadFileVersion(fileId, versionId, encryptionKey)
      .then(() => {
        toast({
          title: "Version downloaded",
          description: "The file version has been decrypted and downloaded successfully."
        });
      })
      .catch(error => console.error("Version download failed:", error));
  };

  const handleViewFile = async (fileId: string, encryptionKey: string) => {
    try {
      // For demonstration - in a real app, this would need to fetch and decrypt the file
      toast({
        title: "File view requested",
        description: "This feature is coming soon. Your file would be displayed securely."
      });
      
      // In a real implementation, you would:
      // 1. Download and decrypt the file
      // 2. Create a blob URL for viewing
      // 3. Set it to viewFile state to display in the modal
    } catch (error) {
      console.error("View file failed:", error);
      toast({
        title: "View failed",
        description: "There was an error viewing the file.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">SecureShare</h1>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:text-white"
              onClick={() => navigate("/profile")}
            >
              <User size={18} className="mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:text-white"
              onClick={() => navigate("/settings")}
            >
              <Settings size={18} className="mr-2" />
              Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">My Files</h2>
            <p className="text-slate-400">Manage your encrypted files securely</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                className="pl-9 bg-slate-800 border-slate-700 text-white w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2 cursor-pointer"
              >
                <Upload size={18} className="mr-2" />
                Upload File
              </Label>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {isLoadingFiles ? (
            <div className="flex justify-center items-center p-12">
              <div className="text-white">Loading your files...</div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-slate-400 mb-4">No files found</p>
              <p className="text-slate-500 text-sm">
                {searchQuery ? "Try adjusting your search" : "Upload your first encrypted file"}
              </p>
            </div>
          ) : (
            <FileList 
              files={filteredFiles.map(file => ({
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                date: new Date(file.created_at).toISOString().split('T')[0],
                version: file.version,
                versions: file.versions
              }))} 
              onDownload={handleDownload}
              onView={handleViewFile}
              onDelete={(fileId) => deleteFileMutation.mutate(fileId)}
              onVersionDownload={handleVersionDownload}
            />
          )}
        </div>
      </main>
      
      <EncryptionKeyModal
        isOpen={isEncryptionModalOpen}
        fileName={selectedFile?.name || ""}
        onSubmit={handleUpload}
        onCancel={handleCancelUpload}
        isUploading={uploadFileMutation.isPending}
      />
      
      {/* File Viewer Modal */}
      {viewFile && (
        <Dialog open={!!viewFile} onOpenChange={() => setViewFile(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">{viewFile.name}</h2>
              <div className="bg-slate-700 rounded p-2 h-[70vh] overflow-auto">
                <iframe 
                  src={viewFile.url} 
                  className="w-full h-full border-0" 
                  title={viewFile.name}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default withAuth(Dashboard);
