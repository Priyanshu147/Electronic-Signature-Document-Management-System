import {z} from "zod";

const createSignerRoleSchema = z.object({
    roleName: z.string().min(1, "Name is required"),
    description: z.string().optional(),
   
});

const updateSignerRoleSchema = z.object({
    roleName: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
});

const signerRoleValidationSchemas = {
    createSignerRoleSchema,
    updateSignerRoleSchema,
};

export default signerRoleValidationSchemas;