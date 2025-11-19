import { AccountState, Role, SalutationType } from "../constants/enums";
import { OrganizationFullDto, OrganizationMinimalDto } from "./Organization.dto";
import { DigitalSolutionMinimalDto } from "./DigitalSolutionDto";

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

export interface UserMinimalDto extends UserBaseDto {
    digitalSolutionIds: string[];
}

export interface UserWithOrganizationDto extends UserBaseDto {
    organization?: OrganizationMinimalDto;
}

export interface UserWithDigitalSolutionsDto extends UserBaseDto {
    digitalSolutions?: DigitalSolutionMinimalDto[];
}

export interface UserFullDto extends UserBaseDto {
    organization?: OrganizationFullDto;
    digitalSolutions?: DigitalSolutionMinimalDto[];
}

export interface UserFormValues {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    salutationType: SalutationType | "";
    role: Role | "";
    accountState: AccountState | "";
    title?: string;
    phonenumber?: string;
    organizationId: string | "";
}
