import {UserBaseDto} from "./User.dto.ts";

export interface ImprintStatementDto {
    id: string;
    content: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    updatedBy?: UserBaseDto | null;
}