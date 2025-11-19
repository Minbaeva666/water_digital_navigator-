import { OrganizationType } from "../constants/enums";
import { UserMinimalDto } from "./User.dto";
import { DigitalSolutionMinimalDto } from "./DigitalSolutionDto";

// Basis-DTO ohne Relations
export interface OrganizationBaseDto {
    id: string;
    email: string;
    name: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    organizationType: OrganizationType;
    website: string;
    createdAt: string;
    updatedAt: string;
    logoMimeType?: string;
    logo?: Uint8Array;
    logoFilename?: string;
}

// Minimal-DTO liefert nur Zählwerte
export interface OrganizationMinimalDto extends OrganizationBaseDto {
    usersCount: number;
    digitalSolutionsOwnedCount: number;
    projectPartnerSolutionsCount: number;
    solutionUserSolutionsCount: number;
}

// Full DTO mit den tatsächlich geladenen Relationen
export interface OrganizationWithRelationsDto extends OrganizationBaseDto {
    users: UserMinimalDto[];
    digitalSolutionsOwned: DigitalSolutionMinimalDto[];
    projectPartnerSolutions: DigitalSolutionMinimalDto[];
    solutionUserSolutions: DigitalSolutionMinimalDto[];
}

export type OrganizationFullDto = OrganizationWithRelationsDto;