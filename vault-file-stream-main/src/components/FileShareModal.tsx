
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shareFile } from "@/services/files";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";

interface FileShareModalProps {
  fileId: string | null;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

const expiryOptions = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "1 week" },
  { value: "14", label: "2 weeks" },
  { value: "30", label: "1 month" }
];

const FileShareModal: React.FC<FileShareModalProps> = ({
  fileId,
  fileName,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setExpiryDays("7");
      setShareLink("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileId) return;
    
    setIsLoading(true);
    
    try {
      const link = await shareFile(fileId, email, parseInt(expiryDays));
      setShareLink(link);
      
      toast({
        title: "File shared successfully",
        description: `Shared "${fileName}" with ${email}`,
      });
    } catch (error) {
      console.error("Error sharing file:", error);
      // Toast is already shown in the shareFile function
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Share File</DialogTitle>
          <DialogDescription className="text-slate-400">
            Share "{fileName}" with others via email
          </DialogDescription>
        </DialogHeader>

        {!shareLink ? (
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-white">Link Expires After</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger 
                  id="expiry" 
                  className="bg-slate-700 border-slate-600 text-white"
                >
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share File"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-700 p-3 rounded-md">
              <p className="text-xs text-slate-400 mb-1">Share Link</p>
              <div className="flex items-center">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="ml-2 text-white hover:text-purple-400"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="bg-slate-700 p-3 rounded-md">
              <p className="text-xs text-slate-400 mb-1">Details</p>
              <p className="text-sm text-white">
                <span className="font-semibold">Recipient:</span> {email}
              </p>
              <p className="text-sm text-white">
                <span className="font-semibold">Expires after:</span> {expiryOptions.find(o => o.value === expiryDays)?.label}
              </p>
            </div>
            
            <p className="text-xs text-slate-400 text-center mt-4">
              Remember to share the encryption key with the recipient separately
              for maximum security.
            </p>
            
            <DialogFooter className="pt-4">
              <Button 
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileShareModal;
