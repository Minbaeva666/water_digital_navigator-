export enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR"
}

export enum Country {
    GERMANY = "GERMANY",
    AUSTRIA = "AUSTRIA",
    SWITZERLAND = "SWITZERLAND",
    DENMARK = "DENMARK",
    POLAND = "POLAND",
    CZECH_REPUBLIC = "CZECH_REPUBLIC",
    FRANCE = "FRANCE",
    LUXEMBOURG = "LUXEMBOURG",
    BELGIUM = "BELGIUM",
    NETHERLANDS = "NETHERLANDS"
}

export enum PublishedByType {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    WEB = "WEB",
    PUBLICATION = "PUBLICATION",
}

export enum OrganizationState {
    FULL = "FULL",
    LITE = "LITE",
    REQUESTED = "REQUESTED",
}

export enum AccountState {
    VERIFY_EMAIL = "VERIFY_EMAIL",
    REGISTERED = "REGISTERED",
    REGISTRATION_REVOKED = "REGISTRATION_REVOKED"
}

export enum DigitalSolutionState {
    REQUESTED = "REQUESTED",
    ACTIVATED = "ACTIVATED",
    DEACTIVATED = "DEACTIVATED",
    DRAFT = "DRAFT"
}

export enum PresentedBy {
    USER = "USER",
    ORGANIZATION = "ORGANIZATION",
}

export enum SalutationType {
    MR = "MR",
    MS = "MS",
    MX = "MX",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

export const salutationLabels: Record<SalutationType, string> = {
    [SalutationType.MR]: 'Herr',
    [SalutationType.MS]: 'Frau',
    [SalutationType.MX]: 'Divers',
    [SalutationType.PREFER_NOT_TO_SAY]: 'Keine Angabe',
};

export enum OrganizationType {
    INDUSTRY = "INDUSTRY", //Industrie
    CRAFT = "CRAFT", //Handwerk
    STARTUP = "STARTUP", //Start-Up
    COLLEGE_UNIVERSITY = "COLLEGE_UNIVERSITY", //Hochschule
    RESEARCH_INSTITUTE = "RESEARCH_INSTITUTE", //außeruniversitäres Forschungsinstitut
    MUNICIPALITY = "MUNICIPALITY", //Kommune
    MUNICIPAL_ORGANIZATION = "MUNICIPAL_ORGANIZATION", //kommunale Organisation
    ASSOCIATION = "ASSOCIATION", //Verband/Verein
    SME = "SME" //KMU
}

export enum TokenType {
    REGISTRATION_SUCCESSFUL_TOKEN = "REGISTRATION_SUCCESSFUL_TOKEN",
    PASSWORD_RESET_TOKEN = "PASSWORD_RESET_TOKEN",
    EMAIL_VERIFICATION_TOKEN = "EMAIL_VERIFICATION_TOKEN",
    REVOKE_REGISTRATION_TOKEN = "REVOKE_REGISTRATION_TOKEN",
    REVOKE_REGISTRATION_SUCCESSFUL_TOKEN = "REVOKE_REGISTRATION_SUCCESSFUL_TOKEN"
}

export enum MaturityDegree {
    DEVELOPMENT_DEMONSTRATION_PHASE = "DEVELOPMENT_DEMONSTRATION_PHASE",
    IDEA_CONCEPT_STUDY = "IDEA_CONCEPT_STUDY",
    MARKET_READY_CONTINUOUS_OPERATION = "MARKET_READY_CONTINOUS_OPERATION",
    TEST_PHASE_PROTOTYPE = "TEST_PHASE_PROTOTYPE"
}

// export const developmentStateLabels: Record<DevelopmentState, string> = {
//     [DevelopmentState.DEVELOPMENT_DEMONSTRATION_PHASE]: 'Entwicklungs- / Demonstrationsphase',
//     [DevelopmentState.IDEA_CONCEPT_STUDY]: 'Idee / Konzept / Studie',
//     [DevelopmentState.MARKET_READY_CONTINUOUS_OPERATION]: 'Marktreif / Dauerbetrieb',
//     [DevelopmentState.TEST_PHASE_PROTOTYPE]: 'Testphase / Prototyp',
// };

export enum OfferingCategory {
    SERVICE = "SERVICE",
    RESEARCH = "RESEARCH",
    COMPLETE_SOLUTION = "COMPLETE_SOLUTION",
    PRODUCT = "PRODUCT",
    PROJECT = "PROJECT",
    IMPLEMENTATION_ROADMAP = "IMPLEMENTATION_ROADMAP"
}

// export const solutionCategoryLabels: Record<OfferingCategory, string> = {
//     [OfferingCategory.SERVICE]: 'Dienstleistung',
//     [OfferingCategory.RESEARCH]: 'Forschung',
//     [OfferingCategory.COMPLETE_SOLUTION]: 'Komplettlösung',
//     [OfferingCategory.PRODUCT]: 'Produkt',
//     [OfferingCategory.PROJECT]: 'Projekt',
//     [OfferingCategory.IMPLEMENTATION_ROADMAP]: 'Umsetzungsfahrplan',
// };

export enum ImageType {
    TITLE = "TITLE",
    DETAIL = "DETAIL",
}

export enum SolutionCategoryStateType {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

