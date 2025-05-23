
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type EncryptionMethod = "AES-256" | "AES-512" | "ChaCha20";

interface EncryptionOptionsProps {
  value: EncryptionMethod;
  onChange: (value: EncryptionMethod) => void;
}

const EncryptionOptions: React.FC<EncryptionOptionsProps> = ({ value, onChange }) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center">
        <Label className="text-white font-medium">Encryption Algorithm</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon size={16} className="ml-2 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white max-w-xs">
              <p>Choose the encryption algorithm for securing your files. Stronger algorithms provide better security but may take longer to process.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <RadioGroup 
        value={value} 
        onValueChange={(val) => onChange(val as EncryptionMethod)}
        className="grid gap-2"
      >
        <div className="flex items-center space-x-2 bg-slate-700/40 p-3 rounded-md">
          <RadioGroupItem value="AES-256" id="aes-256" className="border-slate-500" />
          <Label htmlFor="aes-256" className="text-white font-medium">AES-256 (Standard)</Label>
          <span className="text-xs text-slate-400 ml-auto">Fast, widely used</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-700/40 p-3 rounded-md">
          <RadioGroupItem value="AES-512" id="aes-512" className="border-slate-500" />
          <Label htmlFor="aes-512" className="text-white font-medium">AES-512 (Advanced)</Label>
          <span className="text-xs text-slate-400 ml-auto">Stronger, moderate speed</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-700/40 p-3 rounded-md">
          <RadioGroupItem value="ChaCha20" id="chacha20" className="border-slate-500" />
          <Label htmlFor="chacha20" className="text-white font-medium">ChaCha20-Poly1305</Label>
          <span className="text-xs text-slate-400 ml-auto">High security, slower</span>
        </div>
      </RadioGroup>
      
      <p className="text-xs text-slate-400 mt-1">
        All methods provide strong security. Choose based on your needs.
      </p>
    </div>
  );
};

export default EncryptionOptions;
