import axiosInstance from "../auth/axiosInstance.ts";
import axios, {AxiosError} from "axios";
import {
    UserBaseDto,
    UserFormValues,
    UserFullDto, UserMinimalDto,
    UserWithOrganizationDto
} from "../../types/dtos/User.dto.ts";
import { SalutationType } from "../../types/constants/enums.ts";

const baseUrl = `/users`;


const fetchUsersMinimal = async (): Promise<UserMinimalDto[]> => {
    try {
        const {data} = await axiosInstance.get<UserMinimalDto[]>(baseUrl + "/minimal-users");
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der minimalen User:', error);
        return [];
    }
};

const createUser = async (
    userFormValues: UserFormValues
): Promise<{ id: string }> => {
    try {
        const payload: Record<string, string> = {
            firstName: userFormValues.firstName ?? "",
            lastName: userFormValues.lastName ?? "",
            email: userFormValues.email ?? "",
            role: userFormValues.role!,
        };

        if (userFormValues.salutationType) {
            payload.salutationType = userFormValues.salutationType;
        }
        if (userFormValues.phonenumber) {
            payload.phonenumber = userFormValues.phonenumber;
        }
        if (userFormValues.organizationId) {
            payload.organizationId = userFormValues.organizationId;
        }
        if (userFormValues.title) {
            payload.title = userFormValues.title;
        }

        const {data} = await axiosInstance.post<{ id: string }>(
            baseUrl,
            payload
        );

        return data;
    } catch (error: any) {
        const serverMessage = error.response?.data?.message;
        throw serverMessage ?? "Erstellen des Benutzers fehlgeschlagen.";
    }
};

const createColleagueInMyOrganization = async (payload: {
    salutationType: SalutationType;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    phonenumber?: string;
}): Promise<UserMinimalDto> => {
    const { data } = await axiosInstance.post<UserMinimalDto>(
        `${baseUrl}/colleagues`,
        payload
    );
    return data;
};


    // const createUserWithOrganization = async (
    //     userFormValues: UserFormValues,
    //     organizationFormValues: OrganizationFormValues & { logo?: File | null }
    // ): Promise<{ id: string }> => {
    //
    //     const {
    //         name,
    //         email: orgEmail,
    //         street,
    //         zip,
    //         city,
    //         country,
    //         organizationType,
    //         website,
    //         logo,
    //     } = organizationFormValues;
    //
    //
    //     const formData = new FormData();
    //
    //     formData.append("firstName", userFormValues.firstName);
    //     formData.append("lastName", userFormValues.lastName);
    //     formData.append("email", userFormValues.email);
    //     formData.append("role", userFormValues.role!);
    //
    //     if (userFormValues.salutationType) {
    //         formData.append("salutationType", userFormValues.salutationType);
    //     }
    //     if (userFormValues.phonenumber) {
    //         formData.append("phonenumber", userFormValues.phonenumber);
    //     }
    //     if (userFormValues.title) {
    //         formData.append("title", userFormValues.title);
    //     }
    //
    //     formData.append(
    //         "organization",
    //         JSON.stringify({
    //             name: name,
    //             email: orgEmail,
    //             street: street,
    //             zip: zip,
    //             city: city,
    //             country: country,
    //             organizationType: organizationType,
    //             website: website || undefined,
    //         })
    //     );
    //
    //     if (!logo) {
    //         throw new Error(
    //             "Ein Logo-File wird benötigt, wenn eine neue Organisation erstellt werden soll."
    //         );
    //     }
    //     formData.append("logo", logo);
    //
    //
    //     const {data} = await axiosInstance.post<{ id: string }>(
    //         baseUrl + "/create-user-with-organization",
    //         formData
    //     );
    //
    //     return data;
    // };


const fetchUser = async (userId?: string): Promise<UserBaseDto> => {
    if (!userId) {
        // Sofort abbrechen, wenn kein userId-Parameter da ist
        throw new Error("Keine User-ID angegeben.");
    }
    try {
        const { data } = await axiosInstance.get<UserBaseDto>(`${baseUrl}/${userId}`);
        return data;
    } catch (err: unknown) {
        // Default-Text
        let messageText = `Fehler beim Laden des Users mit der ID ${userId}.`;

        // Wenn es ein AxiosError ist und eine serverseitige Nachricht enthält, nutze die
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            if (axiosErr.response?.data?.message) {
                messageText = axiosErr.response.data.message;
            }
        }

        console.error(messageText, err);
        // Wirf eine echte Error-Instanz, damit caller im catch landet
        throw new Error(messageText);
    }
};

    const editUser = async (
        userFormValues: UserFormValues
    ): Promise<UserWithOrganizationDto | null> => {
        try {
            const payload: Record<string, any> = {
                firstName: userFormValues.firstName,
                lastName: userFormValues.lastName,
                email: userFormValues.email,
                role: userFormValues.role!,
                accountState: userFormValues.accountState!,
            };

            if (userFormValues.salutationType) {
                payload.salutationType = userFormValues.salutationType;
            }
            if (userFormValues.phonenumber) {
                payload.phonenumber = userFormValues.phonenumber;
            }
            if (userFormValues.title) {
                payload.title = userFormValues.title;
            }
            if (userFormValues.organizationId) {
                payload.organizationId = userFormValues.organizationId;
            } else {
                payload.organizationId = null;
            }

            const {data} = await axiosInstance.put<UserWithOrganizationDto>(
                `${baseUrl}/${userFormValues.id}`,
                payload
            );
            return data;
        } catch (error: any) {
            console.log(error);
            const serverMessage = error.response?.data?.message;
            throw serverMessage ?? "Fehler beim Ändern des Users.";
        }
    }

    // const editUserWithCreateOrganization = async (
    //     userFormValues: UserFormValues,
    //     organizationFormValues: OrganizationFormValues & { logo?: File | null }
    // ): Promise<UserWithOrganizationDto | null> => {
    //     try {
    //         const {
    //             name,
    //             email: orgEmail,
    //             street,
    //             zip,
    //             city,
    //             country,
    //             organizationType,
    //             website,
    //             logo,
    //         } = organizationFormValues;
    //
    //         // 1. FormData zusammenbauen
    //         const formData = new FormData();
    //
    //         // a) User-Felder
    //         formData.append("firstName", userFormValues.firstName);
    //         formData.append("lastName", userFormValues.lastName);
    //         formData.append("email", userFormValues.email);
    //         formData.append("role", userFormValues.role!);
    //         formData.append("accountState", userFormValues.accountState);
    //         if (userFormValues.salutationType) {
    //             formData.append("salutationType", userFormValues.salutationType);
    //         }
    //         if (userFormValues.phonenumber) {
    //             formData.append("phonenumber", userFormValues.phonenumber);
    //         }
    //         if (userFormValues.title) {
    //             formData.append("title", userFormValues.title);
    //         }
    //
    //         // b) Neue Organisation als JSON
    //         formData.append(
    //             "organization",
    //             JSON.stringify({
    //                 name: name,
    //                 email: orgEmail,
    //                 street: street,
    //                 zip: zip,
    //                 city: city,
    //                 country: country,
    //                 organizationType: organizationType,
    //                 website: website || undefined,
    //             })
    //         );
    //
    //         // c) Logo-Datei
    //         if (!logo) {
    //             throw new Error(
    //                 "Ein Logo-File wird benötigt, wenn eine neue Organisation erstellt werden soll."
    //             );
    //         }
    //         formData.append("logo", logo);
    //
    //         // 2. HTTP-Request: PUT /users/:id/organization
    //         const {data} = await axiosInstance.put<UserWithOrganizationDto>(
    //             `${baseUrl}/${userFormValues.id}/organization`,
    //             formData
    //         );
    //
    //         return data;
    //     } catch (error) {
    //         console.error(
    //             "Fehler beim Aktualisieren des Users + Anlegen einer neuen Organisation:",
    //             error
    //         );
    //         return null;
    //     }
    // };

    export const deleteUser = async (id: string): Promise<UserFullDto> => {
        try {
            const {data} = await axiosInstance.delete<UserFullDto>(
                baseUrl + `/${id}`
            );
            return data;
        } catch (error: any) {
            const serverMessage = error.response?.data?.message;
            throw serverMessage ?? "Fehler beim Löschen des Users.";
        }
    }


    export const userService = {
        fetchUsersMinimal,
        // createUserWithOrganization,
        createUser,
        createColleagueInMyOrganization,
        fetchUser,
        editUser,
        // editUserWithCreateOrganization,
        deleteUser
    };
