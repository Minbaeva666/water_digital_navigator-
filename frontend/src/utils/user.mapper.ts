import {UserBaseDto, UserFormValues} from "../types/dtos/User.dto.ts";


export const mapUserDtoToForm = (dto: UserBaseDto): UserFormValues => ({
    id: dto.id,
    email: dto.email ?? undefined,
    firstName: dto.firstName ?? undefined,
    lastName: dto.lastName ?? undefined,
    salutationType: dto.salutationType ?? undefined,
    title: dto.title,
    phonenumber: dto.phonenumber ?? undefined,
    role: dto.role ?? undefined,
    accountState: dto.accountState ?? undefined,
    organizationId: dto.organizationId ?? undefined
});


// export function mapUserWithOrganizationDtoToFormValues(
//     dto: UserWithOrganizationDto
// ): {
//     userFormValues: UserFormValues;
//     organizationFormValues: OrganizationFormValues;
// } {
//     // 1) User-Teil übernehmen
//     const userFormValues: UserFormValues = {
//         id:              dto.id,
//         email:           dto.email,
//         firstName:       dto.firstName,
//         title:           dto.title,
//         lastName:        dto.lastName,
//         salutationType:  dto.salutationType,
//         phonenumber:     dto.phonenumber,
//         role:            dto.role,
//         organizationId:  dto.organizationId ?? null,
//     };
//
//     // 2) Organisation-Teil ableiten
//     let organizationFormValues: OrganizationFormValues = {
//         id:               null,
//         email:            "",
//         name:             "",
//         street:           "",
//         zip:              "",
//         city:             "",
//         country:          "",
//         organizationType: null,
//         website:          "",
//         logo:             null,
//     };
//
//     if (dto.organization) {
//         const org = dto.organization;
//         // Basis-Felder kopieren
//         organizationFormValues = {
//             id:               org.id ?? null,
//             email:            org.email,
//             name:             org.name,
//             street:           org.street,
//             zip:              org.zip,
//             city:             org.city,
//             country:          org.country,
//             organizationType: org.organizationType,
//             website:          org.website,
//             logo:             null, // füllen wir gleich über die Raw-Bytes
//         };
//
//         // Wenn raw-Bytes + MIME-Type kommen, in File umwandeln
//         if (org.logo && org.logoMimeType) {
//             const extension = org.logoMimeType.split("/")[1] || "png";
//             const fileName = `logo.${extension}`;
//             // convertBytesToFile erwartet: (rawData: Record<number, number> | number[], mime: string, fileName: string)
//             const logoFile: File = convertBytesToFile(org.logo, org.logoMimeType, fileName);
//
//             organizationFormValues.logo = logoFile;
//         }
//     }
//
//     return { userFormValues, organizationFormValues };
// }
//
// export function mapFormValuesToPayload(
//     userForm: UserFormValues,
//     orgForm: OrganizationFormValues
// ): {
//     userPayload: Partial<UserFormValues>;
//     orgPayload: Partial<OrganizationFormValues>;
// } {
//     // Wir kopieren alle Felder „as is“ in die Payload.
//     // Du kannst hier bei Bedarf Felder entkoppeln oder umbenennen.
//     const userPayload: Partial<UserFormValues> = {
//         id:             userForm.id,
//         email:          userForm.email,
//         firstName:      userForm.firstName,
//         title:          userForm.title,
//         lastName:       userForm.lastName,
//         salutationType: userForm.salutationType,
//         phonenumber:    userForm.phonenumber,
//         role:           userForm.role,
//         organizationId: userForm.organizationId, // fällt ggf. zurück auf null
//     };
//
//     const orgPayload: Partial<OrganizationFormValues> = {
//         id:               orgForm.id,
//         email:            orgForm.email,
//         name:             orgForm.name,
//         street:           orgForm.street,
//         zip:              orgForm.zip,
//         city:             orgForm.city,
//         country:          orgForm.country,
//         organizationType: orgForm.organizationType,
//         website:          orgForm.website,
//         logo:             orgForm.logo,
//         // Hinweis: logo ist hier ein File | null. Wenn dein Service stattdessen Base64 o.Ä. erwartet,
//         // müsstest du es hier zusätzlich in FormData oder Buffer umwandeln.
//     };
//
//     return { userPayload, orgPayload };
// }