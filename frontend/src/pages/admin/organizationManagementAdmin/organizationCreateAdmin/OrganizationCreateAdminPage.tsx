import { useEffect, useState, useCallback } from "react";
import { Form, message, TabsProps } from "antd";
import { useNavigate } from "react-router-dom";

import { organizationService } from "../../../../services/organization/organizationService";
import { CommonOrganizationTabComponent } from "../../../../components/admin/organizationTabs/CommonOrganizationTabComponent.tsx";
import { RepresentativeTabComponent } from "../../../../components/admin/organizationTabs/RepresentativeTabComponent.tsx";
import { OrganizationFormValues } from "../../../../types/dtos/Organization.dto.ts";
import CreateEditView from "../../../../components/CreateEditView/CreateEditView.tsx";
import isEqual from "lodash.isequal";
import { imagesDiffer } from "../../../../utils/formDataHelper.ts";
import { OrganizationState } from "../../../../types/constants/enums.ts";
import {REQUIRED_COMMON} from "../../../../services/organization/organizationAdminRequired.ts";

const TAB_KEYS = ["COMMON" /*, "USERS", "DIGITAL_SOLUTIONS"*/] as const;
type TabKey = typeof TAB_KEYS[number];

/** Wert vorhanden (typabhängig) */
const hasValue = (v: any): boolean => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return Number.isFinite(v);
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
};

export default function OrganizationCreateAdminPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm<OrganizationFormValues>();
    const [activeTab, setActiveTab] = useState<TabKey>("COMMON");
    const [isChanged, setIsChanged] = useState(false);
    const [initialValues, setInitialValues] = useState<OrganizationFormValues | null>(null);
    const [tabValid, setTabValid] = useState<Record<TabKey, boolean>>({ COMMON: false });

    const isFormValid = Object.values(tabValid).every(Boolean);
    const onTabValidityChange = (tab: TabKey, valid: boolean) => {
        setTabValid(prev => (prev[tab] === valid ? prev : { ...prev, [tab]: valid }));
    };

    // Felder beobachten
    const organizationId = Form.useWatch<number | undefined>("id", form);
    const organizationState = Form.useWatch<OrganizationState>("organizationState", form) ?? "LITE";

    // Initialwerte einmalig merken
    useEffect(() => {
        setInitialValues(form.getFieldsValue(true) as OrganizationFormValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // nur beim Mount

    /** Validität für den COMMON-Tab neu berechnen */
    const recalcCommonValidity = useCallback(
        (values: OrganizationFormValues) => {
            const required = REQUIRED_COMMON[organizationState] ?? [];
            const requiredFilled = required.every(key => hasValue((values as any)[key]));
            const noFieldErrors = form.getFieldsError(required).every(e => e.errors.length === 0);
            onTabValidityChange("COMMON", requiredFilled && noFieldErrors);
        },
        [form, organizationState] // STABIL: keine Funktionsaufrufe hier, nur Referenzen
    );

    /** Wird bei JEDEM Form-Wertwechsel aufgerufen */
    const handleValuesChange = () => {
        const values = form.getFieldsValue(true) as OrganizationFormValues;

        // Pflichtfelder prüfen (kein Hook, reine Funktion)
        recalcCommonValidity(values);

        // Änderungen erkennen
        if (initialValues) {
            const normalize = (v: OrganizationFormValues) => ({
                name: v.name?.trim(),
                email: v.email?.trim(),
                street: v.street?.trim(),
                zip: typeof v.zip === "number" ? v.zip : v.zip?.trim(),
                city: v.city?.trim(),
                countryCode: v.countryCode?.trim(),
                regionId: v.regionId ?? null,
                organizationType: v.organizationType,
                website: v.website?.trim(),
                users: (v.users ?? []).map(u => u.id).sort(),
                logoBase64: v.logoBase64,
            });

            const formChanged = !isEqual(normalize(values), normalize(initialValues));
            const logoChanged = imagesDiffer(values.logoBase64, initialValues.logoBase64);
            setIsChanged(formChanged || logoChanged);
        }
    };

    /** Wenn sich der organizationState ändert, ändert sich die Pflichtfelder-Liste → neu prüfen */
    useEffect(() => {
        const values = form.getFieldsValue(true) as OrganizationFormValues;
        recalcCommonValidity(values);
    }, [organizationState, form, recalcCommonValidity]);

    const handleSave = async () => {
        try {
            const payload = form.getFieldsValue(true) as OrganizationFormValues;
                        console.log("Server получил:"); 

            const created = await organizationService.createOrganization(payload);
            message.success("Organisation erfolgreich erstellt.");
            navigate(`/admin/organization-management/organization/${created.id}/edit`, { replace: true });
        } catch (err: any) {
            console.error("Fehler beim Speichern der Organisation:", err);
            console.log("Server response:", err?.response?.data); 
            const serverMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Fehler beim Speichern";

    message.error(serverMessage);
            message.error(typeof err === "string" ? err : err?.message ?? "Fehler beim Speichern");
        }
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "COMMON",
            label: "Allgemein",
            children: <CommonOrganizationTabComponent form={form} key={`common-${organizationState}`}/>,
        },
        ...(organizationId
            ? [
                {
                    key: "USERS",
                    label: "Vertreter",
                    children: <RepresentativeTabComponent form={form} />,
                },
            ]
            : []),
    ];

    const handleTabChange = async (key: string) => {
        try {
            if (activeTab === "COMMON") {
                await form.validateFields();
            }
            setActiveTab(key as TabKey);
        } catch {
            /* Validation-Error ignorieren */
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
            >
                <CreateEditView
                    title="Organisation anlegen"
                    onBack={() => navigate("/admin/organization-management", { replace: true })}
                    isCreateMode={false}
                    onSave={handleSave}
                    label="Organisation"
                    tabs={tabItems}
                    activeTabKey={activeTab}
                    onTabChange={handleTabChange}
                    isFormValid={isFormValid}
                    isChanged={isChanged}
                />
            </Form>
        </div>
    );
}
