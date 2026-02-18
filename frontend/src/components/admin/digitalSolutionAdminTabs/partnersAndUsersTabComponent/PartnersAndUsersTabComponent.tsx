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
  Modal,
  Input,
  App,
} from "antd";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { organizationService } from "../../../../services/organization/organizationService";
import { OrganizationMinimalDto } from "../../../../types/dtos/Organization.dto";
import { DigitalSolutionFormValues } from "../../../../forms/digital-solution/DigitalSolutionFormValues";
import { useAbortController } from "../../../../utils/abortController";
import {
  fetchOrganizationTypes,
  TranslatedEnumOption,
} from "../../../../services/input/inputService";
import { OrganizationType, OrganizationState } from "../../../../types/constants/enums";

const { Title } = Typography;

interface Props {
  form: FormInstance<DigitalSolutionFormValues>;
  onFormChange?: () => void;
}

type OrgCreateFormValues = {
  orgName: string;
  orgEmail: string;
  orgWebsite?: string;
  orgType: OrganizationType;
  orgStreet: string;
  orgZip: string;
  orgCity: string;
  orgCountry: string;
};

// (можно вынести в общий файл, как в регистрации)
const countries = [
  { code: "DE", nameDe: "Deutschland" },
  { code: "AT", nameDe: "Österreich" },
  { code: "CH", nameDe: "Schweiz" },
  { code: "DK", nameDe: "Dänemark" },
  { code: "PL", nameDe: "Polen" },
  { code: "CZ", nameDe: "Tschechien" },
  { code: "FR", nameDe: "Frankreich" },
  { code: "LU", nameDe: "Luxemburg" },
  { code: "BE", nameDe: "Belgien" },
  { code: "NL", nameDe: "Niederlande" },
];

type TargetField = "projectPartnerIds" | "solutionUserIds";

const PartnersAndUsersTabComponent: React.FC<Props> = ({ form, onFormChange }) => {
  const { message } = App.useApp();

  const [backendOrgs, setBackendOrgs] = useState<OrganizationMinimalDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortCtrl = useAbortController();
  const presentedByUserId = Form.useWatch("presentedByUserId", form);

  // --- modal state
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgModalTarget, setOrgModalTarget] = useState<TargetField>("solutionUserIds");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgForm] = Form.useForm<OrgCreateFormValues>();

  // types for orgType select
  const [organizationTypes, setOrganizationTypes] = useState<TranslatedEnumOption[]>([]);
  const [orgTypLoading, setOrgTypLoading] = useState(false);

  useEffect(() => {
    // load org types once (for modal)
    (async () => {
      try {
        setOrgTypLoading(true);
        const types = await fetchOrganizationTypes();
        setOrganizationTypes(types);
      } catch (e) {
        console.error(e);
      } finally {
        setOrgTypLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const { signal, abort } = abortCtrl.create();
    setLoading(true);
    setError(null);

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

  const openOrgModal = (target: TargetField) => {
    setOrgModalTarget(target);
    orgForm.resetFields();
    setOrgModalOpen(true);
  };

  const closeOrgModal = () => {
    setOrgModalOpen(false);
    orgForm.resetFields();
  };

  const addOrgToField = (field: TargetField, orgId: string) => {
    const current = (form.getFieldValue(field) as string[] | undefined) ?? [];
    const next = Array.from(new Set([...current, orgId]));
    form.setFieldValue(field, next);
    onFormChange?.();
  };

const handleCreateOrg = async () => {
  try {
    const values = await orgForm.validateFields();
    setOrgSaving(true);

    const created = await organizationService.createOrganization({
      name: values.orgName.trim(),
      email: values.orgEmail?.trim() || "",
      website: values.orgWebsite?.trim() || "",
      street: values.orgStreet?.trim() || "",
      zip: values.orgZip.trim(),
      city: values.orgCity.trim(),
      countryCode: values.orgCountry,
      organizationType: values.orgType,
      organizationState: OrganizationState.LITE,
      regionId: null,
      manualCoords: false,
      municipalityProfile: {
        organizationId: "",
        population: 0,
      },
    });

    const newId =
      (created as any)?.id ?? (created as any)?.organizationId ?? (created as any)?.orgId;

    if (!newId) throw new Error("Organisation konnte nicht erstellt werden (keine ID).");

    addOrgToField(orgModalTarget, newId);

    const refreshed = await organizationService.fetchOrganizationsMinimalWithoutPresenter({
      signal: undefined as any, 
      presentedByUserId: presentedByUserId || undefined,
    });
    setBackendOrgs(refreshed);

    message.success("Organisation erfolgreich erstellt.");
    closeOrgModal();
  } catch (e: any) {
    if (e?.errorFields) return;
    console.error(e);
    const serverMessage =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Fehler beim Erstellen der Organisation.";
    message.error(serverMessage);
  } finally {
    setOrgSaving(false);
  }
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

            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => openOrgModal("projectPartnerIds")}
            >
              Neue Organisation
            </Button>
          </Space>

          <div style={{ marginTop: 8 }}>
            <Spin spinning={loading}>
              <div style={{ maxWidth: 800, width: "100%" }}>
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

            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => openOrgModal("solutionUserIds")}
            >
              Neue Organisation
            </Button>
          </Space>

          <div style={{ marginTop: 8 }}>
            <Spin spinning={loading}>
              <div style={{ maxWidth: 800, width: "100%" }}>
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

      {/* ===== Modal: neue Organisation ===== */}
      <Modal
        open={orgModalOpen}
        onCancel={closeOrgModal}
        onOk={handleCreateOrg}
        okText="Speichern"
        cancelText="Abbrechen"
        confirmLoading={orgSaving}
        title="Neue Organisation registrieren"
        destroyOnClose
      >
        <Form form={orgForm} layout="vertical">
          <Form.Item
            name="orgName"
            label="Name"
            rules={[
              { required: true, message: "Organisationsname ist erforderlich" },
              { min: 2, message: "Organisationsname muss mindestens 2 Zeichen lang sein" },
              { max: 120, message: "Organisationsname darf maximal 120 Zeichen lang sein" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="orgEmail"
            label="Email Ihrer Organisation"
            rules={[{ type: "email", message: "Bitte eine gueltige E-Mail eingeben" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="orgWebsite" label="Webseite Ihrer Organisation">
            <Input />
          </Form.Item>

          <Form.Item
            name="orgType"
            label="Organisations-Typ"
            rules={[{ required: true }]}
          >
            <Select placeholder="Typ auswählen" loading={orgTypLoading} disabled={orgTypLoading}>
              {organizationTypes.map((t) => (
                <Select.Option key={t.value} value={t.value}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="orgStreet" label="Straße">
            <Input />
          </Form.Item>

          <Form.Item
            name="orgZip"
            label="Postleitzahl"
            rules={[
              { required: true, message: "Postleitzahl ist erforderlich" },
              { pattern: /^[0-9]{5}$/, message: "Postleitzahl muss 5 Ziffern haben" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="orgCity"
            label="Stadt"
            rules={[
              { required: true, message: "Stadt ist erforderlich" },
              { min: 2, message: "Stadt muss mindestens 2 Zeichen lang sein" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="orgCountry"
            label="Land"
            rules={[{ required: true, message: "Bitte wählen Sie ein Land" }]}
          >
            <Select placeholder="Land auswählen" showSearch optionFilterProp="children">
              {countries.map((c) => (
                <Select.Option key={c.code} value={c.code}>
                  {c.nameDe}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnersAndUsersTabComponent;
