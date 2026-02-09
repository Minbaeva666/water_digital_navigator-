import axios from 'axios';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
interface BotResponse extends ChatMessage {
  suggestions?: Array<{ id: string; label: string }>;
}
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

class HelpdeskService {
  /**
   * Send a chat message to the helpdesk chatbot
   */
  async sendChatMessage(message: string, taxonomySelection?: string[]): Promise<BotResponse> {
    try {
      const payload: any = { message };
      if (taxonomySelection) payload.taxonomySelection = taxonomySelection;
      const response = await axios.post(`${API_BASE_URL}/helpdesk/chat`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Submit a contact form
   */
  async submitContactForm(data: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/helpdesk/contact`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
}

export default new HelpdeskService();
