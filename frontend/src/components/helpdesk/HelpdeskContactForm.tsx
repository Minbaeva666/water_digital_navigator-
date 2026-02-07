import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "./HelpdeskContactForm.less";
import helpdeskService from "../../services/helpdeskService";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const HelpdeskContactForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ContactFormData) => {
    setLoading(true);
    try {
      await helpdeskService.submitContactForm(values);
      message.success("Vielen Dank! Wir werden uns bald bei dir melden.");
      form.resetFields();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      message.error(
        "Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="helpdesk-contact-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="contact-form"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Bitte gib deinen Namen ein" }]}
        >
          <Input placeholder="Dein Name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-Mail"
          rules={[
            { required: true, message: "Bitte gib deine E-Mail ein" },
            { type: "email", message: "Ungültiges E-Mail-Format" },
          ]}
        >
          <Input placeholder="deine@email.com" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Betreff"
          rules={[{ required: true, message: "Bitte gib einen Betreff ein" }]}
        >
          <Input placeholder="Betreff" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Nachricht"
          rules={[{ required: true, message: "Bitte gib deine Nachricht ein" }]}
        >
          <Input.TextArea placeholder="Deine Nachricht" rows={4} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="contact-submit-btn"
            block
          >
            Senden <SendOutlined />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HelpdeskContactForm;
