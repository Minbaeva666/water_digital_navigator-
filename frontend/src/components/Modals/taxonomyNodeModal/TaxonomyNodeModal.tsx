import React, {useEffect} from "react";
import {Modal, Form, Input, ColorPicker, Button, InputNumber, Select} from "antd";
import {TaxonomyNodeDto} from "../../../types/dtos/TaxonomyNodeDto.ts";

type Props = {
    open: boolean;
    node: TaxonomyNodeDto | null;
    parent: TaxonomyNodeDto | null;
    onCancel: () => void;
    onSave: (values: Partial<TaxonomyNodeDto>) => void;
    onDelete?: (node: TaxonomyNodeDto) => void;
    isNameTaken: (name: string) => boolean;
};

const TaxonomyNodeModal: React.FC<Props> = ({open, node, parent, onCancel, onSave, onDelete, isNameTaken}) => {
    const [form] = Form.useForm();

    const isRoot = (!parent && !node?.parentId);

    useEffect(() => {
        if (open) {
            if (node) {
                form.setFieldsValue(node);
            } else {
                form.resetFields();

                if (parent) {
                    form.setFieldsValue({
                        minSelectableNodes: parent.minSelectableNodes ?? undefined,
                        maxSelectableNodes: parent.maxSelectableNodes ?? undefined,
                    });
                }
            }
        }
    }, [open, node, parent, form]);



    return (
        <Modal
            open={open}
            title={
                node
                    ? `Kriterium „${node.nameDe}“ bearbeiten`
                    : parent
                        ? `Unterkriterium zu „${parent.nameDe}” hinzufügen`
                        : "Root-Kriterium hinzufügen"
            }
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then((values) => onSave(values));
            }}
            okText={node ? "Übernehmen" : "Anlegen"}
            footer={[
                node && onDelete ? (
                    <Button
                        key="delete"
                        danger
                        onClick={() => onDelete(node)}
                    >
                        Löschen
                    </Button>
                ) : null,
                <Button key="cancel" onClick={onCancel}>
                    Abbrechen
                </Button>,
                <Button
                    key="ok"
                    type="primary"
                    onClick={() => form.validateFields().then((values) => onSave(values))}
                >
                    {node ? "Übernehmen" : "Anlegen"}
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Name"
                    name="nameDe"
                    validateTrigger={["onChange", "onBlur"]}
                    hasFeedback
                    rules={[
                        {required: true, message: "Bitte Name eingeben"},
                        {
                            validator: async (_, value) => {
                                const v = (value ?? "").trim();
                                if (!v) return Promise.resolve();
                                if (isNameTaken(v)) {
                                    return Promise.reject(new Error("Es existiert bereits ein Kriterium mit diesem Namen."));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    extra="Name des Kritierums darf nur einmalig vorkommen."
                >
                    <Input autoFocus/>
                </Form.Item>
                {isRoot && (
                    <>
                        <Form.Item
                            label="Farbe"
                            name="color"
                            rules={[{ required: true, message: "Bitte Farbe auswählen" }]}
                        >
                            <ColorPicker
                                showText
                                onChangeComplete={(color) =>
                                    form.setFieldsValue({ color: color.toHexString() })
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="Minimale Anzahl auswählbarer Kriterien"
                            name="minSelectableNodes"
                            rules={[
                                { type: 'number', min: 0, message: 'Minimale Auswahl muss ≥ 0 sein' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const max = getFieldValue('maxSelectableNodes');
                                        if (value != null && max != null && value > max) {
                                            return Promise.reject(
                                                new Error('Minimalwert darf nicht größer als Maximalwert sein')
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Maximale Anzahl auswählbarer Kriterien"
                            name="maxSelectableNodes"
                            rules={[
                                { type: 'number', min: 1, message: 'Maximale Auswahl muss ≥ 1 sein' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const min = getFieldValue('minSelectableNodes');
                                        if (value != null && min != null && value < min) {
                                            return Promise.reject(
                                                new Error('Maximalwert darf nicht kleiner als Minimalwert sein')
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Favorit"
                            name="isFav"
                        >
                            <Select>
                                <Select.Option value={true}>Ja</Select.Option>
                                <Select.Option value={false}>Nein</Select.Option>
                            </Select>
                        </Form.Item>

                    </>
                )}
            </Form>
        </Modal>
    );
};

export default TaxonomyNodeModal;
