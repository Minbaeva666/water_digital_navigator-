import "./RegisterAsPrivatePersonPage.css";
import React, {useEffect, useRef, useState} from "react";
import {Button, Checkbox, Col, Divider, Form, Input, Row, Select, Tooltip, Typography} from "antd";
import RegistrationRequestModal from "../../../components/Modals/RegistrationRequestModal/RegistrationRequestModal.tsx";
import PrivatPolicyModal from "../../../components/Modals/PrivacyPolicyAndTermsModal/PrivatPolicyModal.tsx";
import TermsModal from "../../../components/Modals/PrivacyPolicyAndTermsModal/TermsModal.tsx";
import {
    registerAsPrivatePerson,
    RegisterFormValues
} from "../../../services/registration/registerAsPrivatPersonService.ts";
import ValidatedInput from "../../../components/Form/validatedInput.tsx";
import {fetchSalutationTypes, TranslatedEnumOption} from "../../../services/input/inputService.ts";
import { NavLink } from "react-router-dom";

const {Title, Text} = Typography;
const {Option} = Select;


const RegisterAsPrivatePersonPage: React.FC = () => {
    const [form] = Form.useForm<RegisterFormValues>();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
    const [isPrivatPolicyModalOpen, setIsPrivatPolicyModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [agbsChecked, setAgbsChecked] = useState<boolean>(false);
    const [datenschutzChecked, setDatenschutzChecked] = useState<boolean>(false);
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

    const [salutationTypes, setSalutationTypes] = useState<TranslatedEnumOption[]>([]);
    const [salutationTypLoading, setSalutationTypLoading] = useState(false);
    const hasFetchedSalutationTypes = useRef(false);

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

    const checkFormValidity = () => {
        const values = form.getFieldsValue();
        const requiredFields = [
            'salutationType', 'firstName', 'lastName', 'password', 'confirmPassword', 'confirmPassword',
            'email', 'street', 'zip', 'city', 'country'
            ];

        const allRequiredFieldsFilled = requiredFields.every(field =>
            values[field] !== undefined && values[field] !== '');

        const matchingPassword = values["password"] == values["confirmPassword"];

        return (allRequiredFieldsFilled && agbsChecked && datenschutzChecked && matchingPassword);
    };

    const loadSalutationTypes = async () => {
        hasFetchedSalutationTypes.current = true;
        setSalutationTypLoading(true);
        const types = await fetchSalutationTypes();
        setSalutationTypes(types);
        setSalutationTypLoading(false);
    };

    // Überprüfe den Status der Pflichtfelder und aktualisiere isSubmitDisabled
    useEffect(() => {
        setIsSubmitDisabled(!checkFormValidity());

        if (!hasFetchedSalutationTypes.current) {
            loadSalutationTypes();
        }

    }, [form, agbsChecked, datenschutzChecked]);

    const onFinish = async (values: RegisterFormValues) => {
        setLoading(true);
        try {
            await registerAsPrivatePerson(values, () => {
                setIsModalOpen(true);
            });
        } catch {

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Row justify="center">
                <Col xs={20} sm={32} md={20} lg={16} xl={14} xxl={12}>
                    <Title level={2} style={{textAlign: "center"}}>
                        Registrierung als Privatperson
                    </Title>
                    <Text type="secondary" style={{display: "block", textAlign: "center"}}>
                        Für Ihre Registrierung benötigen wir Ihre persönlichen Informationen.
                    </Text>
                    <Text type="secondary" style={{display: "block", textAlign: "center", marginBottom: 24}}>
                        Mit <span className="required">*</span>markierte Felder sind Pflichtfelder.
                    </Text>

                    <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={() => setIsSubmitDisabled(!checkFormValidity())}>
                        <Row justify="center" gutter={{xs: 8, sm: 16, md: 24, lg: 88}}>
                            <Col xs={20} sm={32} md={14} lg={12}>
                                <Form.Item name="salutationType" label={"Anrede"} rules={[{
                                    required: true,
                                }]}>
                                    <Select
                                        placeholder="Anrede auswählen"
                                        loading={salutationTypLoading}
                                        disabled={salutationTypLoading}
                                    >
                                        {salutationTypes.map(type => (
                                            <Option key={type.value} value={type.value}>
                                                {type.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <ValidatedInput
                                    name="title"
                                    label="Titel"
                                />
                                <Form.Item name="firstName" label="Vorname" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="lastName" label="Nachname" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="email" label="Kontakt-Email" rules={[{
                                    required: true,
                                    type: "email",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="password" label="Passwort"
                                           rules={[{required: true, message: "Bitte geben Sie ein Passwort ein!"}]}>
                                    <Input.Password/>
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Passwort wiederholen"
                                    dependencies={["password"]}
                                    hasFeedback
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[
                                        {required: true, message: "Bitte wiederholen Sie Ihr Passwort!"},
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("Passwörter stimmen nicht überein!"));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password/>
                                </Form.Item>
                            </Col>


                            <Col xs={20} sm={32} md={14} lg={12}>
                                <Form.Item name="phonenumber" label="Telefonnummer" rules={[{
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="street" label="Straße" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="zip" label="Postleitzahl" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="city" label="Stadt" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item name="country" label="Land" rules={[{
                                    required: true,
                                    type: "string",
                                }]}>
                                    <Select
                                                        placeholder="Land auswählen"
                                                        showSearch
                                                        optionFilterProp="children"
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
                            </Col>
                        </Row>


                        <Row justify="center">
                            <Col
                                flex={1}
                                xs={20} sm={32} md={14} lg={18} xl={18} xxl={15}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center"
                                }}
                            >
                                <Checkbox
                                    style={{
                                        marginTop: "30px",
                                        marginBottom: "30px",
                                        maxWidth: "600px",
                                        textAlign: "left"
                                    }}
                                    onChange={() => {
                                        setAgbsChecked(!agbsChecked);
                                        setDatenschutzChecked(!datenschutzChecked);
                                    }}
                                >
                                    <span className="required">*</span>
                                    Ja, ich möchte mich registrieren. Ich habe die{" "}
                                    <span onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsPrivatPolicyModalOpen(true)
                                    }}
                                          style={{color: "#1677ff", cursor: "pointer"}}
                                    >Datenschutzerklärung</span>{" "}und die{" "}
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsTermsModalOpen(true)
                                        }}
                                        style={{color: "#1677ff", cursor: "pointer"}}
                                    >Nutzungsbedingungen</span>{" "}gelesen und bin damit einverstanden.
                                </Checkbox>
                            </Col>
                        </Row>


                        <Form.Item style={{textAlign: "center"}}>
                            <Tooltip
                                title="Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie der Datenschutzerklärung und Nutzungsbedingung zu, um die Registrierung absenden zu können."
                                open={tooltipVisible && isSubmitDisabled}
                            >
                                <div
                                    style={{display: "inline-block"}}
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

                    <Divider/>

                    <Text type="secondary" style={{paddingBottom: "30px", textAlign: "center", display: "block"}}>
                        Oder doch lieber als Vertreter einer Organisation registrieren? <NavLink
                        to="/login/registration/register-as-representative">Dann klicke Sie hier!</NavLink>
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
    )
        ;
};

export default RegisterAsPrivatePersonPage;