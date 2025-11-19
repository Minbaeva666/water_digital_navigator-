import {OrganizationState, OrganizationType} from "../constants/enums.ts";
import { UserMinimalDto } from "./User.dto.ts";
import {UploadFile} from "antd";
import {DigitalSolutionDto} from "./DigitalSolutionDto.ts";
import {RegionDto} from "./RegionDto.ts";
import {CountryDto} from "./CountryDto.ts";
import {MunicipalityProfileDto} from "./municipalityProfile.ts";

// Basis-DTO ohne Relations
export interface OrganizationBaseDto {
    id: string;
    email: string;
    name: string;
    street: string;
    zip: string;
    city: string;
    countryId: string;
    region?: RegionDto | null;
    country?: CountryDto | null;
    regionId: string;
    organizationType: OrganizationType;
    organizationState: OrganizationState;
    municipalityProfile: MunicipalityProfileDto;
    website: string;
    createdAt: string;
    updatedAt: string;
    logoMimeType?: string;
    logoBase64?: string
    logoFilename?: string;
    lat?: number;
    lon?: number;
    manualCoords?: boolean
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
    digitalSolutionsOwned: DigitalSolutionDto[];
    projectPartnerSolutions: DigitalSolutionDto[];
    solutionUserSolutions: DigitalSolutionDto[];
}

export type OrganizationFullDto = OrganizationWithRelationsDto;


export interface OrganizationFormValues {
    id?: string;
    email: string;
    name: string;
    street: string;
    zip: string;
    city: string;
    regionId?: string | null;
    region?: RegionDto | null;
    countryCode: string;
    lat?: number | null;
    lon?: number | null;
    organizationType: OrganizationType | "";
    organizationState: OrganizationState | undefined;
    municipalityProfile?: MunicipalityProfileDto | null;
    website: string;
    users?: UserMinimalDto[];
    logoMimeType?: string;
    logoBase64?: UploadFile[];
    logoFilename?: string;
    population?: number | null;
    manualCoords?: boolean
}
