import { Response } from "express";

import SignerRoleService from "../services/signerRole.service.js";

import { AuthRequest } from "../middlewares/authenticate.js";

import {
    clearCookies,
    getFilterParams,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../utils/helper.js";

const SignerRoleController = {
    /**
     * ===========================================================
     * create Signer Role 
     * ===========================================================
     * */
    async createSignerRole(req: AuthRequest, res: Response) {
        const { roleName, description = "" } = req.body;
        const signerRole = await SignerRoleService.createSignerRole(roleName, description);
        res.status(201).json(signerRole);
    },
    /**
     * ===========================================================
     * get all Signer Roles
     * ===========================================================
     * */
    async getSignerRoles(req: AuthRequest, res: Response) {
        const signerRoles = await SignerRoleService.getSignerRoles();
        res.status(200).json(signerRoles);
    },
    /**
     * ===========================================================
     * get Signer Role by ID
     * ===========================================================
     * */
    async getSignerRoleById(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const signerRole = await SignerRoleService.getSignerRoleById(Number(id));
        res.status(200).json(signerRole);
    },

    /**
     * ===========================================================
     * update Signer Role
     * ==========================================================
     * */
    async updateSignerRole(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { roleName, description = "" } = req.body;
        const updatedSignerRole = await SignerRoleService.updateSignerRole(
            Number(id),
            roleName,
            description
        );
        res.status(200).json(updatedSignerRole);
    },

    /**
     * ===========================================================
     * delete Signer Role
     * ==========================================================
     * */
    async deleteSignerRole(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const deletedSignerRole = await SignerRoleService.deleteSignerRole(Number(id));
        res.status(200).json(deletedSignerRole);
    }
};

export default SignerRoleController;