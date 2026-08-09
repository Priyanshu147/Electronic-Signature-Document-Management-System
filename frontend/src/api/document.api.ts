import api from "./axios";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type {
  DocumentDetail,
  DocumentListResponse,
  GetDocumentsParams,
  SaveSignatureFieldsRequest,
  SignatureFieldItem,
} from "../types/document.types";

export const documentApi = {
  getDocuments: async (params?: GetDocumentsParams): Promise<DocumentListResponse> => {
    const response = await api.get<DocumentListResponse>(ENDPOINTS.DOCUMENT.DOCUMENTS, {
      params,
    });
    return response.data;
  },

  getDocumentById: async (id: number): Promise<{ success: boolean; data: DocumentDetail }> => {
    const response = await api.get<{ success: boolean; data: DocumentDetail }>(
      ENDPOINTS.DOCUMENT.BY_ID(id)
    );
    return response.data;
  },

  uploadDocument: async (
    file: File,
    documentName: string
  ): Promise<{ success: boolean; message: string; data: Partial<DocumentDetail> }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentName", documentName);

    const response = await api.post(ENDPOINTS.DOCUMENT.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateDocument: async (
    id: number,
    documentName: string,
    status?: string
  ): Promise<{ success: boolean; data: { success: boolean } }> => {
    const response = await api.put(ENDPOINTS.DOCUMENT.BY_ID(id), { documentName, status });
    return response.data;
  },

  deleteDocument: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(ENDPOINTS.DOCUMENT.BY_ID(id));
    return response.data;
  },

  downloadDocument: async (id: number, raw: boolean = false): Promise<Blob> => {
    const response = await api.get(ENDPOINTS.DOCUMENT.DOWNLOAD(id), {
      params: raw ? { raw: "true" } : undefined,
      responseType: "blob",
    });
    return response.data;
  },

  getSignatureFields: async (
    documentId: number
  ): Promise<{ success: boolean; data: SignatureFieldItem[] }> => {
    const response = await api.get<{ success: boolean; data: SignatureFieldItem[] }>(
      ENDPOINTS.DOCUMENT.SIGNATURE_FIELDS(documentId)
    );
    return response.data;
  },

  saveSignatureFields: async (
    documentId: number,
    payload: SaveSignatureFieldsRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(
      ENDPOINTS.DOCUMENT.SIGNATURE_FIELDS(documentId),
      payload
    );
    return response.data;
  },
};
