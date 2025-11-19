import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

type FaqItemForm = { header: string; content: string };

type Props = {
    open: boolean;
    onCancel: () => void;
    onSave: (values: FaqItemForm) => void;
    initial?: Partial<FaqItemForm>;
    mode?: "add" | "edit";
    confirmLoading?: boolean;
};

const FaqItemModal: React.FC<Props> = ({
                                           open,
                                           onCancel,
                                           onSave,
                                           initial,
                                           mode = "add",
                                           confirmLoading,
                                       }) => {
    const [form] = Form.useForm<FaqItemForm>();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                header: initial?.header ?? "",
                content: initial?.content ?? "",
            });
        } else {
            form.resetFields();
        }
    }, [open, initial, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSave(values);
    };

    return (
        <Modal
            title={mode === "edit" ? "FAQ-Eintrag bearbeiten" : "FAQ-Eintrag hinzufügen"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={mode === "edit" ? "Speichern" : "Hinzufügen"}
            cancelText="Abbrechen"
            destroyOnClose
            confirmLoading={confirmLoading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Überschrift"
                    name="header"
                    rules={[
                        { required: true, message: "Bitte Überschrift angeben." },
                        { max: 120, message: "Max. 120 Zeichen." },
                    ]}
                >
                    <Input placeholder="z. B. Was ist Produkt X?" maxLength={120} />
                </Form.Item>

                <Form.Item
                    label="Text"
                    name="content"
                    rules={[{ required: true, message: "Bitte Text angeben." }]}
                >
                    <Input.TextArea placeholder="Antwort / Erklärung …" autoSize={{ minRows: 4 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FaqItemModal;
