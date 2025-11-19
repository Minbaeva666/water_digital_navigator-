import {Col, Form, Row, Tabs, TabsProps, Typography} from "antd";
import FaqEditorComponent from "../../../components/faqEditor/FaqEditorComponent.tsx";
import {AppFormValues} from "../../../forms/app/AppFormValues.ts";
import {useState} from "react";
import "./AppManagementAdminPage.less";
import TermsOfUseEditorComponent from "../../../components/termsOfUse/TermsOfUseEditorComponent.tsx";
import ImprintStatementEditorComponent
    from "../../../components/imprintStatementEditor/ImprintStatementEditorComponent.tsx";
import PrivacyPolicyEditorComponent from "../../../components/privacyPolicyEditor/PrivacyPolicyEditorComponent.tsx";
import AccessibilityStatementEditorComponent
    from "../../../components/accessibilityStatementEditor/AccessibilityStatementEditorComponent.tsx";
import PublicPdfEditorComponent from "../../../components/publicPdfEditor/PublicPdfEditorComponent.tsx";
const { Title } = Typography;


const TAB_KEYS = ["IMPRINT_STATEMENT", "PRIVACY_POLICY", "ACCESSIBILITY_STATEMENT", "TERMS_OF_USE", "FAQ"] as const;
type TabKey = typeof TAB_KEYS[number];


export default function AppManagementAdminPage() {
    const [form] = Form.useForm<AppFormValues>();
    const [activeTab, setActiveTab] = useState<TabKey>("IMPRINT_STATEMENT");

    // Tabs
    const tabItems: TabsProps["items"] = [
        {key: "IMPRINT_STATEMENT", label: "Impressum", children: <ImprintStatementEditorComponent/>},
        {key: "PRIVACY_POLICY", label: "Datenschutz", children: <PrivacyPolicyEditorComponent/>},
        {key: "ACCESSIBILITY_STATEMENT", label: "Barrierefreiheit", children: <AccessibilityStatementEditorComponent/>},
        {key: "TERMS_OF_USE", label: "Nutzungsbedingungen", children: <TermsOfUseEditorComponent/>},
        {key: "FAQ", label: "FAQ", children: <FaqEditorComponent/>},
        {key: "PDF", label: "Steckbrief", children: <PublicPdfEditorComponent/>},
    ];


    return (
        <div className="appManagementContainer">
            {/* fester Kopfbereich (scrollt nicht) */}
            <div className="create-edit-header">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>App Management</Title>
                    </Col>
                    <Col>
                        {/* optional: Aktionen / Buttons */}
                    </Col>
                </Row>
            </div>

            {/* eigener Scroll-Container */}
            <div className="create-edit-body">
                <Form form={form} layout="vertical">
                    <Tabs
                        items={tabItems}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as TabKey)}
                        destroyOnHidden={true}
                    />
                </Form>
            </div>
        </div>
    );
}