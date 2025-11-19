import { useEffect, useRef, useState } from "react";
import { Form, message, TabsProps, UploadFile, Spin } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { organizationService } from "../../../../services/organization/organizationService.ts";
import {
    CommonOrganizationTabComponent,
} from "../../../../components/admin/organizationTabs/CommonOrganizationTabComponent.tsx";
import {
    RepresentativeTabComponent,
} from "../../../../components/admin/organizationTabs/RepresentativeTabComponent.tsx";
import {
    imagesDiffer,
    mapOrganizationDtoToFormValues,
} from "../../../../utils/formDataHelper.ts";
import { OrganizationFormValues } from "../../../../types/dtos/Organization.dto.ts";
import isEqual from "lodash.isequal";
import CreateEditView from "../../../../components/CreateEditView/CreateEditView.tsx";
import {
    findMissing,
    partitionPaths,
    requiredPathsFor,
} from "../../../../services/organization/organizationAdminRequired.ts";
import { OrganizationState } from "../../../../types/constants/enums.ts";

const TAB_KEYS = ["COMMON" /*, "USERS", "DIGITAL_SOLUTIONS"*/] as const;
type TabKey = typeof TAB_KEYS[number];

type LoadOpts = { soft?: boolean; rebase?: boolean };

export default function OrganizationEditAdminPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [form] = Form.useForm<OrganizationFormValues>();
    const [activeTab, setActiveTab] = useState<TabKey>("COMMON");

    // Loading
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Baseline
    const initialValuesRef = useRef<OrganizationFormValues | null>(null);

    // State-Wechsel / Guard
    const prevStateRef = useRef<OrganizationState | undefined>(undefined);
    const patchingRef = useRef(false);

    const location = useLocation();
    const state = (location.state as { tab?: keyof typeof TAB_KEYS }) || {};
    const tabFromState = state.tab;

    // UI flags
    const [isChanged, setIsChanged] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const formMountedRef = useRef(false);
    useEffect(() => {
        formMountedRef.current = true;
        return () => {
            formMountedRef.current = false;
        };
    }, []);

    const loadOrganizationData = async (orgId: string, opts: LoadOpts = {}) => {
        const { soft = false, rebase = false } = opts;
        soft ? setRefreshing(true) : setInitialLoading(true);

        const dto = await organizationService.fetchOrganization(orgId);
        if (!dto) {
            soft ? setRefreshing(false) : setInitialLoading(false);
            return;
        }

        const base = mapOrganizationDtoToFormValues(dto);

        let logoFileList: UploadFile[] = [];
        if (dto.logoBase64 && dto.logoMimeType && dto.logoFilename) {
            const dataUri = `data:${dto.logoMimeType};base64,${dto.logoBase64}`;
            logoFileList = [
                {
                    uid: dto.id,
                    name: dto.logoFilename,
                    status: "done",
                    type: dto.logoMimeType,
                    thumbUrl: dataUri,
                    url: dataUri,
                },
            ];
        }

        const values: OrganizationFormValues = {
            ...base,
            logoBase64: logoFileList,
        };

        if (!initialValuesRef.current || rebase) {
            initialValuesRef.current = values;
        }

        if (formMountedRef.current) {
            form.setFieldsValue(values);
        }

        // Startzustand merken (für State-Wechsel)
        prevStateRef.current = values.organizationState;

        setIsChanged(false);
        soft ? setRefreshing(false) : setInitialLoading(false);
    };

    useEffect(() => {
        if (id) {
            loadOrganizationData(id, { soft: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleValuesChange = (
        changed: Partial<OrganizationFormValues>,
    ) => {
        const values = form.getFieldsValue(true) as OrganizationFormValues;

        // 0) Programmatischer Patch? -> nichts tun
        if (patchingRef.current) return;

        // 1) Wechselt der organizationState? -> Sofort Reset auf Baseline + ABBRECHEN
        if (Object.prototype.hasOwnProperty.call(changed, "organizationState")) {
            const newState = changed.organizationState as OrganizationState | undefined;
            if (newState && newState !== prevStateRef.current && initialValuesRef.current) {
                patchingRef.current = true;

                const patch: OrganizationFormValues = {
                    ...initialValuesRef.current,
                    organizationState: newState,
                };

                // Save-Button während des Wechsels aus
                setIsValid(false);
                setIsChanged(false);

                form.setFieldsValue(patch);
                prevStateRef.current = newState;

                // Guard im Microtask lösen
                queueMicrotask(() => {
                    patchingRef.current = false;
                });

                return; // keine Validierung in diesem Tick
            }
        }

        // 2) Dynamische Pflichtpfade (inkl. logo/population)
        const required = requiredPathsFor({
            organizationState: values.organizationState,
            organizationType: values.organizationType,
        });

        // 3) flat vs. nested für error check
        const { flat, nested } = partitionPaths(required);

        // 4) fehlende Werte semantisch
        const missing = findMissing(values, required);

        // 5) AntD Field-Errors
        const flatOk = form.getFieldsError(flat).every((e) => e.errors.length === 0);
        const nestedOk = nested.every((p) => (form.getFieldError as any)(p).length === 0);
        const noFieldErrors = flatOk && nestedOk;

        // 6) Logo-Pflicht (FULL)
        const isFull = values.organizationState === OrganizationState.FULL;
        const first = values.logoBase64?.[0];
        const hasNewLogoFile = !!first?.originFileObj;
        const hasServerLogo = !!first?.url || !!first?.thumbUrl;
        const logoRequiredOk = !isFull ? true : (!!values.logoBase64?.length && (hasNewLogoFile || hasServerLogo));

        // 7) Gesamtvalidität
        const commonValid = missing.length === 0 && noFieldErrors && logoRequiredOk;
        setIsValid(commonValid);

        // 8) Changed-Detection (ohne große Logo-Objekte)
        if (initialValuesRef.current) {
            const normalize = (v: OrganizationFormValues) => ({
                organizationState: v.organizationState ?? "",
                name: v.name?.trim(),
                email: v.email?.trim(),
                street: v.street?.trim(),
                zip: v.zip?.trim(),
                city: v.city?.trim(),
                lat: v.lat,
                lon: v.lon,
                manualCoords: v.manualCoords,
                countryCode: v.countryCode?.trim(),
                regionId: v.regionId ?? null,
                organizationType: v.organizationType ?? "",
                website: v.website?.trim(),
                users: (v.users ?? []).map(u => u.id).sort(),
                population: v.municipalityProfile?.population ?? null,
            });

            const formChanged = !isEqual(normalize(values), normalize(initialValuesRef.current));
            const logoChanged = imagesDiffer(values.logoBase64, initialValuesRef.current.logoBase64);
            setIsChanged(formChanged || logoChanged);
        }
    };

    const handleDelete = async () => {
        const id = form.getFieldValue("id");
        if (!id) {
            message.error("ID fehlt.");
            return;
        }
        try {
            await organizationService.deleteOrganization(id);
            navigate("/admin/organization-management");
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Löschen fehlgeschlagen");
        }
    };

    const handleTabChange = async (key: string) => {
        setActiveTab(key as TabKey);
    };

    const handleSave = async () => {
        try {
            const payload = form.getFieldsValue(true) as OrganizationFormValues;
            if (!payload.id) {
                message.error("Ungültige Organisations-ID.");
                return;
            }

            await organizationService.updateOrganization(payload);
            message.success("Organisation erfolgreich aktualisiert.");

            // Soft-Reload + Baseline neu setzen
            await loadOrganizationData(payload.id!, { soft: true, rebase: true });
        } catch (err: any) {
            message.error(err?.message || "Fehler beim Speichern.");
        }
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "COMMON",
            label: "Allgemein",
            children: <CommonOrganizationTabComponent form={form} />,
        },
        {
            key: "USERS",
            label: "Vertreter",
            children: <RepresentativeTabComponent form={form} />,
        },
    ];

    if (initialLoading || !initialValuesRef.current) {
        return (
            <Spin
                spinning={true}
                size="large"
                tip="Lade Daten..."
                style={{ width: "100%", minHeight: 200, display: "block" }}
            >
                <div />
            </Spin>
        );
    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Spin spinning={refreshing} fullscreen />

            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={initialValuesRef.current}
                preserve
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
            >
                <CreateEditView
                    title={initialValuesRef.current?.name || ""}
                    onBack={() =>
                        navigate("/admin/organization-management", {
                            replace: true,
                            state: { tab: tabFromState },
                        })
                    }
                    label="Organisation"
                    isCreateMode={false}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    showDelete={true}
                    tabs={tabItems}
                    activeTabKey={activeTab}
                    onTabChange={handleTabChange}
                    isFormValid={isValid}
                    isChanged={isChanged}
                />
            </Form>
        </div>
    );
}
