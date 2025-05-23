
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Lock, Shield, ArrowLeft } from "lucide-react";

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  created_at: string;
  file_id: string;
  recipient_email: string;
  expires_at: string;
}

const SharedFile = () => {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!token) return;
      
      try {
        // Get share record
        const { data: shareData, error: shareError } = await supabase
          .from('file_shares')
          .select('*, files(*)')
          .eq('share_token', token)
          .single();
        
        if (shareError) throw shareError;
        
        // Update accessed_at timestamp
        await supabase
          .from('file_shares')
          .update({ accessed_at: new Date().toISOString() })
          .eq('share_token', token);
        
        // Check if link is expired
        const expiresAt = new Date(shareData.expires_at);
        const now = new Date();
        if (expiresAt < now) {
          setIsExpired(true);
        } else {
          setFile({
            id: shareData.id,
            name: shareData.files.name,
            size: shareData.files.size,
            type: shareData.files.type,
            created_at: shareData.files.created_at,
            file_id: shareData.file_id,
            recipient_email: shareData.recipient_email,
            expires_at: shareData.expires_at
          });
        }
      } catch (error) {
        console.error("Error fetching shared file:", error);
        toast({
          title: "Error loading file",
          description: "The shared link is invalid or has been removed.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedFile();
  }, [token]);

  const handleDownload = async () => {
    if (!file || !encryptionKey) return;
    
    setIsDownloading(true);
    
    try {
      // Download the file from storage
      const { data: fileRecord } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', file.file_id)
        .single();
      
      const { data, error } = await supabase.storage
        .from('secure_files')
        .download(fileRecord.storage_path);
        
      if (error) throw error;
      
      // Create download URL
      const url = URL.createObjectURL(data);
      
      // Create anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `${file.name} is being downloaded.`
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading this file.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl text-white">Loading shared file...</h3>
        </div>
      </div>
    );
  }
  
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex h-14 w-14 rounded-full bg-red-900/20 items-center justify-center mb-6">
            <Lock className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Link Expired</h2>
          <p className="text-slate-400 mb-6">
            This shared file link has expired and is no longer available.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!file) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex h-14 w-14 rounded-full bg-red-900/20 items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">File Not Found</h2>
          <p className="text-slate-400 mb-6">
            The shared file you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="container mx-auto p-4 md:p-6">
        <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </header>
      
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-slate-700 p-6">
              <h1 className="text-2xl font-bold text-white">Shared File</h1>
              <p className="text-slate-300 mt-1">Secure access to shared content</p>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-white text-lg mb-2">{file.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <p className="text-slate-300">
                    <span className="text-slate-400">Type:</span> {file.type}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Size:</span> {file.size}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="decryptionKey" className="text-white">Enter Encryption Key</Label>
                  <p className="text-xs text-slate-400 mb-2">
                    You need the encryption key from the person who shared this file with you.
                  </p>
                  <Input
                    id="decryptionKey"
                    type="text"
                    placeholder="Enter the encryption key"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <Button
                  onClick={handleDownload}
                  disabled={!encryptionKey || isDownloading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-slate-400">
                    This link expires on {new Date(file.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedFile;
