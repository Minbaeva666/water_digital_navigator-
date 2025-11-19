import {useState} from "react";
import {Upload, Modal, Form, FormInstance, message} from "antd";
import type {UploadFile} from "antd/es/upload/interface";
import {PlusOutlined} from "@ant-design/icons";
import type {DigitalSolutionFormValues} from "../../../../forms/digital-solution/DigitalSolutionFormValues";
import {getBase64} from "../../../../utils/formDataHelper.ts";
import {RcFile} from "antd/lib/upload";

const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

interface ImagesTabComponentProps {
    form: FormInstance<DigitalSolutionFormValues>;
}

export default function ImagesTabComponent({form}: ImagesTabComponentProps) {
    const [preview, setPreview] = useState<{ visible: boolean; file?: UploadFile }>({visible: false});
    const titleImage = (form.getFieldValue("titleImage") as UploadFile[] | undefined) ?? [];
    const detailImages = (form.getFieldValue("detailImages") as UploadFile[] | undefined) ?? [];

    // State beobachten
    const solutionState = Form.useWatch("state", form);

    const getPreviewSrc = (file?: UploadFile) => {
        if (!file) return undefined;
        return file.preview || file.thumbUrl || (file.originFileObj && URL.createObjectURL(file.originFileObj));
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview && file.originFileObj) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreview({visible: true, file});
    };

    const validateImageFile = (file: RcFile): false | typeof Upload.LIST_IGNORE => {
        const isAllowedType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isAllowedType) {
            message.error('Nur JPG, PNG oder WEBP-Dateien sind erlaubt.');
            return Upload.LIST_IGNORE;
        }

        if (!isLt5M) {
            message.error(`Dateien dürfen maximal 5 MB groß sein.`);
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    return (
        <>
            {/* Titelbild nur required, wenn kein DRAFT */}
            <Form.Item
                name="titleImage"
                required={solutionState !== "DRAFT"}
                extra="Unterstützte Formate: JPG, PNG, max. 5MB"
                label="Titelbild"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                validateTrigger={["onChange", "onBlur"]}
                rules={
                    solutionState !== "DRAFT"
                        ? [{
                            validator: (_, files) =>
                                files && files.length > 0
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Es ist ein Titelbild der Digitalen Lösung erforderlich")),
                        }]
                        : []
                }
            >
                <Upload
                    listType="picture-card"
                    beforeUpload={validateImageFile}
                    onPreview={handlePreview}
                    accept="image/png,image/jpeg,image/webp"
                >
                    {titleImage.length === 0 && (
                        <div>
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>Titelbild hochladen</div>
                        </div>
                    )}
                </Upload>
            </Form.Item>

            {/* Detailbilder – optional */}
            <Form.Item
                name="detailImages"
                extra="Unterstützte Formate: JPG, PNG, WEBP, max. 5MB pro Bild, max. 10 Detailbilder"
                label="Detailbilder"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                validateTrigger={["onChange"]}
            >
                <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={validateImageFile}
                    onPreview={handlePreview}
                >
                    {detailImages.length < 10 && (
                        <div>
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>Detailbild hochladen</div>
                        </div>
                    )}
                </Upload>
            </Form.Item>

            {/* Vorschau-Modal */}
            <Modal open={preview.visible} footer={null} onCancel={() => setPreview({visible: false})}>
                <img
                    alt="Vorschau"
                    style={{width: "100%"}}
                    src={getPreviewSrc(preview.file)}
                />
            </Modal>
        </>
    );
}
