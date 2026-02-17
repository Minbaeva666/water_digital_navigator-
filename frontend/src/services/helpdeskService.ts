import axiosInstance from './auth/axiosInstance';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface DigitalSolution {
  id: string;
  name: string | null;
  shortDescription: string | null;
  link: string | null;
}

interface BotResponse extends ChatMessage {
  suggestions?: Array<{ id: string; label: string }>;
  solutions?: DigitalSolution[];
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class HelpdeskService {
  async sendChatMessage(message: string, taxonomySelection?: string[]): Promise<BotResponse> {
    try {
      const payload: any = { message };
      if (taxonomySelection) payload.taxonomySelection = taxonomySelection;
      const response = await axiosInstance.post(`/api/helpdesk/chat`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async submitContactForm(data: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(`/api/helpdesk/contact`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
}

export default new HelpdeskService();
