import {useEffect, useRef, useState} from "react";
import {Form, message, Spin, TabsProps} from "antd";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import {digitalSolutionService} from "../../../services/digitalSolutionService/digitalSolutionService.ts";

import {DigitalSolutionFormValues} from "../../../forms/digital-solution/DigitalSolutionFormValues.ts";

import CreateEditView from "../../../components/CreateEditView/CreateEditView.tsx";
import CommonTabComponent
    from "../../../components/admin/digitalSolutionAdminTabs/commonTabComponent/CommonTabComponent.tsx";
import PartnersAndUsersTabComponent
    from "../../../components/admin/digitalSolutionAdminTabs/partnersAndUsersTabComponent/PartnersAndUsersTabComponent.tsx";
import ImagesTabComponent
    from "../../../components/admin/digitalSolutionAdminTabs/imagesTabComponent/ImagesTabComponent.tsx";
import {
    extractFilesFromUploadFiles,
    imagesDiffer,
    mapDigitalSolutionDtoToForm,
    normIdArray,
} from "../../../utils/formDataHelper.ts";
import isEqual from "lodash.isequal";
import {taxonomyNodeService} from "../../../services/taxonomyNodeService/taxonomyNodeService.ts";
import CriteriaTabComponent
    from "../../../components/admin/digitalSolutionAdminTabs/criteriaTabComponent/CriteriaTabComponent.tsx";
import {TaxonomyNodeDto} from "../../../types/dtos/TaxonomyNodeDto.ts";
import {buildGroupedSelections, isOtherTargetGroupSelected} from "../../../utils/taxonomyTree.ts";
import {FileAddOutlined, SaveOutlined} from "@ant-design/icons";
import {DigitalSolutionState} from "../../../types/constants/enums.ts";
// import "./DigitalSolutionEditAdminPage.less"

const TAB_KEYS = ["COMMON", "IMAGES", "PARTNERS", "CRITERIA"] as const;
type TabKey = typeof TAB_KEYS[number];

type LoadOpts = { soft?: boolean; rebase?: boolean };

export default function DigitalSolutionEditAdminPage() {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const {id} = useParams<{ id?: string }>();
    const [form] = Form.useForm<DigitalSolutionFormValues>();
    const [taxonomyNodes, setTaxonomyNodes] = useState<TaxonomyNodeDto[]>([]);
    const [activeTab, setActiveTab] = useState<TabKey>("COMMON");
    const solutionState = Form.useWatch("state", form);
    const isDraft = solutionState === "DRAFT";
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const initialValuesRef = useRef<DigitalSolutionFormValues | null>(null);
    const [isChanged, setIsChanged] = useState(false);

    const tabFromState = (useLocation().state as { tab?: string })?.tab;

    const [tabValid, setTabValid] = useState<Record<TabKey, boolean>>({
        COMMON: false,
        PARTNERS: true,
        IMAGES: false,
        CRITERIA: false,
    });
    const isFormValid = Object.values(tabValid).every((v) => v);
    const onTabValidityChange = (tab: TabKey, valid: boolean) => {
        setTabValid((prev) => ({...prev, [tab]: valid}));
    };

    const formMountedRef = useRef(false);
    useEffect(() => {
        formMountedRef.current = true;
        return () => {
            formMountedRef.current = false;
        };
    }, []);

    const loadSolutionData = async (
        solutionId: string,
        opts: LoadOpts = {}
    ) => {
        const { soft = false, rebase = false } = opts;
        soft ? setRefreshing(true) : setInitialLoading(true);

        // DTO + Taxonomie laden
        const [dto, allCrit] = await Promise.all([
            digitalSolutionService.fetchDigitalSolutionById(solutionId),
            taxonomyNodeService.fetchTaxonomyNodes(),
        ]);

        if (!dto) {
            throw new Error(`Keine DigitalSolution mit ID ${solutionId} gefunden`);
        }

        setTaxonomyNodes((prev) =>
            (prev.length === allCrit.length && prev.every((p, i) => p.id === allCrit[i].id))
                ? prev
                : allCrit
        );

        // Images separat nur laden, wenn IDs existieren
        const [titleImage, detailImages] = await Promise.all([
            dto.titleImage
                ? digitalSolutionService.fetchTitleImageByDigitalSolution(solutionId)
                : undefined,
            dto.detailImages?.length
                ? digitalSolutionService.fetchDetailImagesByDigitalSolution(solutionId)
                : [],
        ]);

        console.log("dto", dto)

        const formData = mapDigitalSolutionDtoToForm(
            dto,
            titleImage,
            detailImages ?? []
        );

        const grouped = buildGroupedSelections(formData.taxonomyNodeIds ?? [], allCrit);

        const valuesWithSelections: DigitalSolutionFormValues = {
            ...formData,
            taxonomySelections: grouped,
        };

        if (!initialValuesRef.current || rebase) {
            initialValuesRef.current = valuesWithSelections;
        }

        if (formMountedRef.current) {
            form.setFieldsValue(valuesWithSelections);
        }

        setIsChanged(false);
        soft ? setRefreshing(false) : setInitialLoading(false);
    };

    useEffect(() => {
        if (id) {
            loadSolutionData(id, {soft: false});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSave = async () => {
        try {
            const values = form.getFieldsValue(true);
            if (!values.id) {
                messageApi.error("ID fehlt.");
                return;
            }

            const needsSource =
                values.publishedBy === "WEB" ||
                values.publishedBy === "PUBLICATION"


            const createdAtOverrideDatePart = dayjs(values.createdAtOverride, "DD.MM.YYYY").format("YYYY-MM-DD");
            const readyForOperationDatePart = dayjs(values.readyForOperation, "DD.MM.YYYY").format("YYYY-MM-DD");
            const payload: DigitalSolutionFormValues = {
                ...values,
                publishedSource: needsSource ? (values.publishedSource?.trim() || null) : null,
                readyForOperation: `${readyForOperationDatePart}T00:00:00.000Z`,
                createdAtOverride: `${createdAtOverrideDatePart}T00:00:00.000Z`,
                projectPartners: values.projectPartners ?? [],
                solutionUsers: values.solutionUsers ?? [],
            };

            await digitalSolutionService.updateDigitalSolution(payload);

            if (payload.titleImage?.length) {
                const [file] = extractFilesFromUploadFiles(payload.titleImage);
                if (file) {
                    await digitalSolutionService.updateDigitalSolutionTitleImage({
                        id: payload.id!,
                        titleImage: file,
                    });
                }
            }

            const currentDetail = payload.detailImages ?? [];
            const keepImageIds = currentDetail
                .filter(f => !f.originFileObj && f.uid)
                .map(f => String(f.uid));
            const newFiles = extractFilesFromUploadFiles(currentDetail.filter(f => !!f.originFileObj));

            await digitalSolutionService.updateDigitalSolutionDetailImages({
                digitalSolutionId: payload.id!,
                keepImageIds,
                detailImages: newFiles,
            });

            messageApi.success("Digitale Lösung erfolgreich aktualisiert.");
            setIsChanged(false);

            await loadSolutionData(values.id!, {soft: true, rebase: true});
        } catch (err: unknown) {
            console.error("Fehler beim Speichern:", err);
            if (axios.isAxiosError(err)) {
                messageApi.error(err.response?.data?.error ?? err.message);
            } else if (err instanceof Error) {
                messageApi.error(err.message);
            } else {
                messageApi.error("Unbekannter Fehler.");
            }
        }
    };

    const handleDraftSave = async () => {
        try {
            const values = form.getFieldsValue(true) as DigitalSolutionFormValues;
            if (!values.id) {
                messageApi.error("ID fehlt.");
                return;
            }

            const needsSource =
                values.publishedBy === "WEB" ||
                values.publishedBy === "PUBLICATION"

            // Datum nur konvertieren, wenn vorhanden
            const readyForOperationDatePart = values.readyForOperation
                ? dayjs(values.readyForOperation, "DD.MM.YYYY").format("YYYY-MM-DD")
                : null;

            const createdAtOverrideDatePart = values.createdAtOverride
                ? dayjs(values.createdAtOverride, "DD.MM.YYYY").format("YYYY-MM-DD")
                : null;

            const payload: DigitalSolutionFormValues = {
                ...values,
                publishedSource: needsSource ? (values.publishedSource?.trim() || undefined) : undefined,
                readyForOperation: readyForOperationDatePart ? `${readyForOperationDatePart}T00:00:00.000Z` : undefined,
                createdAtOverride: createdAtOverrideDatePart ? `${createdAtOverrideDatePart}T00:00:00.000Z` : undefined,
                projectPartners: values.projectPartners ?? [],
                solutionUsers: values.solutionUsers ?? [],
                state: DigitalSolutionState.DRAFT,
            };

            // 1) Stammdaten als Draft speichern
            await digitalSolutionService.updateDigitalSolution(payload);

            // ---------------- Titelbild ----------------
            const titleList = (payload.titleImage ?? []);
            const [newTitleFile] = extractFilesFromUploadFiles(titleList); // nur NEUE Dateien (mit originFileObj)
            const hasExistingServerTitle = titleList.some(
                (f: any) => !f.originFileObj && (f.url || f.thumbUrl)
            );

            if (newTitleFile) {
                // Neues Titelbild hochladen / ersetzen
                await digitalSolutionService.updateDigitalSolutionTitleImage({
                    id: payload.id!,
                    titleImage: newTitleFile,
                });
            } else if (!hasExistingServerTitle) {
                // Es gibt KEIN bestehendes Titelbild mehr -> löschen
                // Falls dein API-Contract 'undefined' als "löschen" interpretiert:
                await digitalSolutionService.updateDigitalSolutionTitleImage({
                    id: payload.id!,
                    // @ts-expect-error: API interpretiert fehlende Datei als "delete"
                    titleImage: undefined,
                });
            }
            // Sonst: bestehendes Bild unverändert lassen

            // ---------------- Detailbilder ----------------
            const detailList = (payload.detailImages ?? []);

            // IDs der bestehenden (behalten) – haben KEIN originFileObj
            const keepImageIds = detailList
                .filter((f: any) => !f.originFileObj && f.uid)
                .map((f: any) => String(f.uid));

            // Nur NEUE Dateien hochladen
            const newDetailFiles = extractFilesFromUploadFiles(
                detailList.filter((f: any) => !!f.originFileObj)
            );

            await digitalSolutionService.updateDigitalSolutionDetailImages({
                digitalSolutionId: payload.id!,
                keepImageIds,
                detailImages: newDetailFiles,
            });

            // 4) Feedback & UI-Refresh
            messageApi.success("Draft erfolgreich gespeichert.");
            setIsChanged(false);
            await loadSolutionData(values.id!, { soft: true, rebase: true });
        } catch (err: unknown) {
            console.error("Fehler beim Draft-Speichern:", err);
            if (axios.isAxiosError(err)) {
                messageApi.error(err.response?.data?.error ?? err.message);
            } else if (err instanceof Error) {
                messageApi.error(err.message);
            } else {
                messageApi.error("Unbekannter Fehler.");
            }
        }
    };


    const handleDelete = async () => {
        const id = form.getFieldValue("id");
        if (!id) {
            messageApi.error("ID fehlt.");
            return;
        }

        try {
            await digitalSolutionService.deleteDigitalSolution(id);
            navigate("/my-digital-solutions");
        } catch (error) {
            console.error("Fehler beim Löschen:", error);
        }
    };

    const handleTabChange = async (key: string) => {
        try {
            if (activeTab === "IMAGES") {
                // await form.validateFields(["titleImage"]);
            } else {
                // await form.validateFields();
            }
            setActiveTab(key as TabKey);
        } catch {
            // bewusst geschluckt
        }
    };

    const handleValuesChange = (
        _changed?: Partial<DigitalSolutionFormValues>,
    ) => {
        if (_changed && Object.prototype.hasOwnProperty.call(_changed, "publishedBy")) {
            console.log("reset")
            form.setFieldValue("publishedSource", null);
            form.setFields([
                { name: ["publishedSource"], errors: [], touched: false, validating: false },
            ]);
        }

        const currentValues = form.getFieldsValue(true) as DigitalSolutionFormValues;
        const isDraftNow = form.getFieldValue("state") === "DRAFT";

        if (isDraftNow) {
            // In Draft: KEINE Pflichtfelder
            onTabValidityChange("COMMON", true);
            onTabValidityChange("IMAGES", true);
            onTabValidityChange("CRITERIA", true);
        } else {
            // --- Common: Pflicht außerhalb Draft ---
            const {
                name, link, maturityDegree, offeringCategory,
                shortDescription, longDescription, goalDescription, technicalDescription,
                titleImage, publishedBy, publishedSource
            } = currentValues;

            const needsSource =
                publishedBy === "WEB" ||
                publishedBy === "PUBLICATION"

            const commonValid =
                !!name?.trim() && name.trim().length <= 120 &&
                !!link?.trim() &&
                !!maturityDegree &&
                !!offeringCategory &&
                !!publishedBy &&
                (!needsSource || !!publishedSource?.trim()) &&
                !!shortDescription?.trim() && shortDescription.trim().length >= 25 && shortDescription.trim().length <= 300 &&
                !!longDescription?.trim() && longDescription.trim().length >= 25 && longDescription.trim().length <= 1500 &&
                !!goalDescription?.trim() && goalDescription.trim().length >= 25 && goalDescription.trim().length <= 600 &&
                !!technicalDescription?.trim() && technicalDescription.trim().length >= 25 && technicalDescription.trim().length <= 600;

            const imagesValid = Array.isArray(titleImage) && titleImage.length === 1;

            const selections = form.getFieldValue("taxonomySelections") as Record<string, string[]>;
            const criteriaValid = taxonomyNodes
                .filter(n => n.depth === 0)
                .every(parent => {
                    const min = parent.minSelectableNodes ?? 0;
                    if (min === 0) return true;
                    const selected = selections?.[parent.id] || [];
                    return selected.length >= min;
                });

            const merged = form.getFieldsValue();
            let otherTargetGroupOk = true;
            if (!isDraft) {
                otherTargetGroupOk = !isOtherTargetGroupSelected(selections, taxonomyNodes) || !!merged.targetGroupOther?.trim();
            }

            onTabValidityChange("COMMON", commonValid);
            onTabValidityChange("IMAGES", imagesValid);
            onTabValidityChange("CRITERIA", criteriaValid && otherTargetGroupOk);
        }

        // --- Änderungen erkennen (immer) ---
        const normalizeString = (val?: string | null) => (val?.trim() ? val.trim() : null);

        if (initialValuesRef.current) {
            const normalizeValues = (values: DigitalSolutionFormValues) => ({
                state: values.state,
                readyForOperation: values.readyForOperation,
                createdAtOverride: values.createdAtOverride,
                name: normalizeString(values.name),
                link: normalizeString(values.link),
                maturityDegree: values.maturityDegree,
                offeringCategory: values.offeringCategory,
                shortDescription: normalizeString(values.shortDescription),
                longDescription: normalizeString(values.longDescription),
                goalDescription: normalizeString(values.goalDescription),
                technicalDescription: normalizeString(values.technicalDescription),
                efficiencyDescription: normalizeString(values.efficiencyDescription),
                processDescription: normalizeString(values.processDescription),
                socialRelevanceDescription: normalizeString(values.socialRelevanceDescription),
                presentedByUserId: values.presentedByUserId ?? null,
                solutionPresentedByUser: values.solutionPresentedByUser ?? null,
                projectPartnerIds: normIdArray(values.projectPartnerIds),
                solutionUserIds: normIdArray(values.solutionUserIds),
                taxonomySelections: values.taxonomySelections,
                publishedBy: values.publishedBy ?? null,
                publishedAt: values.publishedAt ?? null,
                publishedSource: normalizeString(values.publishedSource),
                targetGroupOther: normalizeString(values.targetGroupOther)
            });

            const valuesChanged = !isEqual(
                normalizeValues(currentValues),
                normalizeValues(initialValuesRef.current)
            );

            const titleImageChanged = imagesDiffer(
                initialValuesRef.current.titleImage,
                currentValues.titleImage
            );
            const detailImagesChanged = imagesDiffer(
                initialValuesRef.current.detailImages,
                currentValues.detailImages
            );

            setIsChanged(valuesChanged || titleImageChanged || detailImagesChanged);
        }
    };

    const tabItems: TabsProps["items"] = [
    {
    key: "COMMON",
    label: "Allgemein",
    children: (
      <CommonTabComponent
        form={form}
        //User darf nur Entwurf / ggf. Template wählen – keine Aktiviert/Deaktiviert
        allowedStates={[
          DigitalSolutionState.DRAFT,
          DigitalSolutionState.REQUESTED, // falls du Template erlauben willst
        ]}
      />
    ),
  },
        {
            key: "IMAGES",
            label: "Bilder",
            children: <ImagesTabComponent form={form}/>,
        },
        {
            key: "PARTNERS",
            label: "Projektpartner/Anwenderorganisationen",
            children: <PartnersAndUsersTabComponent form={form} onFormChange={handleValuesChange}/>,
        },
        {
            key: "CRITERIA",
            label: "Kriterien",
            children: <CriteriaTabComponent taxonomyNodes={taxonomyNodes} form={form}/>,
        },
    ];

    // Nur beim ersten Laden blockend spannen (kein Form-Render vor Daten)
    if (initialLoading || !initialValuesRef.current) {
        return (
            <Spin
                spinning={true}
                size="large"
                tip="Lade Daten..."
                style={{width: "100%", minHeight: 200, display: "block"}}
            >
                <div/>
            </Spin>
        );
    }

    // *** WICHTIG: Draft-abhängige Props für CreateEditView ***
    // In Draft zählt nur "Änderungen vorhanden" → Validität auf true setzen,
    // im Nicht-Draft echte Validität verwenden.
    const computedIsFormValid = isDraft ? true : isFormValid;

    // Tooltip-Override NUR, wenn der Button im Draft aktiv ist (d. h. Änderungen vorhanden),
    // sonst keinen Override -> CreateEditView zeigt den "erst möglich, wenn Änderungen ..." Tooltip.
    const saveTooltipOverride =
        isDraft && isChanged ? "Template speichern" : undefined;

    return (
        <>
            {contextHolder}
            <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
                <Spin spinning={refreshing} fullscreen/>
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={handleValuesChange}
                    initialValues={initialValuesRef.current}
                    preserve
                    style={{flex: 1, display: "flex", flexDirection: "column", minHeight: 0}}
                >
                    <CreateEditView
                        title={
                            isDraft
                                ? (initialValuesRef.current?.name?.trim() || "Kein Titel vergeben")
                                : (initialValuesRef.current?.name || "")
                        }
                        onBack={() => {
                            navigate("/my-digital-solutions", {
                            replace: true,
                            state: { tab: tabFromState },
                       });
                        }}
                        label="Digitale Lösung"
                        isCreateMode={isDraft}
                        onSave={isDraft ? handleDraftSave : handleSave}
                        onDelete={handleDelete}
                        showDelete={true}
                        tabs={tabItems}
                        activeTabKey={activeTab}
                        onTabChange={handleTabChange}
                        isFormValid={computedIsFormValid}
                        isChanged={isChanged}
                        saveButtonIcon={isDraft ? <FileAddOutlined/> : <SaveOutlined/>}
                        saveTooltipTextOverride={saveTooltipOverride}
                    />
                </Form>
            </div>
        </>
    );
}
