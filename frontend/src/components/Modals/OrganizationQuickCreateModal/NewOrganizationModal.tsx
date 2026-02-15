import { useEffect, useState } from "react";
import { App, Form, Modal } from "antd";

import { organizationService } from "../../../services/organization/organizationService";
import { OrganizationFormValues } from "../../../types/dtos/Organization.dto";
import { OrganizationState } from "../../../types/constants/enums";

import { CommonOrganizationTabComponent } from "../../admin/organizationTabs/CommonOrganizationTabComponent";

type Props = {
  open: boolean;
  onCancel: () => void;
  onCreated: (createdOrg: { id: string; name: string }) => void;
};

export default function NewOrganizationModal({ open, onCancel, onCreated }: Props) {
  const { message } = App.useApp();
  const [form] = Form.useForm<OrganizationFormValues>();
  const [saving, setSaving] = useState(false);

  // Default values when modal opens
  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      organizationState: OrganizationState.LITE,
      manualCoords: false,
      regionId: null,
      lat: null,
      lon: null,
    } as Partial<OrganizationFormValues>);
  }, [open, form]);

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true) as OrganizationFormValues;
      console.log("MODAL values.organizationState =", values.organizationState);

      // extra safety
      const payload: OrganizationFormValues = {
        ...values,
        organizationState: OrganizationState.LITE,
      };

      setSaving(true);
      console.log("MODAL payload =", { ...payload, logoBase64: payload.logoBase64?.length ? "[file]" : undefined });
      const created = await organizationService.createOrganization(payload);

      message.success("Organisation erfolgreich erstellt.");
      onCreated({ id: created.id, name: created.name });

      form.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      console.error("Create org failed:", err);

      const serverMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Fehler beim Erstellen der Organisation";

      message.error(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText="Speichern"
      cancelText="Abbrechen"
      title="Neue Organisation registrieren"
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <CommonOrganizationTabComponent form={form} forcedOrganizationState={OrganizationState.LITE} />
      </Form>
    </Modal>
  );
}
