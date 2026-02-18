import axiosInstance from "../auth/axiosInstance";

export interface ContactPayload {
  name?: string;
  email: string;
  message: string;
}

export const contactService = {
  async sendContact(payload: ContactPayload): Promise<void> {
    await axiosInstance.post(`/contact`, payload);
  },
};
