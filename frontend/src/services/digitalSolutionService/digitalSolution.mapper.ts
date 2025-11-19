import {DigitalSolutionFormValues} from "../../forms/digital-solution/DigitalSolutionFormValues.ts";

export const EMPTY_DIGITAL_SOLUTION_FORM: DigitalSolutionFormValues = {
    id: undefined,
    name: "",
    link: "",
    maturityDegree: undefined,
    offeringCategory: undefined,
    shortDescription: "",
    longDescription: "",
    goalDescription: "",
    technicalDescription: "",
    efficiencyDescription: "",
    processDescription: "",
    socialRelevanceDescription: "",

    solutionPresentedByUser: undefined,

    organizationId: undefined,
    hasAcceptedTerms: false,
    hasAcceptedPrivacyPolicy: false,
    state: undefined,

    //Dates
    readyForOperation: undefined,
    createdAt: undefined,


    //Ids
    projectPartnerIds: [],
    solutionUserIds: [],
    userId: undefined,
    taxonomyNodeIds: [],
    taxonomySelections: {},
    presentedByUserId: "",

    //Images
    titleImage: [],
    detailImages: [],

    // Relationen
    user: undefined,
    presentedByUser: undefined,
    organization: undefined,
    projectPartners: undefined,
    solutionUsers: undefined
};
