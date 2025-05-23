import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SecureFile, FileVersion } from "@/types/files";

export interface UploadOptions {
  encryptionMethod: "AES-256" | "AES-512" | "ChaCha20";
}

export const uploadFile = async (
  file: File, // Browser File type 
  encryptionKey: string,
  options: UploadOptions = { encryptionMethod: "AES-256" },
  onProgress?: (progress: number) => void
) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if this is an update to an existing file (same name)
    const { data: existingFiles } = await supabase
      .from('files')
      .select('id, name, storage_path, version')
      .eq('user_id', user.id)
      .eq('name', file.name);
    
    const isUpdate = existingFiles && existingFiles.length > 0;
    let version = 1;
    let previousVersionId = null;
    
    if (isUpdate) {
      // This is an update, increment the version
      version = (existingFiles[0].version || 1) + 1;
      previousVersionId = existingFiles[0].id;
    }

    // Create a folder structure using user ID for storage
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    
    // Upload file to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('secure_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Now create the file record in the database
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert([
        {
          name: file.name,
          size: formatFileSize(file.size), // Fix number to string conversion
          type: file.type || file.name.split('.').pop() || '',
          storage_path: filePath,
          user_id: user.id,
          is_encrypted: true,
          version: version,
          encryption_method: options.encryptionMethod,
          previous_version_id: previousVersionId
        }
      ])
      .select()
      .single();

    if (fileError) throw fileError;
    
    // If this is an update, create a version record
    if (isUpdate && previousVersionId) {
      // Create a version history record
      const { error: versionError } = await supabase
        .from('file_versions')
        .insert([
          {
            file_id: fileRecord.id,
            version: version,
            previous_version_id: previousVersionId
          }
        ]);
      
      if (versionError) {
        console.error("Error creating version record:", versionError);
        // Continue anyway as this is not critical
      }
    }
    
    return fileRecord;
  } catch (error: any) {
    toast({
      title: "Upload failed",
      description: error.message || "There was an error uploading your file.",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadFile = async (fileId: string, encryptionKey: string) => {
  try {
    // First get the file record
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Download the file from storage
    const { data, error: downloadError } = await supabase.storage
      .from('secure_files')
      .download(fileRecord.storage_path);

    if (downloadError) throw downloadError;

    // Create download URL
    const url = URL.createObjectURL(data);
    
    // Create anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileRecord.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error: any) {
    toast({
      title: "Download failed",
      description: error.message || "There was an error downloading your file.",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadFileVersion = async (fileId: string, versionId: string, encryptionKey: string) => {
  try {
    // Get the version record
    const { data: versionRecord, error: versionError } = await supabase
      .from('file_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError) throw versionError;
    
    // Get the file record for the previous version
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', versionRecord.previous_version_id)
      .single();

    if (fileError) throw fileError;

    // Download the file from storage
    const { data, error: downloadError } = await supabase.storage
      .from('secure_files')
      .download(fileRecord.storage_path);

    if (downloadError) throw downloadError;

    // Extract version info for the filename
    const fileName = fileRecord.name;
    const fileExt = fileName.includes('.') ? fileName.split('.').pop() : '';
    const baseFileName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
    const versionFileName = `${baseFileName}_v${versionRecord.version}.${fileExt}`;
    
    // Create download URL
    const url = URL.createObjectURL(data);
    
    // Create anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = versionFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error: any) {
    toast({
      title: "Version download failed",
      description: error.message || "There was an error downloading this version.",
      variant: "destructive",
    });
    throw error;
  }
};

export const viewFile = async (fileId: string, encryptionKey: string) => {
  try {
    // First get the file record
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Download the file from storage
    const { data, error: downloadError } = await supabase.storage
      .from('secure_files')
      .download(fileRecord.storage_path);

    if (downloadError) throw downloadError;

    // Create view URL
    const url = URL.createObjectURL(data);
    
    return {
      url,
      name: fileRecord.name,
      type: fileRecord.type
    };
  } catch (error: any) {
    toast({
      title: "View failed",
      description: error.message || "There was an error viewing your file.",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    // First get the file record to get the storage path
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('secure_files')
      .remove([fileRecord.storage_path]);

    if (storageError) throw storageError;

    // Delete database record
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error: any) {
    toast({
      title: "Delete failed",
      description: error.message || "There was an error deleting your file.",
      variant: "destructive",
    });
    throw error;
  }
};

export const shareFile = async (fileId: string, recipientEmail: string, expiresInDays: number = 7) => {
  try {
    // Get the file record
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('name')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create a share link record
    const { data: shareRecord, error: shareError } = await supabase
      .from('file_shares')
      .insert([
        {
          file_id: fileId,
          recipient_email: recipientEmail,
          expires_at: expiresAt.toISOString(),
          share_token: generateShareToken(),
        }
      ])
      .select()
      .single();

    if (shareError) throw shareError;

    // Generate share link
    const shareLink = `${window.location.origin}/shared/${shareRecord.share_token}`;
    
    // In a real app, you would send an email to the recipient with the link
    console.log(`Share link for ${fileRecord.name}: ${shareLink}`);
    console.log(`Email would be sent to: ${recipientEmail}`);
    
    // Return the share link
    return shareLink;
  } catch (error: any) {
    toast({
      title: "Share failed",
      description: error.message || "There was an error sharing your file.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getUserFiles = async (): Promise<SecureFile[]> => {
  try {
    // Get all files
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert files to our SecureFile type
    const typedFiles = files as unknown as SecureFile[];
    
    // Get file versions for each file
    const fileIds = typedFiles.map(file => file.id);
    
    if (fileIds.length > 0) {
      const { data: versions, error: versionsError } = await supabase
        .from('file_versions')
        .select('*')
        .in('file_id', fileIds);
  
      if (!versionsError && versions) {
        // Attach versions to their respective files
        typedFiles.forEach(file => {
          file.versions = (versions as unknown as FileVersion[]).filter(v => v.file_id === file.id);
        });
      }
    }

    return typedFiles;
  } catch (error: any) {
    toast({
      title: "Error loading files",
      description: error.message || "There was an error loading your files.",
      variant: "destructive",
    });
    throw error;
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

// Helper function to generate a random share token
const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
