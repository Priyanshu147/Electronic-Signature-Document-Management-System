import { z } from "zod";

const uploadDocumentSchema = z.object({
    body: z.object({
        documentName: z
            .string()
            .trim()
            .min(1)
            .max(255)
    })
});
const updateDocumentSchema = z.object({
    documentName: z
        .string()
        .trim()
        .min(1)
        .max(255),
    status: z
        .enum(["Draft", "In Progress", "Completed", "Archived"])
        .optional()
});
const documentValidationSchemas = {
    uploadDocumentSchema,
    updateDocumentSchema
};

export default documentValidationSchemas;