export type DocumentStatus = "Draft" | "In Progress" | "Completed" | "Archived";

export interface DocumentItem {
  id: number;
  document_name: string;
  original_file_name: string;
  file_size: number;
  page_count: number;
  status: DocumentStatus;
  created_at: string;
  uploaded_by: string;
  number_of_signers: number;
}

export interface DocumentDetail {
  id: number;
  uploaded_by: number;
  document_name: string;
  original_file_name: string;
  stored_file_name: string;
  file_path: string;
  file_size: number;
  page_count: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DocumentListPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface DocumentListResponse {
  success: boolean;
  documents: DocumentItem[];
  pagination: DocumentListPagination;
}

export interface SignatureFieldItem {
  id?: number;
  page_number: number;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  required: boolean;
  signer_role_id: number;
  role_name?: string;
}

export interface SaveSignatureFieldPayload {
  signerRoleId: number;
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  required: boolean;
}

export interface SaveSignatureFieldsRequest {
  fields: SaveSignatureFieldPayload[];
}
