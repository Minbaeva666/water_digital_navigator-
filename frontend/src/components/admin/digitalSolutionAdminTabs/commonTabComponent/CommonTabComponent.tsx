import React, {useEffect, useRef, useState} from "react";
import {Button, Col, DatePicker, Form, FormInstance, Input, Popover, Radio, Row, Select} from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";

import {
    fetchMaturityDegrees, fetchDigitalSolutionStateTypes,
    fetchOfferingCategoryTypes,
    TranslatedEnumOption, fetchPublishedByTypes,
} from "../../../../services/input/inputService";
import {userService} from "../../../../services/userService/userService";
import {UserMinimalDto} from "../../../../types/dtos/User.dto.ts";
import {InfoCircleOutlined} from "@ant-design/icons";
import {DigitalSolutionFormValues} from "../../../../forms/digital-solution/DigitalSolutionFormValues.ts";
import GenericModal from "../../../Modals/genericModal/GenericModal.tsx";
import {DigitalSolutionState} from "../../../../types/constants/enums.ts";

const {Option} = Select;

interface CommonTabComponentProps {
    form: FormInstance<DigitalSolutionFormValues>;
    onFormChange?: () => void;
}

const CommonTabComponent: React.FC<CommonTabComponentProps> = ({
                                                                   form,
                                                                   onFormChange
                                                               }) => {
    const presentedByUserId = Form.useWatch('presentedByUserId', form);
    const solutionState = Form.useWatch("state", form);

    // Helper: required nur, wenn State ≠ DRAFT
    const requiredRule = (message: string) =>
        solutionState !== DigitalSolutionState.DRAFT ? [{required: true, message}] : [];

    const hasFetchedOfferingCategoryTypes = useRef(false);
    const [offeringCategoryTypesLoading, setOfferingCategoryTypesLoading] = useState(false);
    const [offeringCategoryTypes, setOfferingCategoryTypes] = useState<TranslatedEnumOption[]>([]);

    const [users, setUsers] = useState<UserMinimalDto[]>([]);
    const [disableCompany, setDisableCompany] = useState(true);
    const [disablePerson, setDisablePerson] = useState(true);
    const hasFetchedMaturityDegrees = useRef(false);
    const [maturityDegreesLoading, setMaturityDegreesLoading] = useState(false);
    const [maturityDegrees, setMaturityDegrees] = useState<TranslatedEnumOption[]>([]);

    const hasFetchedDigitalSolutionStateTypes = useRef(false);
    const [digitalSolutionStateTypesLoading, setDigitalSolutionStateTypesLoading] = useState(false);
    const [digitalSolutionStateTypes, setDigitalSolutionStateTypes] = useState<TranslatedEnumOption[]>([]);

    const publishedBy = Form.useWatch("publishedBy", form);
    const hasFetchedPublishedByTypes = useRef(false);
    const [publishedByTypesLoading, setPublishedByTypesLoading] = useState(false);
    const [publishedByTypes, setPublishedByTypes] = useState<TranslatedEnumOption[]>([]);
    const isWeb = publishedBy === "WEB";
    const isPublication = publishedBy === "PUBLICATION";
    const showPublishedSource = isWeb || isPublication;

    const [presenterChangeOpen, setPresenterChangeOpen] = useState(false);
    const [presenterChangeText, setPresenterChangeText] = useState<React.ReactNode>(null);
    const prevPresenterIdRef = useRef<string | null>(null);


    // initial mit aktuellem Form-Wert befüllen (kein Popup beim ersten Render)
    useEffect(() => {
        prevPresenterIdRef.current = form.getFieldValue("presentedByUserId") ?? null;
    }, []);


    useEffect(() => {
        const user = users.find(u => u.id === presentedByUserId);

        if (!presentedByUserId) {
            setDisableCompany(true);
            setDisablePerson(true);
            return;
        }

        if (user?.organizationId) {
            setDisableCompany(false);
            setDisablePerson(false);
            return;
        }

        setDisableCompany(true);
        setDisablePerson(false);
    }, [users, presentedByUserId]);

    useEffect(() => {
        const loadData = async () => {
            if (!hasFetchedOfferingCategoryTypes.current) {
                hasFetchedOfferingCategoryTypes.current = true;
                setOfferingCategoryTypesLoading(true);
                const types = await fetchOfferingCategoryTypes();
                setOfferingCategoryTypes(types);
                setOfferingCategoryTypesLoading(false);
            }

            if (!hasFetchedPublishedByTypes.current) {
                hasFetchedPublishedByTypes.current = true;
                setPublishedByTypesLoading(true);
                const types = await fetchPublishedByTypes();
                setPublishedByTypes(types);
                setPublishedByTypesLoading(false);
            }

            if (!hasFetchedDigitalSolutionStateTypes.current) {
                hasFetchedDigitalSolutionStateTypes.current = true;
                setDigitalSolutionStateTypesLoading(true);
                const types = await fetchDigitalSolutionStateTypes();
                setDigitalSolutionStateTypes(types);
                setDigitalSolutionStateTypesLoading(false);
            }

            if (!hasFetchedMaturityDegrees.current) {
                hasFetchedMaturityDegrees.current = true;
                setMaturityDegreesLoading(true);
                const types = await fetchMaturityDegrees();
                setMaturityDegrees(types);
                setMaturityDegreesLoading(false);
            }

            const us = await userService.fetchUsersMinimal();
            setUsers(us);
        };
        loadData();
    }, []);


    const handlePresentedByUserIdChange = (userId: string | null) => {
        const nextId = userId ?? null;
        const prevId = prevPresenterIdRef.current;

        // User + Org ermitteln
        const user = users.find(u => u.id === nextId);
        const orgId = user?.organizationId ?? null;
        const orgName = user?.organizationName ?? null;

        // Formularwert setzen
        form.setFieldsValue({
            presentedByUser: {
                id: nextId ?? "",
                organizationId: user?.organizationId ?? undefined
            },
        });

        // Vorherige Listen holen
        const prevPartners = (form.getFieldValue("projectPartnerIds") as string[] | undefined) ?? [];
        const prevUsers = (form.getFieldValue("solutionUserIds") as string[] | undefined) ?? [];

        // Neue Listen (nur filtern, wenn es eine orgId gibt)
        const nextPartners = orgId ? prevPartners.filter(id => id !== orgId) : prevPartners;
        const nextUsers = orgId ? prevUsers.filter(id => id !== orgId) : prevUsers;

        // Entfernt?
        const removedInPartners = nextPartners.length !== prevPartners.length;
        const removedInUsers = nextUsers.length !== prevUsers.length;

        // Werte zurück in die Form
        form.setFieldsValue({
            projectPartnerIds: nextPartners,
            solutionUserIds: nextUsers,
        });

        const display = <strong>{orgName ?? orgId}</strong>;

        if (prevId !== nextId && orgId && (removedInPartners || removedInUsers)) {
            setPresenterChangeText(
                removedInPartners && removedInUsers ? (
                    <>Durch die Änderung der verantwortlichen Person wurde {display} als zugehörige Organisation bei
                        den <b>Projektpartnern</b> und den <b>Anwendungsorganisationen</b> entfernt!</>
                ) : removedInPartners ? (
                    <>Durch die Änderung der verantwortlichen Person wurde {display} als zugehörige Organisation bei
                        den <b>Projektpartnern</b> entfernt!</>
                ) : (
                    <>Durch die Änderung der verantwortlichen Person wurde {display} als zugehörige Organisation bei
                        den <b>Anwendungsorganisationen</b> entfernt!</>
                )
            );
            setPresenterChangeOpen(true);
        }
        prevPresenterIdRef.current = nextId;

        // UI-Enable/Disable + Repräsentations-Flag
        if (!nextId) {
            setDisableCompany(true);
            setDisablePerson(true);
        } else if (orgId) {
            setDisableCompany(false);
            setDisablePerson(false);
            form.setFieldsValue({solutionPresentedByUser: false});
        } else {
            setDisableCompany(true);
            setDisablePerson(false);
            form.setFieldsValue({solutionPresentedByUser: true});
        }

        onFormChange?.();
    };

    return (
        <Row gutter={64}>
            <Col xs={24} md={12} xl={10}>
                <Form.Item
                    name="state"
                    label="Status der Digitalen Lösung"
                    rules={[{required: true}]}
                >
                    <Select placeholder="Status der Digitalen Lösung"
                            loading={digitalSolutionStateTypesLoading}>
                        {digitalSolutionStateTypes.map((type) => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Titel der digitalen Lösung/Projekt"
                    rules={[
                        ...requiredRule('Der Name der Digitalen Lösung ist erforderlich'),
                        {max: 120, message: 'Maximal 120 Zeichen erlaubt'},
                    ]}
                >
                    <Input placeholder="Titel"/>
                </Form.Item>

                <Form.Item
                    name="link"
                    label="Link zur digitalen Lösung/Projekt"
                    rules={[
                        ...requiredRule('Ein Link zur Digitalen Lösung ist erforderlich'),
                        {type: 'url', message: 'Bitte geben Sie eine gültige URL ein (z. B. https://example.com)'}
                    ]}
                >
                    <Input placeholder="Link"/>
                </Form.Item>

                <Form.Item
                    name="maturityDegree"
                    label="Reifegrad"
                    rules={requiredRule('Der Reifegrad der Digitalen Lösung ist erforderlich')}
                >
                    <Select placeholder="Reifegrad" loading={maturityDegreesLoading}>
                        {maturityDegrees.map((type) => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="offeringCategory"
                    label="Art der digitalen Lösung"
                    rules={requiredRule('Die Art der Digitalen Lösung ist erforderlich')}
                >
                    <Select placeholder="Art" loading={offeringCategoryTypesLoading}>
                        {offeringCategoryTypes.map((type) => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="shortDescription"
                    label="Kurzbeschreibung"
                    rules={[
                        ...requiredRule('Eine Kurzbeschreibung mit min. 25 Zeichen ist erforderlich'),
                        {min: 25}
                    ]}
                >
                    <TextArea rows={5} maxLength={300} minLength={25} showCount placeholder="Kurzbeschreibung"/>
                </Form.Item>

                <Form.Item
                    name="longDescription"
                    label="Allgemeine Beschreibung"
                    rules={[
                        ...requiredRule('Eine allgemeine Beschreibung mit min. 25 Zeichen ist erforderlich'),
                        {min: 25}
                    ]}
                >
                    <TextArea rows={10} maxLength={1500} minLength={25} showCount
                              placeholder="Allgemeine Beschreibung"/>
                </Form.Item>

                <Form.Item
                    name="goalDescription"
                    label="Ziel/Nutzen"
                    rules={[
                        ...requiredRule('Eine Beschreibung mit min. 25 Zeichen zum Ziel/Nutzen ist erforderlich'),
                        {min: 25}
                    ]}
                >
                    <TextArea rows={5} maxLength={600} minLength={25} showCount
                              placeholder="Beschreibung zum Ziel/Nutzen"/>
                </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={10}>
                <Form.Item
                    name="technicalDescription"
                    label="Technische Daten"
                    rules={[
                        ...requiredRule('Eine technische Beschreibung mit min. 25 Zeichen ist erforderlich'),
                        {min: 25}
                    ]}
                >
                    <TextArea rows={5} maxLength={600} minLength={25} showCount
                              placeholder="Beschreibung zu technische Daten"/>
                </Form.Item>

                <Form.Item name="efficiencyDescription" label="Effizienz">
                    <TextArea rows={5} maxLength={600} showCount placeholder="Beschreibung zur Effizienz"/>
                </Form.Item>

                <Form.Item name="processDescription" label="Prozess/Vorgehensmodell">
                    <TextArea rows={5} maxLength={600} showCount
                              placeholder="Beschreibung zum Prozess/Vorgehensmodell"/>
                </Form.Item>

                <Form.Item name="socialRelevanceDescription" label="Gesellschaftliche Relevanz">
                    <TextArea rows={5} maxLength={600} showCount
                              placeholder="Beschreibung zur gesellschaftlichen Relevanz"/>
                </Form.Item>

                <Form.Item
                    name="presentedByUserId"
                    label="Ansprechpartner"
                >
                    <Select
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        placeholder="Ansprechpartner auswählen"
                        loading={users.length === 0}
                        onChange={(val) => handlePresentedByUserIdChange((val as string) ?? null)}
                    >
                        <Select.Option value={""}>kein Ansprechpartner</Select.Option>
                        {users.map((u) => (
                            <Option key={u.id} value={u.id}>
                                {u.firstName} {u.lastName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {presentedByUserId && (
                    <Form.Item
                        key={presentedByUserId}
                        name="solutionPresentedByUser"
                        label={
                            <span>
                                Wer repräsentiert die Lösung auf Digital Lotse Wasser?
                                <Popover
                                    content={
                                        <div style={{maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word'}}>
                                            Sollen die Kontaktinformationen des Unternehmens oder die des
                                            Ansprechpartners bei der digitalen Lösung angezeigt werden?
                                            Wenn die Person keiner Organisation angehört, dann kann nur sie ausgewählt
                                            werden.
                                        </div>
                                    }
                                    trigger="click"
                                >
                                    <Button
                                        type="link"
                                        icon={<InfoCircleOutlined/>}
                                        style={{
                                            padding: 5,
                                            height: 'auto',
                                            lineHeight: 1,
                                            verticalAlign: 'middle',
                                            gap: 5
                                        }}
                                    >
                                        Hilfe
                                    </Button>
                                </Popover>
                            </span>
                        }
                        rules={
                            presentedByUserId && solutionState !== DigitalSolutionState.DRAFT
                                ? [{required: true, message: 'Bitte wähle eine Option'}]
                                : []
                        }
                    >
                        <Radio.Group>
                            <Radio value={false} disabled={disableCompany}>Das Unternehmen</Radio>
                            <Radio value={true} disabled={disablePerson}>Die verantwortliche Person</Radio>
                        </Radio.Group>
                    </Form.Item>
                )}

                <Form.Item
                    name="readyForOperation"
                    label="Betriebsbereit ab"
                    getValueProps={(value: string) => {
                        if (!value) return {value: null};
                        const dateStr = value.includes("T") ? value.split("T")[0] : value;
                        const fmt = value.includes("T") ? "YYYY-MM-DD" : "DD.MM.YYYY";
                        return {value: dayjs(dateStr, fmt)};
                    }}
                    getValueFromEvent={(date: dayjs.Dayjs | null) => (date ? date.format("DD.MM.YYYY") : null)}
                >
                    <DatePicker style={{width: "100%"}} format="DD.MM.YYYY"/>
                </Form.Item>

                <Form.Item
                    name="createdAtOverride"
                    label="Anzeigedatum der Veröffentlichung"
                    getValueProps={(value: string) => {
                        if (!value) return {value: null};
                        const dateStr = value.includes("T") ? value.split("T")[0] : value;
                        const fmt = value.includes("T") ? "YYYY-MM-DD" : "DD.MM.YYYY";
                        return {value: dayjs(dateStr, fmt)};
                    }}
                    getValueFromEvent={(date: dayjs.Dayjs | null) => (date ? date.format("DD.MM.YYYY") : null)}
                >
                    <DatePicker style={{width: "100%"}} format="DD.MM.YYYY"/>
                </Form.Item>

                <Form.Item
                    name="publishedBy"
                    label="Veröffentlicht durch"
                    rules={requiredRule("Bitte wähle aus, wer veröffentlicht hat")}
                >
                    <Select
                        placeholder="Veröffentlicht durch"
                        loading={publishedByTypesLoading}
                    >
                        {publishedByTypes.map((type) => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {showPublishedSource && (
                    <Form.Item
                        name="publishedSource"
                        label="Quelle"
                        rules={[
                            ...(solutionState !== DigitalSolutionState.DRAFT
                                ? [{ required: true, message: "Bitte eine Quelle angeben" }]
                                : []),
                        ]}
                        preserve={false}
                    >
                        <Input
                            placeholder={
                                isWeb
                                    ? "Quelle (Link, Titel oder Kurzbeschreibung)"
                                    : "Zeitschrift / DOI / Titel / Medium"
                            }
                            allowClear
                            maxLength={400}
                        />
                    </Form.Item>
                )}

            </Col>

            <GenericModal
                open={presenterChangeOpen}
                title="ACHTUNG!"
                closable={false}
                text={presenterChangeText}
                onConfirm={() => setPresenterChangeOpen(false)}
                confirmText="OK"
            />
        </Row>
    );
};

export default CommonTabComponent;
