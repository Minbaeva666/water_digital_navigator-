import React, {useState} from "react";
import {Button, Col, Row, Tabs, Typography, TabsProps, Tooltip} from "antd";
import {SaveOutlined, DeleteOutlined, LeftOutlined} from "@ant-design/icons";
import "./CreateEditView.less";
import GenericModal from "../Modals/genericModal/GenericModal.tsx";

const {Title} = Typography;

interface CreateEditViewProps {
    title: string;
    onBack: () => void;
    onSave?: () => void;
    label?: string;
    tabs: TabsProps["items"];
    activeTabKey: string;
    onTabChange?: (key: string) => void;
    onDelete?: () => void;
    showDelete?: boolean;
    /** Draft-Mode = aktueller Formular-State ist "DRAFT" */
    isCreateMode?: boolean;
    isChanged?: boolean;
    /** Im Draft egal; in Nicht-Draft echte Validität */
    isFormValid?: boolean;
    saveButtonIcon?: React.ReactNode;
    saveTooltipTextOverride?: string;
}

const CreateEditView: React.FC<CreateEditViewProps> = ({
                                                           title,
                                                           onBack,
                                                           onSave,
                                                           label = "",
                                                           tabs,
                                                           activeTabKey,
                                                           onTabChange,
                                                           onDelete,
                                                           showDelete = false,
                                                           isCreateMode,
                                                           isChanged,
                                                           isFormValid,
                                                           saveButtonIcon,
                                                           saveTooltipTextOverride,
                                                       }) => {
    const resourceName = label || title;

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const handleDeleteOpen = () => setIsDeleteModalOpen(true);
    const handleDeleteCancel = () => setIsDeleteModalOpen(false);
    const handleDeleteConfirm = () => {
        onDelete?.();
        setIsDeleteModalOpen(false);
    };

    // Back modal
    const [isBackModalOpen, setIsBackModalOpen] = useState(false);
    const handleBackClick = () => {
        if (isChanged) setIsBackModalOpen(true);
        else onBack();
    };
    const handleBackCancel = () => setIsBackModalOpen(false);
    const handleBackConfirm = () => {
        onBack();
        setIsBackModalOpen(false);
    };

    function getSaveTooltipText(): string {
        if (saveTooltipTextOverride) return saveTooltipTextOverride;

        if (isCreateMode) {
            if (!isChanged) {
                return "Template speichern erst möglich, wenn Änderungen gemacht wurden";
            }
            return `${label} anlegen`;
        }

        // Nicht-Draft:
        if (!isChanged) return "Speichern erst möglich, wenn Änderungen vorgenommen wurden";
        if (!isFormValid) return "Speichern erst möglich, wenn alle Pflichtfelder ausgefüllt wurden";
        return `${label} speichern`;
    }

    return (
        <div className="create-edit-view">
            <div className="create-edit-header">
                <Row gutter={32} className="fw-row">
                    <Col span={24}>
                        <Row justify="space-between" align="middle" gutter={0} wrap={false}>
                            <Col flex="auto">
                                <Title level={3} style={{ margin: 0 }}>{title}</Title>
                            </Col>

                            <Col>
                                <Row gutter={8} wrap={false}>
                                    <Col>
                                        <Tooltip placement="bottomRight" title="Zurück">
                                            <Button icon={<LeftOutlined />} onClick={handleBackClick} />
                                        </Tooltip>
                                    </Col>

                                    {onSave && (
                                        <Col>
                                            <Tooltip placement="bottomRight" title={getSaveTooltipText()}>
                                                {/* Wichtig: disabled Button in <span>, sonst kein Tooltip */}
                                                <span style={{ display: "inline-block" }}>
                          <Button
                              type="primary"
                              icon={saveButtonIcon ?? <SaveOutlined />}
                              onClick={onSave}
                              disabled={
                                  isCreateMode
                                      ? !isChanged               // Draft: nur aktiv bei Änderungen
                                      : (!isChanged || !isFormValid) // Nicht-Draft: Änderungen + gültig
                              }
                          />
                        </span>
                                            </Tooltip>
                                        </Col>
                                    )}

                                    {showDelete && onDelete && (
                                        <Col>
                                            <Tooltip title={`${label} löschen`}>
                                                <Button danger icon={<DeleteOutlined />} onClick={handleDeleteOpen} />
                                            </Tooltip>
                                        </Col>
                                    )}
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            <div className="create-edit-body">
                <Row gutter={32} className="fw-row">
                    <Col span={24}>
                        <Tabs
                            items={tabs}
                            activeKey={activeTabKey}
                            onChange={onTabChange}
                            destroyOnHidden={false}
                        />
                    </Col>
                </Row>
            </div>

            <GenericModal
                open={isDeleteModalOpen}
                title={`${resourceName} wirklich löschen`}
                text={`Möchtest du ${resourceName} wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                cancelText="Abbrechen"
                confirmText="Löschen"
                confirmButtonProps={{ danger: true }}
            />

            <GenericModal
                open={isBackModalOpen}
                title="Wirklich zurück?"
                text="Wollen Sie wirklich zurück in die Übersicht? Ungespeicherte Daten gehen verloren."
                onCancel={handleBackCancel}
                onConfirm={handleBackConfirm}
                cancelText="Abbrechen"
                confirmText="Zur Übersicht"
            />
        </div>
    );
};

export default CreateEditView;
