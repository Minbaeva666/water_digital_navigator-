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
      message.success("Thank you! We will get back to you soon.");
      form.resetFields();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      message.error("Failed to send message. Please try again.");
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
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input placeholder="Your name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input placeholder="your@email.com" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Please enter a subject" }]}
        >
          <Input placeholder="Subject" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Please enter your message" }]}
        >
          <Input.TextArea placeholder="Your message" rows={4} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="contact-submit-btn"
            block
          >
            send <SendOutlined />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HelpdeskContactForm;
