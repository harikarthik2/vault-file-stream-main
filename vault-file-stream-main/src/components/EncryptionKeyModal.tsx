
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import EncryptionOptions, { EncryptionMethod } from "./EncryptionOptions";

interface EncryptionKeyModalProps {
  isOpen: boolean;
  fileName: string;
  onSubmit: (encryptionKey: string, method: EncryptionMethod) => void;
  onCancel: () => void;
  isUploading: boolean;
}

const EncryptionKeyModal: React.FC<EncryptionKeyModalProps> = ({
  isOpen,
  fileName,
  onSubmit,
  onCancel,
  isUploading
}) => {
  const [encryptionKey, setEncryptionKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [encryptionMethod, setEncryptionMethod] = useState<EncryptionMethod>("AES-256");
  const [error, setError] = useState("");
  
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncryptionKey(e.target.value);
    
    // Clear error when typing
    if (error) setError("");
  };
  
  const handleConfirmKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmKey(e.target.value);
    
    // Clear error when typing
    if (error) setError("");
  };
  
  const handleSubmit = () => {
    // Validate encryption key
    if (!encryptionKey) {
      setError("Encryption key is required");
      return;
    }
    
    // Check if keys match
    if (encryptionKey !== confirmKey) {
      setError("Encryption keys do not match");
      return;
    }
    
    // If remember key is enabled, you would store it securely
    if (rememberKey) {
      // In a real app, you'd store this securely
      console.log("Remembering encryption key for future use");
      // For demo purposes, we could store in localStorage (not secure for production)
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastEncryptionKey', encryptionKey);
        localStorage.setItem('lastEncryptionMethod', encryptionMethod);
      }
    }
    
    onSubmit(encryptionKey, encryptionMethod);
    
    // Reset form
    setEncryptionKey("");
    setConfirmKey("");
    setRememberKey(false);
    setShowKey(false);
    setError("");
    setEncryptionMethod("AES-256");
  };
  
  const handleCancel = () => {
    // Reset form
    setEncryptionKey("");
    setConfirmKey("");
    setRememberKey(false);
    setShowKey(false);
    setError("");
    setEncryptionMethod("AES-256");
    
    onCancel();
  };
  
  const generateRandomKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const keyLength = 16;
    let result = '';
    
    for (let i = 0; i < keyLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Update both fields and clear any errors
    setEncryptionKey(result);
    setConfirmKey(result);
    setError("");
    
    // Automatically show the generated key
    setShowKey(true);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Set Encryption Key</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create an encryption key for "{fileName}". You'll need this key to decrypt the file later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="encryption-key" className="text-white">Encryption Key</Label>
            <div className="relative">
              <Input 
                id="encryption-key"
                type={showKey ? "text" : "password"}
                placeholder="Create a strong encryption key"
                value={encryptionKey}
                onChange={handleKeyChange}
                className="bg-slate-700 border-slate-600 text-white pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirm-key" className="text-white">Confirm Key</Label>
            <Input 
              id="confirm-key"
              type={showKey ? "text" : "password"}
              placeholder="Confirm encryption key"
              value={confirmKey}
              onChange={handleConfirmKeyChange}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          {/* New encryption method options */}
          <EncryptionOptions 
            value={encryptionMethod}
            onChange={setEncryptionMethod}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-key"
                type="checkbox"
                checked={rememberKey}
                onChange={() => setRememberKey(!rememberKey)}
                className="h-4 w-4 text-purple-600 bg-slate-700 border-slate-600 rounded"
              />
              <Label htmlFor="remember-key" className="text-sm text-slate-300 ml-2">
                Remember this key for future uploads
              </Label>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateRandomKey}
              className="text-purple-400 border-purple-400/20 hover:bg-purple-400/10"
              size="sm"
            >
              Generate Random
            </Button>
          </div>
          
          {error && (
            <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Encrypting & Uploading..." : "Encrypt & Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionKeyModal;
