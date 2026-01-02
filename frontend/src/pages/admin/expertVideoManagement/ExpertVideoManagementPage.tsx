import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  DatePicker,
  Space,
  Popconfirm,
  message,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { ExpertVideoDto, ExpertVideoCreateUpdateDto } from "../../../types/dtos/ExpertVideoDto";
import { expertVideoService } from "../../../services/expertVideoService/expertVideoService";
import dayjs from "dayjs";


const ExpertVideoManagementPage: React.FC = () => {
  const [data, setData] = useState<ExpertVideoDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpertVideoDto | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [form] = Form.useForm<ExpertVideoCreateUpdateDto>();

  const load = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const res = await expertVideoService.fetchPage(p, ps);
      setData(res.items);
      setTotal(res.total);
      setPage(res.page);
      setPageSize(res.pageSize);
    } catch (e) {
      console.error(e);
      message.error("Fehler beim Laden der Expert Videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

const openCreate = () => {
  setEditing(null);
  setThumbnailFile(null);
  form.resetFields();
  form.setFieldsValue({
    isActive: true,
    authors: [{ name: "", url: "" }],
  } as any);
  setModalOpen(true);
};


const openEdit = (record: ExpertVideoDto) => {
  setEditing(record);
  setThumbnailFile(null);

  const authorsFromRecord =
    record.authors && record.authors.length > 0
      ? record.authors
      : record.authorName
      ? [{ name: record.authorName, url: record.authorUrl }]
      : [];

  form.setFieldsValue({
    title: record.title,
    description: record.description,
    authorName: record.authorName,
    authorUrl: record.authorUrl,
    videoUrl: record.videoUrl,
    isActive: record.isActive,
    publishedAt: record.publishedAt ? (dayjs(record.publishedAt) as any) : undefined,
    authors: authorsFromRecord,
  } as any);

  setModalOpen(true);
};


  const handleDelete = async (id: string) => {
    try {
      await expertVideoService.remove(id);
      message.success("Expert Video gelöscht");
      load();
    } catch (e) {
      console.error(e);
      message.error("Löschen fehlgeschlagen");
    }
  };

const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    const authors =
      values.authors?.filter(
        (a: any) => a && a.name && a.name.trim().length > 0
      ) ?? [];

    const primaryAuthor = authors[0];

    const payload: ExpertVideoCreateUpdateDto = {
      title: values.title,
      description: values.description,
      publishedAt: values.publishedAt
        ? (values.publishedAt as any).toISOString()
        : undefined,
      videoUrl: values.videoUrl,
      isActive: values.isActive ?? true,

      // NEW multi-author API
      authors,

      // legacy fields – filled by the first author,
      // so old code/backend parts, if any, don't break
      authorName: primaryAuthor?.name,
      authorUrl: primaryAuthor?.url,
    };

    let video: ExpertVideoDto;

    if (editing) {
      video = await expertVideoService.update(editing.id, payload);
    } else {
      video = await expertVideoService.create(payload);
    }

    if (thumbnailFile) {
      await expertVideoService.uploadThumbnail(video.id, thumbnailFile);
    }

    message.success(editing ? "Expert Video aktualisiert" : "Expert Video erstellt");
    setModalOpen(false);
    load();
  } catch (e) {
    console.error(e);
    // form validation errors are already displayed by antd
  }
};


  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setThumbnailFile(file);
      return false; // cancel auto-upload
    },
    maxCount: 1,
  };

  const columns = [
    { title: "Titel", dataIndex: "title", key: "title" },
    {
      title: "Datum",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (v: string | undefined) =>
        v ? new Intl.DateTimeFormat("de-DE").format(new Date(v)) : "",
    },
    {
      title: "Aktiv",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => (v ? "Ja" : "Nein"),
    },
    {
      title: "Aktionen",
      key: "actions",
      render: (_: any, record: ExpertVideoDto) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            Bearbeiten
          </Button>
          <Popconfirm
            title="Video löschen?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Löschen
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>
          Neues Expert Video
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => load(p, ps),
        }}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Expert Video bearbeiten" : "Neues Expert Video"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Speichern" : "Erstellen"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Titel"
            name="title"
            rules={[{ required: true, message: "Titel ist erforderlich" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Datum" name="publishedAt">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.List name="authors">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field, index) => (
        <Space
          key={field.key}
          align="baseline"
          style={{ display: "flex", marginBottom: 8 }}
        >
          <Form.Item
            {...field}
            label={index === 0 ? "Autor" : "Weiterer Autor"}
            name={[field.name, "name"]}
            fieldKey={[field.name, "name"]}
            rules={[
              { required: true, message: "Name des Autors ist erforderlich" },
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            {...field}
            label="Link"
            name={[field.name, "url"]}
            fieldKey={[field.name, "url"]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <MinusCircleOutlined
            onClick={() => remove(field.name)}
            style={{ marginTop: 30 }}
          />
        </Space>
      ))}

      <Form.Item>
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Autor hinzufügen
        </Button>
      </Form.Item>
    </>
  )}
</Form.List>


          <Form.Item label="Beschreibung" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Video URL (YouTube)"
            name="videoUrl"
            rules={[{ required: true, message: "Video URL ist erforderlich" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Thumbnail (Bild)">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Bild auswählen</Button>
            </Upload>
            {editing?.thumbnailUrl && !thumbnailFile && (
              <div style={{ marginTop: 8 }}>
                Aktuelles Bild vorhanden
              </div>
            )}
          </Form.Item>

          <Form.Item label="Aktiv" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpertVideoManagementPage;
