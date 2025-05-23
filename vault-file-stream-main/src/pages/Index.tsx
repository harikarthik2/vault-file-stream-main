
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock, Share2, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl font-bold mb-6">Secure File Sharing</h1>
            <h2 className="text-3xl mb-8 text-purple-400">End-to-End Encrypted & Decentralized</h2>
            <p className="text-lg mb-8 text-gray-300">
              Share your files securely with end-to-end encryption. Only the people you choose
              can decrypt and access your files with the encryption keys you provide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate("/register")}
              >
                Register Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-600 text-purple-600 hover:bg-purple-900/20"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/placeholder.svg" 
              alt="Secure File Sharing" 
              className="rounded-lg shadow-2xl" 
              width="600"
              height="400"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group hover:bg-slate-600 transition-all duration-300">
              <div className="absolute -right-4 -top-4 bg-purple-600/20 w-24 h-24 rounded-full"></div>
              <div className="h-14 w-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload & Encrypt</h3>
              <p className="text-gray-300">Upload your files and encrypt them with a secure key that only you control.</p>
            </div>
            
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group hover:bg-slate-600 transition-all duration-300">
              <div className="absolute -right-4 -top-4 bg-purple-600/20 w-24 h-24 rounded-full"></div>
              <div className="h-14 w-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Share Access</h3>
              <p className="text-gray-300">Share your encryption key securely with only the people you want to have access.</p>
            </div>
            
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group hover:bg-slate-600 transition-all duration-300">
              <div className="absolute -right-4 -top-4 bg-purple-600/20 w-24 h-24 rounded-full"></div>
              <div className="h-14 w-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Access Anywhere</h3>
              <p className="text-gray-300">Access your files from any device with your encryption key.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Section: Benefits */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Our Platform</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-slate-700/50 p-6 rounded-lg border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300">
            <div className="text-purple-400 mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
            <p className="text-gray-300">Your files are encrypted before they leave your device, ensuring maximum security.</p>
          </div>
          
          <div className="bg-slate-700/50 p-6 rounded-lg border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300">
            <div className="text-purple-400 mb-4">
              <Share2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Sharing</h3>
            <p className="text-gray-300">Share files with confidence using time-limited secure links and access controls.</p>
          </div>
          
          <div className="bg-slate-700/50 p-6 rounded-lg border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300">
            <div className="text-purple-400 mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Version History</h3>
            <p className="text-gray-300">Access previous versions of your files with our built-in version control system.</p>
          </div>
          
          <div className="bg-slate-700/50 p-6 rounded-lg border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300">
            <div className="text-purple-400 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zero-Knowledge Architecture</h3>
            <p className="text-gray-300">We never see your encryption keys or unencrypted files, ensuring your privacy.</p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to secure your files?</h2>
          <p className="text-xl mb-8 text-gray-300">Join thousands of users who trust our platform for secure file sharing.</p>
          <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-8 rounded-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Start your secure journey today</h3>
            <Button 
              size="lg" 
              className="bg-white text-purple-800 hover:bg-gray-200"
              onClick={() => navigate("/register")}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
