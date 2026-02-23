import "./RegisterAsRepresentativePage.css";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Divider,
  Checkbox,
  Tooltip,
  Upload,
  GetProp,
  Image,
  App,
  AutoComplete,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  registerAsRepresentative,
  RegisterFormValues,
} from "../../../services/registration/registerAsRepresentativeService.ts";
import PrivatPolicyModal from "../../../components/Modals/PrivacyPolicyAndTermsModal/PrivatPolicyModal.tsx";
import TermsModal from "../../../components/Modals/PrivacyPolicyAndTermsModal/TermsModal.tsx";
import RegistrationRequestModal from "../../../components/Modals/RegistrationRequestModal/RegistrationRequestModal.tsx";
import {
  fetchOrganizationTypes,
  fetchSalutationTypes,
  TranslatedEnumOption,
} from "../../../services/input/inputService.ts";
import { organizationService } from "../../../services/organization/organizationService.ts";

const countries = [
  { code: "DE", nameDe: "Deutschland", nameEn: "Germany" },
  { code: "AT", nameDe: "Österreich", nameEn: "Austria" },
  { code: "CH", nameDe: "Schweiz", nameEn: "Switzerland" },
  { code: "DK", nameDe: "Dänemark", nameEn: "Denmark" },
  { code: "PL", nameDe: "Polen", nameEn: "Poland" },
  { code: "CZ", nameDe: "Tschechien", nameEn: "Czech Republic" },
  { code: "FR", nameDe: "Frankreich", nameEn: "France" },
  { code: "LU", nameDe: "Luxemburg", nameEn: "Luxembourg" },
  { code: "BE", nameDe: "Belgien", nameEn: "Belgium" },
  { code: "NL", nameDe: "Niederlande", nameEn: "Netherlands" },
];

const { Title, Text } = Typography;
const { Option } = Select;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// Organization for dropdown
type OrganizationSuggestion = {
  id: string;
  name: string;
  email?: string | null;
  website?: string | null;
  organizationType?: string | null;
  street?: string | null;
  zip?: string | null;
  city?: string | null;
  countryCode?: string | null;
};

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const RegisterAsRepresentativePage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [agbsChecked, setAgbsChecked] = useState<boolean>(false);
  const [datenschutzChecked, setDatenschutzChecked] = useState<boolean>(false);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isPrivatPolicyModalOpen, setIsPrivatPolicyModalOpen] =
    useState<boolean>(false);
  const [organizationTypes, setOrganizationTypes] = useState<
    TranslatedEnumOption[]
  >([]);
  const [orgTypLoading, setOrgTypLoading] = useState(false);
  const hasFetchedOrganizationTypes = useRef(false);

  const [salutationTypes, setSalutationTypes] = useState<
    TranslatedEnumOption[]
  >([]);
  const [salutationTypLoading, setSalutationTypLoading] = useState(false);
  const hasFetchedSalutationTypes = useRef(false);


  const [organizations, setOrganizations] = useState<OrganizationSuggestion[]>(
    []
  );
  const [orgListLoading, setOrgListLoading] = useState(false);
  const hasFetchedOrganizations = useRef(false);


  const [isExistingOrgSelected, setIsExistingOrgSelected] = useState(false);

  const loadOrganizationTypes = async () => {
    hasFetchedOrganizationTypes.current = true;
    setOrgTypLoading(true);
    const types = await fetchOrganizationTypes();
    setOrganizationTypes(types);
    setOrgTypLoading(false);
  };

  const loadSalutationTypes = async () => {
    hasFetchedSalutationTypes.current = true;
    setSalutationTypLoading(true);
    const types = await fetchSalutationTypes();
    setSalutationTypes(types);
    setSalutationTypLoading(false);
  };

  const loadOrganizations = async () => {
    try {
      hasFetchedOrganizations.current = true;
      setOrgListLoading(true);
 
      const orgs = await organizationService.fetchOrganizationsBase();
      const mapped: OrganizationSuggestion[] = orgs.map((o: any) => ({
        id: o.id,
        name: o.name,
        email: o.email ?? null,
        website: o.website ?? null,
        organizationType: o.organizationType ?? null,
        street: o.street ?? null,
        zip: o.zip ?? null,
        city: o.city ?? null,
        countryCode: o.countryId ?? null,
      }));
      setOrganizations(mapped);
    } catch (e) {
      console.error("Fehler beim Laden der Organisationen:", e);
      message.error("Organisationen konnten nicht geladen werden.");
    } finally {
      setOrgListLoading(false);
    }
  };

  const checkFormValidity = () => {
    const values = form.getFieldsValue();

    type PersonalFieldKey = keyof Pick<
      RegisterFormValues,
      | "salutationType"
      | "firstName"
      | "lastName"
      | "email"
      | "password"
      | "confirmPassword"
    >;

    const personalFields: PersonalFieldKey[] = [
      "salutationType",
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
    ];

    const allPersonalFilled = personalFields.every((field) => {
      return values[field] !== undefined && values[field] !== "";
    });

    const matchingPassword =
      values["password"] && values["password"] === values["confirmPassword"];

    let orgPartValid = true;

    if (!isExistingOrgSelected) {
  type OrgFieldKey = keyof Pick<
    RegisterFormValues,
    | "orgName"
    | "orgEmail"
    | "orgWebsite"
    | "orgType"
    | "orgStreet"
    | "orgZip"
    | "orgCity"
    | "orgCountry"
  >;

  const orgRequired: OrgFieldKey[] = [
    "orgName",
    "orgEmail",
    "orgType",
    "orgStreet",
    "orgZip",
    "orgCity",
    "orgCountry",
  ];

  const allOrgFilled = orgRequired.every((field) => {
    return values[field] !== undefined && values[field] !== "";
  });

      orgPartValid = allOrgFilled;
    }

    return (
      allPersonalFilled &&
      orgPartValid &&
      agbsChecked &&
      datenschutzChecked &&
      matchingPassword
    );
  };

  useEffect(() => {
    setIsSubmitDisabled(!checkFormValidity());

    if (!hasFetchedOrganizationTypes.current) {
      loadOrganizationTypes();
    }

    if (!hasFetchedSalutationTypes.current) {
      loadSalutationTypes();
    }

    if (!hasFetchedOrganizations.current) {
      loadOrganizations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, fileList, agbsChecked, datenschutzChecked, isExistingOrgSelected]);

const onFinish = async (values: RegisterFormValues) => {
  setLoading(true);
  try {
    const usingExistingOrg = !!values.existingOrganizationId;

    // Nur wenn KEINE existierende Org gewählt wurde, darf ein Logo mitgeschickt werden.
    const file = !usingExistingOrg
      ? (fileList[0]?.originFileObj as File | undefined)
      : undefined;

    // Logo ist optional – wir schicken es nur, falls vorhanden
    await registerAsRepresentative(values, file);

    setIsModalOpen(true);
  } catch (error) {
    console.error("Error during registration:", error);
    if (error instanceof Error) {
      message.error("Error: " + error.message);
    } else {
      message.error("An unexpected error occurred. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};



  // Konfiguration des Upload-Bereichs
  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");

      if (!isImage) {
        message.error("Sie können nur Bilddateien hochladen!");
        return Upload.LIST_IGNORE;
      }

      const isAllowedType =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/svg+xml";
      if (!isAllowedType) {
        message.error("Nur JPG-, PNG- oder SVG-Logos sind erlaubt!");
        return Upload.LIST_IGNORE;
      }

      const isLt = file.size / 1024 / 1024 < 5;
      if (!isLt) {
        message.error("Das Bild muss kleiner als 5MB sein!");
        return Upload.LIST_IGNORE;
      }

      return false;
    },
    fileList,
    onChange({ fileList: newFileList }) {
      // Liste auf maximal eine Datei beschränken
      if (newFileList.length > 1) {
        setFileList([newFileList[newFileList.length - 1]]);
      } else {
        setFileList(newFileList);
      }
    },
    maxCount: 1,
    listType: "picture",
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // options for autocomplete
  const orgOptions = organizations.map((o) => ({
    value: o.name,
    label: o.name,
  }));

  return (
    <>
      <Row justify="center">
        <Col xs={20} sm={32} md={20} lg={16} xl={14} xxl={12}>
          <Title level={2} style={{ textAlign: "center" }}>
            Registrierung als Vertreter einer Organisation
          </Title>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center" }}
          >
            Für Ihre Registrierung benötigen wir Ihre persönlichen
            Informationen und die ihrer Organisation.
          </Text>
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Mit <span className="required">*</span> markierte Felder sind
            Pflichtfelder.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={() =>
              setIsSubmitDisabled(!checkFormValidity())
            }
          >
            <Row
              justify="center"
              gutter={{ xs: 8, sm: 16, md: 24, lg: 88 }}
            >
              {/* Persönliche Informationen */}
              <Col xs={20} sm={32} md={14} lg={12}>
                <Title level={4}>Persönliche Informationen</Title>
                <Form.Item name="existingOrganizationId" hidden>
  <Input type="hidden" />
</Form.Item>
                <Form.Item
                  name="salutationType"
                  label={"Anrede"}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    placeholder="Anrede auswählen"
                    loading={salutationTypLoading}
                    disabled={salutationTypLoading}
                  >
                    {salutationTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="title" label="Titel">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="firstName"
                  label={"Vorname"}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label={"Nachname"}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Kontakt-Email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phonenumber"
                  label="Kontakt-Telefonnummer"
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  label={"Passwort"}
                  hasFeedback
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Passwort wiederholen"
                  dependencies={["password"]}
                  hasFeedback
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    {
                      required: true,
                      message:
                        "Bitte wiederholen Sie Ihr Passwort!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          getFieldValue("password") === value
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "Passwörter stimmen nicht überein!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>

              {/* Organisationsinformationen */}
              <Col xs={20} sm={32} md={14} lg={12}>
                <Title level={4}>Angaben zu Ihrer Organisation</Title>

                {/* hidden field for existingOrganizationId */}
                <Form.Item name="existingOrganizationId" hidden>
                  <Input type="hidden" />
                </Form.Item>

                <Form.Item
  name="orgName"
  label={"Name"}
  rules={[
    {
      required: true,
      message: "Organisationsname ist erforderlich",
    },
    {
      min: 2,
      message: "Organisationsname muss mindestens 2 Zeichen lang sein",
    },
    {
      max: 120,
      message: "Organisationsname darf maximal 120 Zeichen lang sein",
    },
  ]}
>
  <Row gutter={8} align="middle">
    <Col flex="auto">
      <AutoComplete
        placeholder="Name der Organisation eingeben oder auswählen"
        options={orgOptions}
        onSelect={(value) => {
          const org = organizations.find((o) => o.name === value);
          if (!org) return;

          form.setFieldsValue({
            orgName: org.name,
            orgEmail: org.email || "",
            orgWebsite: org.website || "",
            orgType: org.organizationType || undefined,
            orgStreet: org.street || "",
            orgZip: org.zip || "",
            orgCity: org.city || "",
            orgCountry: org.countryCode || undefined,
            existingOrganizationId: org.id,
          });

          setIsExistingOrgSelected(true);
          setFileList([]);
        }}
        onChange={(val) => {
          const wasExisting = isExistingOrgSelected;

          const nextValues: any = {
            orgName: val,
            existingOrganizationId: undefined,
          };

          if (wasExisting) {
            nextValues.orgEmail = "";
            nextValues.orgWebsite = "";
            nextValues.orgType = undefined;
            nextValues.orgStreet = "";
            nextValues.orgZip = "";
            nextValues.orgCity = "";
            nextValues.orgCountry = undefined;
          }

          form.setFieldsValue(nextValues);

          if (wasExisting) {
            setIsExistingOrgSelected(false);
            setFileList([]);
          }
        }}
        disabled={orgListLoading}
        style={{ width: "100%" }}
      />
    </Col>
  </Row>
</Form.Item>


                <Form.Item
                  name="orgEmail"
                  label={"Email Ihrer Organisation"}
                  rules={[
                    {
                      required: true,
                      type: "email",
                    },
                  ]}
                >
                  <Input disabled={isExistingOrgSelected} />
                </Form.Item>
                <Form.Item
                  name="orgWebsite"
                  label={"Webseite Ihrer Organisation"}
                  rules={[
                    {
                      },
                  ]}
                >
                  <Input disabled={isExistingOrgSelected} />
                </Form.Item>
                <Form.Item
                  name="orgType"
                  label={"Organisations-Typ"}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    placeholder="Typ auswählen"
                    loading={orgTypLoading}
                    disabled={orgTypLoading || isExistingOrgSelected}
                  >
                    {organizationTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="orgStreet"
                  label={"Straße"}
                  rules={[
                    {
                      required: true,
                      message: "Straße ist erforderlich",
                    },
                    {
                      min: 2,
                      message: "Straße muss mindestens 2 Zeichen lang sein",
                    },
                  ]}
                >
                  <Input disabled={isExistingOrgSelected} />
                </Form.Item>
                <Form.Item
                  name="orgZip"
                  label={"Postleitzahl"}
                  rules={[
                    {
                      required: true,
                      message: "Postleitzahl ist erforderlich",
                    },
                    {
                      pattern: /^[0-9]{5}$/,
                      message: "Postleitzahl muss 5 Ziffern haben",
                    },
                  ]}
                >
                  <Input disabled={isExistingOrgSelected} />
                </Form.Item>
                <Form.Item
                  name="orgCity"
                  label="Stadt"
                  rules={[
                    {
                      required: true,
                      message: "Stadt ist erforderlich",
                    },
                    {
                      min: 2,
                      message: "Stadt muss mindestens 2 Zeichen lang sein",
                    },
                  ]}
                >
                  <Input disabled={isExistingOrgSelected} />
                </Form.Item>
                <Form.Item
                  name="orgCountry"
                  label="Land"
                  rules={[
                    {
                      required: true,
                      message: "Bitte wählen Sie ein Land",
                    },
                  ]}
                >
                  <Select
                    placeholder="Land auswählen"
                    showSearch
                    optionFilterProp="children"
                    disabled={isExistingOrgSelected}
                  >
                    {countries.map((country) => (
                      <Select.Option
                        key={country.code}
                        value={country.code}
                      >
                        {country.nameDe}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={"Logo Ihrer Organisation"}
                  // required={!isExistingOrgSelected}
                  extra="Unterstützte Formate: JPG, PNG, SVG"
                >
                  <div>
                    <Upload
                      {...uploadProps}
                      onPreview={handlePreview}
                      disabled={isExistingOrgSelected}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        disabled={isExistingOrgSelected}
                      >
                        Logo auswählen
                      </Button>
                    </Upload>
                    {previewImage && (
                      <Image
                        width={"10"}
                        wrapperStyle={{ display: "none" }}
                        preview={{
                          toolbarRender: () => null,
                          visible: previewOpen,
                          onVisibleChange: (visible) =>
                            setPreviewOpen(visible),
                          afterOpenChange: (visible) =>
                            !visible && setPreviewImage(""),
                          imageRender: (originalNode) => (
                            <div
                              style={{
                                width: "30vw",
                                maxWidth: "30vw",
                                overflow: "hidden",
                              }}
                            >
                              {originalNode}
                            </div>
                          ),
                        }}
                        src={previewImage}
                      />
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row justify="center">
              <Col
                flex={1}
                xs={20}
                sm={32}
                md={14}
                lg={18}
                xl={18}
                xxl={15}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Checkbox
                  style={{
                    marginTop: "30px",
                    marginBottom: "30px",
                    maxWidth: "600px",
                    textAlign: "left",
                  }}
                  onChange={() => {
                    setAgbsChecked(!agbsChecked);
                    setDatenschutzChecked(!datenschutzChecked);
                  }}
                >
                  <span className="required">*</span>
                  Ja, ich möchte mich registrieren. Ich habe die{" "}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsPrivatPolicyModalOpen(true);
                    }}
                    style={{ color: "#1677ff", cursor: "pointer" }}
                  >
                    Datenschutzerklärung
                  </span>{" "}
                  und die{" "}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTermsModalOpen(true);
                    }}
                    style={{ color: "#1677ff", cursor: "pointer" }}
                  >
                    Nutzungsbedingungen
                  </span>{" "}
                  gelesen und bin damit einverstanden.
                </Checkbox>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: "center" }}>
              <Tooltip
                title="Bitte füllen Sie alle Pflichtfelder aus, stimmen Sie der Datenschutzerklärung und Nutzungsbedingung zu, um die Registrierung absenden zu können."
                open={tooltipVisible && isSubmitDisabled}
              >
                <div
                  style={{ display: "inline-block" }}
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    disabled={isSubmitDisabled}
                    loading={loading}
                  >
                    Registrierung absenden
                  </Button>
                </div>
              </Tooltip>
            </Form.Item>
          </Form>

          <Divider />

          <Text
            type="secondary"
            style={{
              paddingBottom: "30px",
              textAlign: "center",
              display: "block",
            }}
          >
            Oder doch lieber als Privatperson registrieren?{" "}
            <NavLink to="/login/registration/register-as-private-person">
              Dann klicken Sie hier!
            </NavLink>
          </Text>
        </Col>
      </Row>

      <RegistrationRequestModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <PrivatPolicyModal
        isModalOpen={isPrivatPolicyModalOpen}
        setIsModalOpen={setIsPrivatPolicyModalOpen}
      />
      <TermsModal
        isModalOpen={isTermsModalOpen}
        setIsModalOpen={setIsTermsModalOpen}
      />
    </>
  );
};

export default RegisterAsRepresentativePage;
