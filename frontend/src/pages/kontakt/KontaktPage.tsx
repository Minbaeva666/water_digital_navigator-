import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  App,
} from "antd";
import { contactService, ContactPayload } from "../../services/contactService/contactService";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface ContactFormValues extends ContactPayload {
  acceptPrivacy: boolean;
}

const KontaktPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ContactFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: ContactFormValues) => {
    try {
      setSubmitting(true);
      const { acceptPrivacy, ...payload } = values;

      await contactService.sendContact(payload);
      message.success("Nachricht wurde gesendet.");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Senden fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishFailed = () => {
  };

  return (
    <div style={{ padding: "40px 16px" }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
            Ihre Anfrage an INWA
          </Title>
          <Paragraph style={{ textAlign: "center", marginBottom: 32 }}>
            Sie können uns über dieses Formular eine Nachricht schicken. Test
          </Paragraph>

          <Form<ContactFormValues>
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
          >
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>

            <Form.Item
              label="E-Mail"
              name="email"
              rules={[
                { required: true, message: "E-Mail ist erforderlich" },
                { type: "email", message: "Bitte gültige E-Mail eingeben" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Nachricht"
              name="message"
              rules={[
                { required: true, message: "Nachricht ist erforderlich" },
              ]}
            >
              <TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="acceptPrivacy"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Bitte akzeptieren Sie die Hinweise zum Datenschutz der INWA."
                          )
                        ),
                },
              ]}
            >
<Checkbox>
  Ich habe die{" "}
  <NavLink to="/datenschutz" onClick={(e) => e.stopPropagation()}>
    Datenschutzerklärung
  </NavLink>{" "}
  und die{" "}
  <NavLink to="/nutzungsbedingungen" onClick={(e) => e.stopPropagation()}>
    Nutzungsbedingungen
  </NavLink>{" "}
  gelesen und bin damit einverstanden.
</Checkbox>


            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                Senden
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default KontaktPage;
