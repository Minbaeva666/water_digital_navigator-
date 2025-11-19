export interface MunicipalityProfileDto {
    /** Gleiche ID wie Organization.id (1:1-Relation) */
    organizationId: string;
    /** Einwohnerzahl (≥ 0) */
    population: number;
}