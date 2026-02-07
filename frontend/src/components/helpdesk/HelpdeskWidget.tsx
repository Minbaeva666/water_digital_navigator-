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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Digital Lotse Wasser!\nHow can I help you?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Call helpdesk service
      const botResponse = await helpdeskService.sendChatMessage(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your message. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
              <div ref={messagesEndRef} />
            </div>
            <div className="helpdesk-input-area">
              <Input.TextArea
                placeholder="Write message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                className="helpdesk-input"
              />
              <Button
                type="primary"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className="helpdesk-send-btn"
              >
                send <SendOutlined />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpdeskWidget;
