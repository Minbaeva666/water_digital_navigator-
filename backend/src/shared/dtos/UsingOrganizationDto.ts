import {OrganizationType} from "../constants/enums";
import {AccountState} from "../constants/enums";
import type { User, Organization } from "@prisma/client";


export interface UsingOrganizationDto {
    id: string;
    name: string;
    accountState: AccountState;
    organizationType: OrganizationType;
    zip: string;
    population: number;
    digitalSolutionId: string;
}

