import React, {useEffect, useState} from "react";
import {Col, Form, FormInstance, Input, Row, Select} from "antd";
import {
    fetchRoleTypes, fetchSalutationTypes,
    TranslatedEnumOption
} from "../../../services/input/inputService.ts";
import {organizationService} from "../../../services/organization/organizationService.ts";
import {UserFormValues} from "../../../types/dtos/User.dto.ts";
import {OrganizationBaseDto} from "../../../types/dtos/Organization.dto.ts";
import {normalizeEmptyToUndefined} from "../../../utils/formDataHelper.ts";

const {Option} = Select;

interface UserTabComponentProps {
    form: FormInstance<UserFormValues>;
}

const CommonUserTabComponent: React.FC<UserTabComponentProps> = ({form}) => {
    const [salutationTypes, setSalutationTypes] = useState<TranslatedEnumOption[]>([]);
    const [dbOrganizations, setDbOrganizations] = useState<OrganizationBaseDto[]>([]);
    const [roleTypes, setRoleTypes] = useState<TranslatedEnumOption[]>([]);

    // Typen laden
    useEffect(() => {
        (async () => {
            const salutationTypes = await fetchSalutationTypes();
            setSalutationTypes(salutationTypes);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const dbOrganizations = await organizationService.fetchOrganizationsBase()
            setDbOrganizations(dbOrganizations);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const roleTypes = await fetchRoleTypes();
            setRoleTypes(roleTypes);
        })();
    }, []);


    return (
        <Row gutter={64}>
            <Col xs={24} md={12} xl={10}>
                <Form.Item name="role" label={"Rolle"} rules={[{
                    required: true,
                }]}>
                    <Select
                        placeholder="Rolle auswählen"
                    >
                        {roleTypes.map(type => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="salutationType" label={"Anrede"} rules={[{
                    required: true,
                }]}>
                    <Select
                        placeholder="Anrede auswählen"
                    >
                        {salutationTypes.map(type => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="title" label="Titel" normalize={normalizeEmptyToUndefined} rules={[{
                    type: "string",
                }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="firstName" label="Vorname" normalize={normalizeEmptyToUndefined} rules={[{
                    required: true,
                    type: "string",
                }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="lastName" label="Nachname" normalize={normalizeEmptyToUndefined} rules={[{
                    required: true,
                    type: "string",
                }]}>
                    <Input/>
                </Form.Item>
            </Col>

            {/* Rechte Spalte */}
            <Col xs={24} md={12}>
                <Form.Item name="email" label="Kontakt-Email" normalize={normalizeEmptyToUndefined} rules={[{
                    required: true,
                    type: "email",
                }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="phonenumber" label="Telefonnummer" normalize={normalizeEmptyToUndefined} rules={[{
                    type: "string",
                }]}>
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="organizationId"
                    label={"Zugehörige Organisation"}
                    initialValue={null}
                >
                    <Select
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        placeholder="Organisation auswählen"
                        onChange={(value) => {
                            form.setFieldsValue({ organizationId: value ?? null });
                        }}
                            loading={dbOrganizations.length === 0}>
                        {dbOrganizations.map((u) => (
                            <Option key={u.id} value={u.id}>
                                {u.name}
                            </Option>
                        ))}
                        <Select.Option value={null}>keine Organisation</Select.Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    );
};

export default CommonUserTabComponent;
