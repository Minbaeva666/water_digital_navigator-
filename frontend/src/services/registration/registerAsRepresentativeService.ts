import axiosBase from "../auth/axioBase.ts";

export interface RegisterFormValues {
    salutationType: string;
    title?: string;
    firstName: string;
    lastName: string;
    email: string;
    phonenumber?: string;
    password: string;
    confirmPassword: string;
    orgName: string;
    orgEmail: string;
    orgWebsite: string;
    orgType: string;
    orgStreet: string;
    orgZip: string;
    orgCity: string;
    orgCountry: string;
    orgLogo: string;
}

export async function registerAsRepresentative(values: RegisterFormValues, file: File) {
    const formData = new FormData();

    // Persönliche Infos
    formData.append("salutationType", values.salutationType);
    formData.append("title", values.title || "");
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    formData.append("phonenumber", values.phonenumber || "");
    formData.append("password", values.password);
    formData.append("hasAcceptedTerms", "true");
    formData.append("hasAcceptedPrivacyPolicy", "true");

    // Organisation
    formData.append("organization[email]", values.orgEmail);
    formData.append("organization[name]", values.orgName);
    formData.append("organization[website]", values.orgWebsite);
    formData.append("organization[organizationType]", values.orgType);
    formData.append("organization[street]", values.orgStreet);
    formData.append("organization[zip]", values.orgZip);
    formData.append("organization[city]", values.orgCity);
    formData.append("organization[country]", values.orgCountry);

    // Logo
    formData.append("logo", file);

    try {
        const response = await axiosBase.post("/register/register-as-representative", formData);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }

        throw new Error("Registrierung fehlgeschlagen.");
    }
}