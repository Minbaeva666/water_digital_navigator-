import {RegionSummaryDto} from "./RegionDto.ts";

export interface CountryDto {
    code: string;        // ISO 3166-1 alpha-2, z.B. "DE"
    nameDe: string;
    nameEn?: string | null;
}

export interface CountryWithRegionsDto extends CountryDto {
    regions: RegionSummaryDto[];
}

export type CountryOptionDto = { value: string; label: string };