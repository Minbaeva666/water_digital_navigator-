import { Form, message, TabsProps } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { FileAddOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DigitalSolutionCreateAdminPage.less";
import CommonTabComponent from "../../../../components/admin/digitalSolutionAdminTabs/commonTabComponent/CommonTabComponent.tsx";
import PartnersAndUsersTabComponent from "../../../../components/admin/digitalSolutionAdminTabs/partnersAndUsersTabComponent/PartnersAndUsersTabComponent.tsx";
import ImagesTabComponent from "../../../../components/admin/digitalSolutionAdminTabs/imagesTabComponent/ImagesTabComponent.tsx";
import CreateEditView from "../../../../components/CreateEditView/CreateEditView.tsx";
import { DigitalSolutionFormValues } from "../../../../forms/digital-solution/DigitalSolutionFormValues.ts";
import CriteriaTabComponent from "../../../../components/admin/digitalSolutionAdminTabs/criteriaTabComponent/CriteriaTabComponent.tsx";
import { digitalSolutionService } from "../../../../services/digitalSolutionService/digitalSolutionService.ts";
import axios from "axios";
import { extractFilesFromUploadFiles, imagesDiffer, normIdArray } from "../../../../utils/formDataHelper.ts";
import { TaxonomyNodeDto } from "../../../../types/dtos/TaxonomyNodeDto.ts";
import { taxonomyNodeService } from "../../../../services/taxonomyNodeService/taxonomyNodeService.ts";
import isEqual from "lodash.isequal";
import { EMPTY_DIGITAL_SOLUTION_FORM } from "../../../../services/digitalSolutionService/digitalSolution.mapper.ts";
import { DigitalSolutionState } from "../../../../types/constants/enums.ts";

import { useLocalDraftAutosave } from "../../../../hooks/useLocalDraftAutosave";
import { DraftIndicator } from "../../../../components/admin/DraftIndicator";

dayjs.extend(utc);

const TAB_KEYS = ["COMMON", "PARTNERS", "IMAGES", "CRITERIA"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export default function DigitalSolutionCreateAdminPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [taxonomyNodes, setTaxonomyNodes] = useState<TaxonomyNodeDto[]>([]);
  const navigate = useNavigate();
  const [form] = Form.useForm<DigitalSolutionFormValues>();
  const [activeTab, setActiveTab] = useState<TabKey>("COMMON");
  const [isChanged, setIsChanged] = useState(false);
  const tabFromState = (useLocation().state as { tab?: string })?.tab;

  const INITIAL_FORM = useMemo<DigitalSolutionFormValues>(
    () => ({ ...EMPTY_DIGITAL_SOLUTION_FORM, state: DigitalSolutionState.DRAFT as const }),
    []
  );

  const isDraft = (form.getFieldValue("state") ?? "DRAFT") === "DRAFT";

  const [tabValid, setTabValid] = useState<Record<TabKey, boolean>>({
    COMMON: false,
    PARTNERS: true,
    IMAGES: false,
    CRITERIA: false,
  });
  const isFormValid = Object.values(tabValid).every((v) => v);
  const onTabValidityChange = (tab: TabKey, valid: boolean) => {
    setTabValid((prev) => ({ ...prev, [tab]: valid }));
  };

  const normalizeString = (val?: string | null) => (val && val.trim() ? val.trim() : null);
  const normalizeValues = (values: DigitalSolutionFormValues) => ({
    state: values.state ?? DigitalSolutionState.DRAFT,
    readyForOperation: values.readyForOperation ?? null,
    createdAtOverride: values.createdAtOverride ?? null,
    name: normalizeString(values.name),
    link: normalizeString(values.link),
    maturityDegree: values.maturityDegree ?? null,
    offeringCategory: values.offeringCategory ?? null,
    shortDescription: normalizeString(values.shortDescription),
    longDescription: normalizeString(values.longDescription),
    goalDescription: normalizeString(values.goalDescription),
    technicalDescription: normalizeString(values.technicalDescription),
    efficiencyDescription: normalizeString(values.efficiencyDescription),
    processDescription: normalizeString(values.processDescription),
    socialRelevanceDescription: normalizeString(values.socialRelevanceDescription),
    presentedByUserId: values.presentedByUserId ?? "",
    solutionPresentedByUser: values.solutionPresentedByUser ?? null,
    projectPartnerIds: normIdArray(values.projectPartnerIds),
    solutionUserIds: normIdArray(values.solutionUserIds),
    taxonomySelections: (values as any)?.taxonomySelections ?? {},
    publishedBy: values.publishedBy ?? null,
    publishedAt: values.publishedAt ?? null,
    publishedSource: normalizeString(values.publishedSource),
  });
  type Baseline = ReturnType<typeof normalizeValues>;

  const initialValuesRef = useRef<Baseline>(normalizeValues(INITIAL_FORM));
  const initialImagesRef = useRef({
    titleImage: INITIAL_FORM.titleImage ?? [],
    detailImages: INITIAL_FORM.detailImages ?? [],
  });

  useEffect(() => {
    taxonomyNodeService.fetchTaxonomyNodes().then(setTaxonomyNodes);
  }, []);

  // +++ added: local autosave (drafts)
  const DRAFT_KEY = "digital_solution_create_draft_v1";
  const { saving, lastSavedAt, saveDebounced, read, clear, bindFlushOnHide } =
    useLocalDraftAutosave<DigitalSolutionFormValues>(DRAFT_KEY, INITIAL_FORM);

  // restore draft on mount + flush on tab close
  useEffect(() => {
    const draft = read();
    if (draft?.data) {
      const merged = { ...INITIAL_FORM, ...draft.data };
      form.setFieldsValue(merged);
      // recompute validity and changed flag
      handleValuesChange(undefined, merged);
    //   messageApi.info("Draft restored.");
    }
    return bindFlushOnHide(() => form.getFieldsValue(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValuesChange = (
    _changed?: Partial<DigitalSolutionFormValues>,
    allValues?: DigitalSolutionFormValues
  ) => {
    if (_changed && Object.prototype.hasOwnProperty.call(_changed, "publishedBy")) {
      form.resetFields(["publishedSource"]);
    }

    const raw = (allValues ?? form.getFieldsValue(true)) as DigitalSolutionFormValues;
    const merged: DigitalSolutionFormValues = { ...INITIAL_FORM, ...raw };
    const isDraftNow = (merged.state ?? DigitalSolutionState.DRAFT) === DigitalSolutionState.DRAFT;

    if (isDraftNow) {
      onTabValidityChange("COMMON", true);
      onTabValidityChange("IMAGES", true);
      onTabValidityChange("CRITERIA", true);
    } else {
      const {
        name,
        link,
        maturityDegree,
        offeringCategory,
        shortDescription,
        longDescription,
        goalDescription,
        technicalDescription,
        titleImage,
        publishedBy,
        publishedSource,
      } = merged;

      const needsSource = publishedBy === "WEB" || publishedBy === "PUBLICATION";

      const commonValid =
        !!name?.trim() &&
        name.trim().length <= 120 &&
        !!link?.trim() &&
        !!maturityDegree &&
        !!publishedBy &&
        (!needsSource || !!publishedSource?.trim()) &&
        !!offeringCategory &&
        !!shortDescription?.trim() &&
        shortDescription.trim().length >= 25 &&
        shortDescription.trim().length <= 300 &&
        !!longDescription?.trim() &&
        longDescription.trim().length >= 25 &&
        longDescription.trim().length <= 1500 &&
        !!goalDescription?.trim() &&
        goalDescription.trim().length >= 25 &&
        goalDescription.trim().length <= 600 &&
        !!technicalDescription?.trim() &&
        technicalDescription.trim().length >= 25 &&
        technicalDescription.trim().length <= 600;

      const imagesValid = Array.isArray(titleImage) && titleImage.length === 1;

      const selections = (merged as any)?.taxonomySelections as Record<string, string[]>;
      const criteriaValid = taxonomyNodes
        .filter((n) => n.depth === 0)
        .every((parent) => {
          const min = parent.minSelectableNodes ?? 0;
          if (min === 0) return true;
          const selected = selections?.[parent.id] || [];
          return selected.length >= min;
        });

      onTabValidityChange("COMMON", commonValid);
      onTabValidityChange("IMAGES", imagesValid);
      onTabValidityChange("CRITERIA", criteriaValid);
    }

    const current = normalizeValues(merged);
    const valuesChanged = !isEqual(current, initialValuesRef.current);

    const titleImageChanged = imagesDiffer(initialImagesRef.current.titleImage, merged.titleImage ?? []);
    const detailImagesChanged = imagesDiffer(initialImagesRef.current.detailImages, merged.detailImages ?? []);

    setIsChanged(valuesChanged || titleImageChanged || detailImagesChanged);

    // +++ added: autosave (local) with debounce
    saveDebounced(merged);
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue(true);
      const readyForOperationDatePart = dayjs(values.readyForOperation, "DD.MM.YYYY").format("YYYY-MM-DD");
      const createdAtOverrideDatePart = dayjs(values.createdAtOverride, "DD.MM.YYYY").format("YYYY-MM-DD");
      const pp = form.getFieldValue("projectPartnerIds") || [];
      const su = form.getFieldValue("solutionUserIds") || [];
      const taxonomySelections = form.getFieldValue("taxonomySelections") || {};

      const taxonomyNodeIds: string[] = Object.values(taxonomySelections)
        .flat()
        .filter((id): id is string => typeof id === "string");

      const payload: DigitalSolutionFormValues = {
        ...values,
        readyForOperation: `${readyForOperationDatePart}T00:00:00.000Z`,
        createdAtOverride: `${createdAtOverrideDatePart}T00:00:00.000Z`,
        projectPartners: pp,
        solutionUsers: su,
        taxonomyNodeIds,
      };

      const created = await digitalSolutionService.createDigitalSolution(payload);
      const newId = created.digitalSolutionId;

      if (newId) {
        if (payload.titleImage?.length) {
          const [titleFile] = extractFilesFromUploadFiles(payload.titleImage);
          if (titleFile) {
            const titleMsg = await digitalSolutionService.uploadDigitalSolutionTitleImage({
              id: newId,
              titleImage: titleFile,
            });
            if (titleMsg !== "Titelbild erfolgreich hochgeladen") {
              messageApi.error(titleMsg);
              return;
            }
          }
        }

        const detailFiles = extractFilesFromUploadFiles(payload.detailImages ?? []);
        if (detailFiles.length) {
          const detailMsg = await digitalSolutionService.uploadDigitalSolutionDetailImages({
            id: newId,
            detailImages: detailFiles,
          });
          if (detailMsg !== "Detailbilder erfolgreich hochgeladen") {
            messageApi.error(detailMsg);
            return;
          }
        }

        messageApi.success("Digitale Lösung erfolgreich erstellt.");
        clear(); // +++ clear local draft
        navigate(`/admin/digital-solution-management/digital-solution/${newId}/edit`);
      }
    } catch (err: unknown) {
      console.error("Fehler beim Erstellen:", err);
      if (axios.isAxiosError(err)) {
        messageApi.error(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        messageApi.error(err.message);
      } else {
        messageApi.error("Unbekannter Fehler beim Erstellen.");
      }
    }
  };

  const handleDraftSave = async () => {
    try {
      const values = form.getFieldsValue(true);
      const pp = form.getFieldValue("projectPartnerIds") || [];
      const su = form.getFieldValue("solutionUserIds") || [];
      const taxonomySelections = form.getFieldValue("taxonomySelections") || {};

      const taxonomyNodeIds: string[] = Object.values(taxonomySelections)
        .flat()
        .filter((id): id is string => typeof id === "string");

      const payload: DigitalSolutionFormValues = {
        ...values,
        readyForOperation: values.readyForOperation
          ? dayjs(values.readyForOperation, "DD.MM.YYYY").format("YYYY-MM-DDT00:00:00.000Z")
          : undefined,
        createdAtOverride: values.createdAtOverride
          ? dayjs(values.createdAtOverride, "DD.MM.YYYY").format("YYYY-MM-DDT00:00:00.000Z")
          : undefined,
        projectPartners: pp,
        solutionUsers: su,
        taxonomyNodeIds,
        state: DigitalSolutionState.DRAFT, // Draft erzwingen
      };

      const created = await digitalSolutionService.createDigitalSolution(payload);
      const newId = created.digitalSolutionId;

      if (newId) {
        if (payload.titleImage?.length) {
          const [titleFile] = extractFilesFromUploadFiles(payload.titleImage);
          if (titleFile) {
            const titleMsg = await digitalSolutionService.uploadDigitalSolutionTitleImage({
              id: newId,
              titleImage: titleFile,
            });
            if (titleMsg !== "Titelbild erfolgreich hochgeladen") {
              messageApi.error(titleMsg);
              return;
            }
          }
        }

        const detailFiles = extractFilesFromUploadFiles(payload.detailImages ?? []);
        if (detailFiles.length) {
          const detailMsg = await digitalSolutionService.uploadDigitalSolutionDetailImages({
            id: newId,
            detailImages: detailFiles,
          });
          if (detailMsg !== "Detailbilder erfolgreich hochgeladen") {
            messageApi.error(detailMsg);
            return;
          }
        }

        messageApi.success("Template erfolgreich erstellt.");
        clear(); // +++ clear local draft
        navigate(`/admin/digital-solution-management/digital-solution/${newId}/edit`);
      }
    } catch (err: unknown) {
      console.error("Fehler beim Erstellen des Templates:", err);
      if (axios.isAxiosError(err)) {
        messageApi.error(err.response?.data?.error ?? err.message);
      } else if (err instanceof Error) {
        messageApi.error(err.message);
      } else {
        messageApi.error("Unbekannter Fehler beim Erstellen des Templates.");
      }
    }
  };

  // Tabs
  const tabItems: TabsProps["items"] = [
    { key: "COMMON", label: "Allgemein", children: <CommonTabComponent form={form} /> },
    { key: "IMAGES", label: "Bilder", children: <ImagesTabComponent form={form} /> },
    { key: "PARTNERS", label: "Projektpartner/Anwenderorganisationen", children: <PartnersAndUsersTabComponent form={form} /> },
    { key: "CRITERIA", label: "Kriterien", children: <CriteriaTabComponent taxonomyNodes={taxonomyNodes} form={form} /> },
  ];

  const handleTabChange = async (key: string) => {
    try {
      setActiveTab(key as TabKey);
    } catch {}
  };

  const computedIsFormValid = isDraft ? true : isFormValid;

  return (
    <>
      {contextHolder}
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={INITIAL_FORM}
          onValuesChange={handleValuesChange}
          preserve
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          <CreateEditView
            title="Digitale Lösung anlegen"
            onBack={() => {
              navigate("/admin/digital-solution-management", {
                replace: true,
                state: { tab: tabFromState },
              });
            }}
            onSave={isDraft ? handleDraftSave : handleSave}
            label="Digitale Lösung"
            tabs={tabItems}
            activeTabKey={activeTab}
            onTabChange={handleTabChange}
            isCreateMode={isDraft}
            isChanged={isChanged}
            isFormValid={computedIsFormValid}
            saveButtonIcon={isDraft ? <FileAddOutlined /> : <SaveOutlined />}
          />

          {}
          <DraftIndicator saving={saving} lastSavedAt={lastSavedAt} />
        </Form>
      </div>
    </>
  );
}
