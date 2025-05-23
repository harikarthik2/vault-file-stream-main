
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type AuthFormData = {
  email: string;
  password: string;
  fullName?: string;
};

export const signIn = async (formData: AuthFormData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast({
      title: "Login failed",
      description: error.message || "Invalid email or password. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const signUp = async (formData: AuthFormData) => {
  try {
    // Create a new user with auto-confirmation (no email verification)
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName || "",
        },
        // Skip email verification entirely
        emailRedirectTo: null,
      },
    });

    if (error) throw error;
    
    // Sign in immediately after successful registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    
    if (signInError) throw signInError;
    
    toast({
      title: "Registration successful",
      description: "Your account has been created and you are now logged in.",
    });
    
    return signInData;
  } catch (error: any) {
    toast({
      title: "Registration failed",
      description: error.message || "Unable to create account. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    toast({
      title: "Sign out failed",
      description: error.message || "There was an issue signing out.",
      variant: "destructive",
    });
    throw error;
  }
};

// New function to get a list of users for sharing files
export const getShareableUsers = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('full_name');

    if (error) throw error;
    
    return profiles || [];
  } catch (error: any) {
    toast({
      title: "Error retrieving users",
      description: error.message || "Could not load users for sharing.",
      variant: "destructive",
    });
    throw error;
  }
};
