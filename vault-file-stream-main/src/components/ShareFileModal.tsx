
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Send } from "lucide-react";
import { shareFile } from "@/services/files";

interface ShareFileModalProps {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
}

const ShareFileModal: React.FC<ShareFileModalProps> = ({
  isOpen,
  fileId,
  fileName,
  onClose
}) => {
  const [email, setEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSharing(true);
    try {
      const link = await shareFile(fileId, email, parseInt(expiresInDays));
      setShareLink(link);
      toast({
        title: "File shared",
        description: `Share link for "${fileName}" has been created and sent to ${email}`
      });
    } catch (error: any) {
      toast({
        title: "Sharing failed",
        description: error.message || "There was an error sharing your file.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copied",
        description: "The share link has been copied to your clipboard."
      });
    }
  };
  
  const handleClose = () => {
    setEmail("");
    setExpiresInDays("7");
    setShareLink(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Share "{fileName}"</DialogTitle>
          <DialogDescription className="text-slate-400">
            Share your encrypted file securely with others via email
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient-email" className="text-white">Recipient Email</Label>
            <Input 
              id="recipient-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={!!shareLink}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="expires" className="text-white">Link Expires In</Label>
            <select 
              id="expires"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white rounded p-2"
              disabled={!!shareLink}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          
          {shareLink && (
            <div className="mt-4 p-2 bg-slate-900 border border-slate-600 rounded">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm truncate mr-2">{shareLink}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!shareLink ? (
            <Button 
              onClick={handleShare} 
              disabled={isSharing || !email}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send size={16} className="mr-2" />
              {isSharing ? "Sending..." : "Share File"}
            </Button>
          ) : (
            <Button onClick={handleCopyLink}>
              <Copy size={16} className="mr-2" />
              Copy Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFileModal;
