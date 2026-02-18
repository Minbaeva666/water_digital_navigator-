import axiosInstance from "../auth/axiosInstance";
import axios from "axios";
import { message } from "antd";

export interface RegisterFormValues {
    salutationType: string;
    title?: string;
    firstName: string;
    lastName: string;
    email: string;
    phonenumber?: string;
    password: string;
    confirmPassword: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    [key: string]: string | undefined;
}

export const registerAsPrivatePerson = async (values: RegisterFormValues, onSuccess: () => void) => {
    try {
        await axiosInstance.post("/register/register-as-private", {
            salutationType: values.salutationType,
            title: values.title,
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            phonenumber: values.phonenumber,
            street: values.street,
            zip: values.zip,
            city: values.city,
            country: values.country,
            hasAcceptedTerms: true,
            hasAcceptedPrivacyPolicy: true
        });
        onSuccess();
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            message.error(error.response.data.error || "Registration failed");
        } else {
            message.error("Registration failed. Please try again.");
        }
        throw error;
    }
};