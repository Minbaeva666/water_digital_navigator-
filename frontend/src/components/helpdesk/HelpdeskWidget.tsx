import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Spin } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "./HelpdeskWidget.less";
import helpdeskService from "../../services/helpdeskService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const HelpdeskWidget: React.FC = () => {
  const getChatErrorMessage = (error: unknown): string => {
    const status = (error as any)?.response?.status;
    const apiMessage = (error as any)?.response?.data?.message;
    if (status === 401) {
      return "Um den KI-Chatbot zu nutzen, musst du dich anmelden";
    }
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }
    return "Entschuldigung, ich konnte deine Anfrage gerade nicht beantworten. Bitte nutze das Kontaktformular unter /kontakt oder versuche es später erneut.";
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Willkommen bei Digital Lotse Wasser!\nWie kann ich dir helfen?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [taxonomySelection, setTaxonomySelection] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial categories when widget opens
  useEffect(() => {
    if (isOpen && !initialized) {
      loadInitialCategories();
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  const loadInitialCategories = async () => {
    setLoading(true);
    try {
      const botResponse = await helpdeskService.sendChatMessage("", undefined);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setSuggestions(botResponse.suggestions ?? []);
    } catch (error) {
      console.error("Error loading categories:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getChatErrorMessage(error),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Call helpdesk service (send taxonomySelection when present)
      const botResponse = await helpdeskService.sendChatMessage(
        inputValue,
        taxonomySelection.length ? taxonomySelection : undefined,
      );
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      // suggestions from backend
      setSuggestions(botResponse.suggestions ?? []);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getChatErrorMessage(error),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (id: string, label: string) => {
    // Add user message for the chosen suggestion
    const userMessage: Message = {
      id: Date.now().toString(),
      text: label,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update taxonomy selection
    const newSelection = [...taxonomySelection, id].slice(0, 3);
    setTaxonomySelection(newSelection);
    setLoading(true);
    try {
      const botResponse = await helpdeskService.sendChatMessage(
        "",
        newSelection,
      );
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setSuggestions(botResponse.suggestions ?? []);
    } catch (e) {
      console.error(e);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getChatErrorMessage(e),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="helpdesk-floating-btn">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setIsOpen(true)}
            className="helpdesk-btn-icon"
          />
        </div>
      )}

      {/* Widget */}
      {isOpen && (
        <div className="helpdesk-widget">
          <div className="helpdesk-header">
            <h3 className="helpdesk-title">Helpdesk</h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              className="helpdesk-close-btn"
            />
          </div>

          <div className="helpdesk-chat-container">
            <div className="helpdesk-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`helpdesk-message ${
                    msg.sender === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="helpdesk-message bot-message">
                  <div className="message-bubble">
                    <Spin size="small" spinning={true} />
                  </div>
                </div>
              )}
              {/* suggestion chips */}
              {suggestions.length > 0 && (
                <div className="helpdesk-suggestions">
                  {suggestions.map((s) => (
                    <Button
                      key={s.id}
                      type="default"
                      size="small"
                      style={{ marginRight: 8, marginBottom: 8 }}
                      onClick={() => handleSuggestionClick(s.id, s.label)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="helpdesk-input-area">
              <Input.TextArea
                placeholder="Nachricht schreiben"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={2}
                className="helpdesk-input"
              />
              <Button
                type="primary"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className="helpdesk-send-btn"
              >
                Senden <SendOutlined />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpdeskWidget;
