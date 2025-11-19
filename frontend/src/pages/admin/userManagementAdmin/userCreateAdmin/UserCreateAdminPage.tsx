import {Form, message, TabsProps} from "antd";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {userService} from "../../../../services/userService/userService.ts";
import {UserFormValues} from "../../../../types/dtos/User.dto.ts";
import isEqual from "lodash.isequal";
import CreateEditView from "../../../../components/CreateEditView/CreateEditView.tsx";
import CommonUserTabComponent from "../../../../components/admin/userAdminTabs/CommonUserTabComponent.tsx";


const TAB_KEYS = ["COMMON"] as const;
type TabKey = typeof TAB_KEYS[number];

export default function UserCreateAdminPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm<UserFormValues>();
    const [activeTab, setActiveTab] = useState<TabKey>("COMMON");
    const tabFromState = (useLocation().state as { tab?: string })?.tab;
    const [isChanged, setIsChanged] = useState(false);
    const [initialValues, setInitialValues] = useState<UserFormValues | null>(null);
    const [tabValid, setTabValid] = useState<Record<TabKey, boolean>>({
        COMMON: false,
    });
    const isFormValid = Object.values(tabValid).every((v) => v);
    const onTabValidityChange = (tab: TabKey, valid: boolean) => {
        setTabValid((prev) => ({...prev, [tab]: valid}));
    };

    useEffect(() => {
        const current = form.getFieldsValue(true) as UserFormValues;
        setInitialValues(current);
    }, []);

    const handleValuesChange = () => {
        const values = form.getFieldsValue(true) as UserFormValues;

        const {
            firstName, lastName, email, role, salutationType
        } = values;

        // Prüfe Common‑Pflichtfelder
        const commonValid =
            !!firstName?.trim() &&
            !!lastName?.trim() &&
            !!email?.trim() &&
            !!role &&
            !!salutationType

        // Gesamtvalidität über alle Tabs
        onTabValidityChange("COMMON", commonValid);

        if (initialValues) {
            const normalize = (v: UserFormValues) => ({
                firstName: v.firstName?.trim(),
                lastName: v.lastName?.trim(),
                email: v.email?.trim(),
                role: v.role,
                salutationType: v.salutationType
            });

            const formChanged = !isEqual(normalize(values), normalize(initialValues));

            setIsChanged(formChanged);
            console.log("formChanged", formChanged);
        }
    };


    const handleSave = async () => {
        try {
            const payload = form.getFieldsValue(true);

            console.log("payload", payload);

            let created = await userService.createUser(payload);
            message.success("User und Organisation erfolgreich angelegt.");
            navigate(
                `/admin/user-management/user/${created.id}/edit`,
                {replace: true}
            );

        } catch (error: any) {
            message.error(error || "Speichern fehlgeschlagen");
        }
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "COMMON",
            label: "Allgemein",
            children: (
                <CommonUserTabComponent
                    form={form}
                />
            ),
        },
    ];

    const handleTabChange = async (key: string) => {
        try {
            if (activeTab === "COMMON") {
                await form.validateFields();
            } else {

            }
            setActiveTab(key as TabKey);
        } catch (err) {
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0,  }}
            >
                <CreateEditView
                    title="Benutzer anlegen"
                    onBack={() => {
                        navigate("/admin/user-management", {
                            replace: true,
                            state: { tab: tabFromState },
                        })
                    }}
                    isCreateMode={true}
                    onSave={handleSave}
                    onTabChange={handleTabChange}
                    label="Benutzer"
                    tabs={tabItems}
                    activeTabKey={activeTab}
                    isFormValid={isFormValid}
                    isChanged={isChanged}
                />
            </Form>
        </div>
    );
}
