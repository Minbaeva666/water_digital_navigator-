import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL; 

export interface ContactPayload {
  name?: string;
  email: string;
  message: string;
}

export const contactService = {
  async sendContact(payload: ContactPayload): Promise<void> {
    await axios.post(`${BASE_URL}/contact`, payload);
  },
};
