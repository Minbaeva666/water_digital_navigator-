import React, { useEffect, useMemo, useState } from "react";
import "./PartnersAndUsersTabComponent.less";
import {
    Button,
    Col,
    FormInstance,
    Popover,
    Row,
    Space,
    Typography,
    Select,
    Spin,
    Alert,
    Form,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { organizationService } from "../../../../services/organization/organizationService";
import { OrganizationMinimalDto } from "../../../../types/dtos/Organization.dto";
import { DigitalSolutionFormValues } from "../../../../forms/digital-solution/DigitalSolutionFormValues";
import { useAbortController } from "../../../../utils/abortController";

const { Title } = Typography;

interface Props {
    form: FormInstance<DigitalSolutionFormValues>;
    onFormChange?: () => void;
}

const PartnersAndUsersTabComponent: React.FC<Props> = ({ form, onFormChange }) => {
    const [backendOrgs, setBackendOrgs] = useState<OrganizationMinimalDto[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const abortCtrl = useAbortController();
    const presentedByUserId = Form.useWatch("presentedByUserId", form);

    useEffect(() => {
        const { signal, abort } = abortCtrl.create();
        setLoading(true);

        organizationService
            .fetchOrganizationsMinimalWithoutPresenter({
                signal,
                presentedByUserId: presentedByUserId || undefined,
            })
            .then(setBackendOrgs)
            .catch((err) => {
                if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
                console.error(err);
                setError("Organisationen konnten nicht geladen werden");
            })
            .finally(() => setLoading(false));

        return abort;
    }, [presentedByUserId]);

    const orgOptions = useMemo(
        () =>
            (backendOrgs ?? []).map((o) => ({
                label: `${o.name}${o.city ? ` (${o.city})` : ""}`,
                value: o.id,
                meta: `${o.name} ${o.city ?? ""} ${o.website ?? ""} ${o.email ?? ""}`.toLowerCase(),
            })),
        [backendOrgs]
    );

    const filterOption: (input: string, option?: any) => boolean = (input, option) => {
        const val = (option?.meta ?? option?.label ?? "").toString().toLowerCase();
        return val.includes(input.trim().toLowerCase());
    };

    return (
        <div className="pa-container">
            {error && (
                <div style={{ marginBottom: 16 }}>
                    <Alert type="error" message={error} />
                </div>
            )}

            {/* ===== Projektpartner ===== */}
            <Row gutter={64} className="pa-header-row">
                <Col span={24}>
                    <Space size="middle" wrap={false} align="center">
                        <Title level={4} className="pa-title">
                            Welche Projektpartner sind beteiligt?
                        </Title>
                        <Popover
                            title="Was sind Projektpartner?"
                            content="Hier können Sie Organisationen angeben, die an der Umsetzung Ihres digitalen Projekts aktiv mitwirken oder mitgewirkt haben."
                            trigger="click"
                            styles={{
                                root: { maxWidth: 200 },
                                body: { whiteSpace: "normal", wordBreak: "break-word" },
                            }}
                        >
                            <Button type="link" icon={<InfoCircleOutlined />} className="pa-link-button">
                                Hilfe
                            </Button>
                        </Popover>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                        <Spin spinning={loading}>
                            <div style={{ maxWidth: 800, width: "100%" }}>
                                {/* WICHTIG: KEIN initialValue hier! Initialwerte kommen vom Form-Eltern (initialValues/setFieldsValue) */}
                                <Form.Item name="projectPartnerIds">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        placeholder="Organisation(en) auswählen"
                                        options={orgOptions}
                                        filterOption={filterOption}
                                        optionFilterProp="label"
                                        style={{ width: "100%" }}
                                        onChange={() => onFormChange?.()}
                                    />
                                </Form.Item>
                            </div>
                        </Spin>
                    </div>
                </Col>
            </Row>

            {/* ===== Anwenderorganisationen ===== */}
            <Row gutter={64} className="pa-header-row" style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Space size="middle" wrap={false} align="center">
                        <Title level={4} className="pa-title">
                            Bei welcher Anwenderorganisation wird Ihre digitale Lösung angewendet?
                        </Title>
                        <Popover
                            title="Was sind Anwenderorganisationen?"
                            content="Hier können Sie Anwenderorganisationen hinzufügen, die Ihre digitale Lösung bereits nutzen."
                            trigger="click"
                            styles={{
                                root: { maxWidth: 200 },
                                body: { whiteSpace: "normal", wordBreak: "break-word" },
                            }}
                        >
                            <Button type="link" icon={<InfoCircleOutlined />} className="pa-link-button">
                                Hilfe
                            </Button>
                        </Popover>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                        <Spin spinning={loading}>
                            <div style={{ maxWidth: 800, width: "100%" }}>
                                {/* WICHTIG: KEIN initialValue hier! */}
                                <Form.Item name="solutionUserIds">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        placeholder="Anwenderorganisation(en) auswählen"
                                        options={orgOptions}
                                        filterOption={filterOption}
                                        optionFilterProp="label"
                                        style={{ width: "100%" }}
                                        onChange={() => onFormChange?.()}
                                    />
                                </Form.Item>
                            </div>
                        </Spin>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default PartnersAndUsersTabComponent;
