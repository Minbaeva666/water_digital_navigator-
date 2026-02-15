import React, { useEffect, useRef, useState } from "react";
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Button,
  Modal,
  FormInstance,
  message,
  Space,
  InputNumber,
  Popover,
  Checkbox,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  fetchCountries,
  fetchOrganizationTypes,
  fetchRegions,
  TranslatedEnumOption,
} from "../../../services/input/inputService";
import { OrganizationFormValues } from "../../../types/dtos/Organization.dto";
import { OrganizationState, OrganizationType } from "../../../types/constants/enums";
import i18n, { t } from "i18next";
import "./CommonOrganizationTabComponent.less";

const { Option } = Select;

interface CommonOrganizationTabProps {
  form: FormInstance<OrganizationFormValues>;
  forcedOrganizationState?: OrganizationState; 
}

export const CommonOrganizationTabComponent: React.FC<CommonOrganizationTabProps> = ({
  form,
  forcedOrganizationState,
}) => {
  const [organizationTypes, setOrganizationTypes] = useState<TranslatedEnumOption[]>([]);
  const [organizationStates, setOrganizationStates] = useState<TranslatedEnumOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<TranslatedEnumOption[]>([]);
  const [regionOptions, setRegionOptions] = useState<Array<TranslatedEnumOption & { code?: string }>>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const countryCode = Form.useWatch("countryCode", form);
  const orgState = Form.useWatch<OrganizationState | undefined>("organizationState", form);
  const orgType = Form.useWatch("organizationType", form);
  const manualCoords = Form.useWatch<boolean>("manualCoords", form);
  const prevManual = useRef<boolean | undefined>(undefined);

  const isLite = orgState === OrganizationState.LITE;
  const isFull = orgState === OrganizationState.FULL;
  const isMunicipality = orgType === OrganizationType.MUNICIPALITY;

  // NEW: if state is forced (e.g. user modal), enforce it in the form
  useEffect(() => {
    if (!forcedOrganizationState) return;
    const current = form.getFieldValue("organizationState");
    if (current !== forcedOrganizationState) {
      form.setFieldsValue({ organizationState: forcedOrganizationState });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedOrganizationState]);

  useEffect(() => {
    (async () => {
      setLoadingTypes(true);
      const types = await fetchOrganizationTypes();
      setOrganizationTypes(types);
      setLoadingTypes(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const countries = await fetchCountries("de");
      setCountryOptions(countries);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!countryCode) {
        setRegionOptions([]);
        return;
      }
      setLoadingRegions(true);
      try {
        const regions = await fetchRegions(countryCode, "de");
        setRegionOptions(regions);

        const current = form.getFieldValue("regionId");
        if (current && !regions.some((r) => r.value === current)) {
          form.setFieldsValue({ regionId: undefined });
        }
      } finally {
        setLoadingRegions(false);
      }
    })();
  }, [countryCode, form]);

  //  UPDATED: if state is forced, show only that option
  useEffect(() => {
    const all = [
      { value: OrganizationState.LITE, label: t("organizationState.LITE") },
      { value: OrganizationState.FULL, label: t("organizationState.FULL") },
    ];
    setOrganizationStates(forcedOrganizationState ? all.filter((x) => x.value === forcedOrganizationState) : all);
  }, [i18n.language, forcedOrganizationState]);

  // Einwohnerzahl zurücksetzen, wenn Typ ≠ Kommune
  useEffect(() => {
    if (!isMunicipality) {
      form.setFieldsValue({ municipalityProfile: { population: undefined } });
    }
  }, [isMunicipality, form]);

  useEffect(() => {
    // ersten Render ignorieren
    if (prevManual.current === undefined) {
      prevManual.current = manualCoords;
      return;
    }

    // nur wenn der Nutzer von "manuell" zurück auf "auto" wechselt
    if (prevManual.current === true && manualCoords === false) {
      form.setFieldsValue({ lat: null, lon: null });
    }

    prevManual.current = manualCoords;
  }, [manualCoords, form]);

  // FileList aus dem Form-State
  const formFileList = Form.useWatch<UploadFile[]>("logoBase64", form);
  useEffect(() => {
    if (!formFileList?.length) {
      setPreviewImage("");
      return;
    }
    const fileItem = formFileList[0];
    if (fileItem.url || fileItem.thumbUrl) {
      setPreviewImage(fileItem.url || fileItem.thumbUrl || "");
      return;
    }
    if (fileItem.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(fileItem.originFileObj);
    }
  }, [formFileList]);

  const uploadProps: UploadProps = {
    accept: "image/png,image/jpeg, image/svg+xml",
    beforeUpload(file) {
      const isAllowed = ["image/png", "image/jpeg", "image/svg+xml"].includes(file.type);
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isAllowed) {
        message.error("Nur JPG, PNG oder SVG erlaubt");
        return Upload.LIST_IGNORE;
      }
      if (!isLt5M) {
        message.error("Maximal 5 MB");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onPreview: async (file) => {
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result as string);
          setPreviewOpen(true);
        };
        reader.readAsDataURL(file.originFileObj as Blob);
      } else {
        setPreviewImage(file.url || "");
        setPreviewOpen(true);
      }
    },
    listType: "picture",
    maxCount: 1,
    showUploadList: { showRemoveIcon: true },
  };

  return (
    <>
      <Row gutter={64}>
        {/* LINKE SPALTE */}
        <Col xs={24} md={12} xl={10}>
          {/* Controlling Field */}
          <Form.Item
            name="organizationState"
            label={
              <Space size="small" wrap={false} align="center">
                Art der Organisation
                <Popover
                  title="Was ist der Unterschied?"
                  content="Anwenderorganisationen/Projektpartner benötigen weniger Pflichtfelder. Organisationen mit Digitalen Lösungen benötigen mehr Pflichtfelder."
                  trigger="click"
                  styles={{
                    body: {
                      maxWidth: 320,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    },
                  }}
                >
                  <Button
                    type="link"
                    icon={<InfoCircleOutlined />}
                    className="pa-link-button"
                    style={{ padding: 0, height: "auto" }}
                  >
                    Hilfe
                  </Button>
                </Popover>
              </Space>
            }
            rules={[{ required: true, message: "Organisationsart ist erforderlich" }]}
          >
            <Select
              placeholder="Typ auswählen"
              loading={loadingTypes}
              disabled={loadingTypes || !!forcedOrganizationState} // NEW: disabled when forced
            >
              {organizationStates.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Dynamischer linker Bereich */}
          <div key={`left-${orgState ?? "none"}`}>
            {(isLite || isFull) && (
              <>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Name ist erforderlich" }]}
                  preserve={false}
                >
                  <Input placeholder="Name der Organisation" />
                </Form.Item>

                {isFull && (
                  <>
                    <Form.Item
                      name="email"
                      label="Kontakt-E-Mail"
                      rules={[{ required: true, type: "email", message: "Gültige E-Mail ist erforderlich" }]}
                      preserve={false}
                    >
                      <Input placeholder="kontakt@domain.de" />
                    </Form.Item>

                    <Form.Item
                      name="website"
                      label="Webseite"
                      rules={[{ required: true, type: "url", message: "Gültige URL ist erforderlich" }]}
                      preserve={false}
                    >
                      <Input placeholder="https://www.beispiel.de" />
                    </Form.Item>
                  </>
                )}

                <Form.Item
                  name="organizationType"
                  label="Organisationstyp"
                  rules={[{ required: true, message: "Typ ist erforderlich" }]}
                  preserve={false}
                >
                  <Select placeholder="Typ auswählen" loading={loadingTypes} disabled={loadingTypes}>
                    {organizationTypes.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {isMunicipality && (
                  <Form.Item
                    name={["municipalityProfile", "population"]}
                    label="Einwohnerzahl"
                    rules={[{ type: "number", min: 0, message: "Einwohnerzahl muss ≥ 0 sein" }]}
                    preserve={false}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="z. B. 75 000"
                      min={0}
                      step={1}
                      precision={0}
                      inputMode="numeric"
                      parser={(value) => {
                        const onlyDigits = value?.replace(/\D/g, "") ?? "";
                        return onlyDigits ? Number(onlyDigits) : 0;
                      }}
                      formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "")}
                    />
                  </Form.Item>
                )}

                {isFull && (
                  <Form.Item
                    name="logoBase64"
                    label="Logo"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e.fileList) ? e.fileList.slice(-1) : [])}
                    rules={[{ required: true, message: "Logo ist erforderlich" }]}
                    preserve={false}
                  >
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>Logo hochladen</Button>
                    </Upload>
                  </Form.Item>
                )}
              </>
            )}
          </div>
        </Col>

        {/* RECHTE SPALTE */}
        <Col xs={24} md={12} xl={10}>
          <div key={`right-${orgState ?? "none"}`}>
            {(isLite || isFull) && (
              <>
                {isFull && (
                  <Form.Item
                    name="street"
                    label="Straße"
                    rules={[{ required: true, message: "Straße ist erforderlich" }]}
                    preserve={false}
                  >
                    <Input placeholder="Musterstraße 1" />
                  </Form.Item>
                )}

                <Form.Item name="zip" label="PLZ" rules={[{ required: true, message: "PLZ ist erforderlich" }]} preserve={false}>
                  <Input placeholder="12345" inputMode="numeric" />
                </Form.Item>

                <Form.Item name="city" label="Stadt" rules={[{ required: true, message: "Stadt ist erforderlich" }]} preserve={false}>
                  <Input placeholder="Musterstadt" />
                </Form.Item>

                <Form.Item
                  name="countryCode"
                  label="Land"
                  rules={[{ required: true, message: "Land ist erforderlich" }]}
                  preserve={false}
                >
                  <Select
                    placeholder="Land auswählen"
                    showSearch
                    optionFilterProp="label"
                    onChange={() => form.setFieldsValue({ regionId: undefined })}
                    options={countryOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                  />
                </Form.Item>

                {isFull && regionOptions.length > 0 && (
                  <Form.Item
                    name="regionId"
                    label="Bundesland / Region"
                    preserve={false}
                    getValueFromEvent={(val) => (val === undefined ? null : val)}
                  >
                    <Select
                      placeholder="Region auswählen"
                      loading={loadingRegions}
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={regionOptions}
                    />
                  </Form.Item>
                )}

                {/* Schalter für manuelle Koordinaten */}
                <Form.Item label={null}>
                  <Space size="small" align="center" wrap={false}>
                    <Form.Item name="manualCoords" valuePropName="checked" noStyle>
                      <Checkbox>Koordinaten manuell angeben</Checkbox>
                    </Form.Item>

                    <Popover
                      title="Koordinaten manuell angeben"
                      content="Aktivieren zum manuellen Eingeben der Koordinaten. Bei Deaktivierung werden die Werte automatisch bestimmt, wenn eine gültige Adresse (PLZ, Stadt und Land) angegeben wurde."
                      trigger="click"
                      styles={{ body: { maxWidth: 320, whiteSpace: "normal", overflowWrap: "anywhere" } }}
                    >
                      <Button
                        type="link"
                        icon={<InfoCircleOutlined />}
                        className="pa-link-button"
                        style={{ padding: 0, height: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        Hilfe
                      </Button>
                    </Popover>
                  </Space>
                </Form.Item>

                <Form.Item
                  name="lat"
                  label="Breitengrad (lat)"
                  rules={manualCoords ? [{ type: "number", min: -90, max: 90, message: "Wert muss zwischen -90 und 90 liegen" }] : []}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={manualCoords ? "z. B. 52.520008" : "Wird automatisch generiert"}
                    disabled={!manualCoords}
                    step={0.000001}
                    stringMode={false}
                  />
                </Form.Item>

                <Form.Item
                  name="lon"
                  label="Längengrad (lon)"
                  rules={manualCoords ? [{ type: "number", min: -180, max: 180, message: "Wert muss zwischen -180 und 180 liegen" }] : []}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={manualCoords ? "z. B. 13.404954" : "Wird automatisch generiert"}
                    disabled={!manualCoords}
                    step={0.000001}
                    stringMode={false}
                  />
                </Form.Item>
              </>
            )}
          </div>
        </Col>
      </Row>

      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="Vorschau" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};
