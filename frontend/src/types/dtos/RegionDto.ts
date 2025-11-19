import {CountryDto} from "./CountryDto.ts";

export interface RegionSummaryDto {
    id: string;
    code: string;        // ISO 3166-2, z.B. "DE-BY"
    nameDe: string;
    nameEn?: string | null;
    adminLevel: number;  // 1 = Bundesland/Kanton/State
}

export interface RegionDto extends RegionSummaryDto {
    countryCode: string; // == Country.code
    country?: CountryDto;
}

export type RegionOptionDto  = { value: string; label: string; countryCode: string; code: string };
