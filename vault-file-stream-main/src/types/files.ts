
export interface FileVersion {
  id: string;
  file_id: string;
  version: number;
  previous_version_id: string | null;
  created_at: string;
}

export interface SecureFile {
  id: string;
  name: string;
  size: string;
  type: string;
  storage_path: string;
  user_id: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  encryption_method: string | null;
  previous_version_id: string | null;
  versions?: FileVersion[]; // Add this property to store versions
}

export interface FileShare {
  id: string;
  file_id: string;
  share_token: string;
  recipient_email: string | null;
  created_at: string;
  expires_at: string;
  accessed_at: string | null;
}
