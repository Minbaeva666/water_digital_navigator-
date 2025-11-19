import { AccountState, Role, SalutationType } from "../constants/enums.ts";
import { OrganizationFullDto, OrganizationMinimalDto } from "./Organization.dto.ts";
import {DigitalSolutionDto} from "./DigitalSolutionDto.ts";

export interface UserBaseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    salutationType: SalutationType;
    title?: string;
    phonenumber?: string;
    role: Role;
    accountState: AccountState;
    emailVerifiedAt?: string;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    organizationId?: string;
}

export type UserMinimalDto = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    organizationId: string | null;
    organizationName: string | null;
};

export interface UserWithOrganizationDto extends UserBaseDto {
    organization?: OrganizationMinimalDto;
}

export interface UserWithDigitalSolutionsDto extends UserBaseDto {
    digitalSolutions?: DigitalSolutionDto[];
}

export interface  UserFullDto extends UserBaseDto {
    organization?: OrganizationFullDto;
    digitalSolutions?: DigitalSolutionDto[];
}

export interface UserFormValues {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    salutationType?: SalutationType;
    role: Role;
    accountState: AccountState;
    title?: string;
    phonenumber?: string;
    organizationId?: string;
}