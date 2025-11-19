import { Form, message, TabsProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { userService } from "../../../../services/userService/userService.ts";
import { mapUserDtoToForm } from "../../../../utils/user.mapper.ts";
import { UserFormValues } from "../../../../types/dtos/User.dto.ts";
import isEqual from "lodash.isequal";
import CreateEditView from "../../../../components/CreateEditView/CreateEditView.tsx";
import CommonUserTabComponent from "../../../../components/admin/userAdminTabs/CommonUserTabComponent.tsx";

const TAB_KEYS = ["COMMON"] as const;
type TabKey = typeof TAB_KEYS[number];

export default function UserEditAdminPage() {
    const navigate = useNavigate();
    const tabFromState = (useLocation().state as { tab?: string })?.tab;
    const { id } = useParams<{ id?: string }>();
    const [form] = Form.useForm<UserFormValues>();
    const [activeTab, setActiveTab] = useState<TabKey>("COMMON");
    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- Tab-Validität ---
    const [tabValid, setTabValid] = useState<Record<TabKey, boolean>>({
        COMMON: false,
    });
    const isFormValid = Object.values(tabValid).every((v) => v);
    const onTabValidityChange = (tab: TabKey, valid: boolean) => {
        setTabValid((prev) => ({ ...prev, [tab]: valid }));
    };

    // ---------- Normalizer + Baseline ----------
    const normalize = (v: UserFormValues) => ({
        id: v.id ?? null,
        firstName: v.firstName?.trim() ?? "",
        lastName: v.lastName?.trim() ?? "",
        email: v.email?.trim() ?? "",
        title: v.title?.trim() ?? "",
        phonenumber: v.phonenumber?.trim() ?? "",
        organizationId: v.organizationId ?? null,
        role: v.role ?? null,
        salutationType: v.salutationType ?? null,
    });
    type Baseline = ReturnType<typeof normalize>;

    const initialValuesRef = useRef<Baseline | null>(null);
    const originalTitleRef = useRef<{ firstName?: string; lastName?: string; email?: string }>({});

    // ---------- Daten laden ----------
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const dto = await userService.fetchUser(id);
                if (!dto) {
                    message.error("User wurde nicht gefunden.");
                    navigate("/admin/user-management");
                    return;
                }
                const base = mapUserDtoToForm(dto);
                form.setFieldsValue(base);

                initialValuesRef.current = normalize(base);
                originalTitleRef.current = {
                    firstName: base.firstName,
                    lastName: base.lastName,
                    email: base.email,
                };

                // Common-Tab initial als gültig markieren, wenn Pflichtfelder gefüllt sind
                const commonValid =
                    !!base.firstName?.trim() &&
                    !!base.lastName?.trim() &&
                    !!base.email?.trim() &&
                    !!base.role &&
                    !!base.salutationType;
                onTabValidityChange("COMMON", commonValid);

                setIsChanged(false);
            } catch (e) {
                console.error(e);
                message.error("Fehler beim Laden des Users.");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ---------- Änderungen + Validität ----------
    const handleValuesChange = () => {
        const values = form.getFieldsValue(true) as UserFormValues;

        const { firstName, lastName, email, role, salutationType } = values;

        const commonValid =
            !!firstName?.trim() &&
            !!lastName?.trim() &&
            !!email?.trim() &&
            !!role &&
            !!salutationType;

        onTabValidityChange("COMMON", commonValid);

        if (initialValuesRef.current) {
            const formChanged = !isEqual(normalize(values), initialValuesRef.current);
            setIsChanged(formChanged);
        }
    };

    const handleTabChange = async (key: string) => {
        try {
            await form.validateFields();
            setActiveTab(key as TabKey);
        } catch {
            // Validierungsfehler => Tabwechsel blockieren
        }
    };

    // ---------- Speichern ----------
    const handleSave = async () => {
        try {
            const payload = form.getFieldsValue(true) as UserFormValues;

            if (!payload.id) {
                message.error("Ungültige User-ID.");
                return;
            }

            await userService.editUser(payload);
            message.success("User erfolgreich gespeichert.");
            setIsChanged(false);

            // Baseline nach erfolgreichem Speichern neu setzen
            initialValuesRef.current = normalize(payload);
            // Optional: Titelquelle aktualisieren (falls Namen geändert wurden)
            originalTitleRef.current = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
            };
        } catch (err: any) {
            console.error("editUser error:", err);
            message.error(err?.message ?? "Fehler beim Ändern des Users");
        }
    };

    // ---------- Löschen ----------
    const handleDelete = async () => {
        const uid = form.getFieldValue("id");

        if (!uid) {
            message.error("ID fehlt.");
            return;
        }

        try {
            await userService.deleteUser(uid);
            navigate("/admin/user-management");
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Löschen fehlgeschlagen");
        }
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "COMMON",
            label: "Allgemein",
            children: <CommonUserTabComponent form={form} />,
        },
    ];

    const titleText = (() => {
        const fn = originalTitleRef.current.firstName?.trim();
        const ln = originalTitleRef.current.lastName?.trim();
        const full = [fn, ln].filter(Boolean).join(" ");
        return full || originalTitleRef.current.email || "Benutzer bearbeiten";
    })();

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
                disabled={loading}
            >
                <CreateEditView
                    title={titleText}
                    onBack={() =>
                        navigate("/admin/user-management", {
                            replace: true,
                            state: { tab: tabFromState },
                        })
                    }
                    isCreateMode={false}
                    onSave={handleSave}
                    onTabChange={handleTabChange}
                    label="Benutzer"
                    tabs={tabItems}
                    showDelete={true}
                    onDelete={handleDelete}
                    activeTabKey={activeTab}
                    isFormValid={isFormValid}
                    isChanged={isChanged}
                />
            </Form>
        </div>
    );
}
