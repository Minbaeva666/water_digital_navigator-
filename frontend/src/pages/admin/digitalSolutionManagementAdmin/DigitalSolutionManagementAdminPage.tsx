import {useCallback, useEffect, useMemo, useState} from "react";
import {message, Input, Select, Space} from "antd";
import {ColumnsType} from "antd/es/table";
import {useLocation, useNavigate} from "react-router-dom";
import {digitalSolutionService} from "../../../services/digitalSolutionService/digitalSolutionService.ts";
import {DigitalSolutionWithRelationsDto} from "../../../types/dtos/DigitalSolutionDto.ts";
import {DigitalSolutionState} from "../../../types/constants/enums.ts";
import TableView from "../../../components/TableView/TableView.tsx";

const TAB_KEYS = {
    REQUESTED: "REQUESTED",
    ACTIVATED: "ACTIVATED",
    DEACTIVATED: "DEACTIVATED",
    DRAFTS: "DRAFTS",
} as const;

const TABS = [
    {key: TAB_KEYS.REQUESTED, label: "Anfragen"},
    {key: TAB_KEYS.ACTIVATED, label: "Aktivierte Lösungen"},
    {key: TAB_KEYS.DEACTIVATED, label: "Deaktivierte Lösungen"},
    {key: TAB_KEYS.DRAFTS, label: "Templates"},
];

const columns: ColumnsType<DigitalSolutionWithRelationsDto> = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Repräsentiert durch",
        dataIndex: ["presentedByUser", "firstName"],
        render: (_text, record) => {
            const {firstName, lastName} = record.presentedByUser ?? {};
            return `${firstName ?? ""} ${lastName ?? ""}`.trim();
        },
        width: 200,
        ellipsis: true,
    },
    {
        title: "Verlinkt mit",
        dataIndex: ["organizationId"],
        key: "organizationId",
        render: (_orgId: string, record) => {
            if (record.organizationId) {
                return record.organization?.name;
            }
            const {firstName, lastName} = record.presentedByUser ?? {};
            const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
            return name || "-";
        },
        width: 200,
        ellipsis: true,
    },
    {
        title: "E-Mail (User)",
        dataIndex: ["presentedByUser", "email"],
        key: "userEmail",
        render: (email: string) => email ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Telefon (User)",
        dataIndex: ["presentedByUser", "phonenumber"],
        key: "userPhone",
        render: (phone: string) => phone ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Organisation",
        dataIndex: ["organization", "name"],
        key: "orgName",
        render: (orgName: string) => orgName ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "E-Mail (Organisation)",
        dataIndex: ["organization", "email"],
        key: "orgEmail",
        render: (orgEmail: string) => orgEmail ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Webseite",
        dataIndex: ["organization", "website"],
        key: "orgWebsite",
        render: (website: string) =>
            website ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Eingereicht am",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (isoString: string) =>
            new Date(isoString).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
        width: 200,
        ellipsis: true,
    },
    {
        title: "Status",
        dataIndex: "state",
        key: "status",
        render: (state: string) => state ?? "-",
        width: 200,
        ellipsis: true,
    },
];

const DigitalSolutionManagementAdminPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.tab ?? TAB_KEYS.REQUESTED;
    const [activeTab, setActiveTab] = useState<keyof typeof TAB_KEYS>(initialTab);

    const [digitalSolutions, setDigitalSolutions] = useState<DigitalSolutionWithRelationsDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortField, setSortField] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc');


    const loadDigitalSolutions = useCallback(async (type: keyof typeof TAB_KEYS) => {
        setLoading(true);
        try {
            let data: DigitalSolutionWithRelationsDto[] | null = [];
            switch (type) {
                case TAB_KEYS.REQUESTED:
                    data = await digitalSolutionService.fetchDigitalSolutionsWithState(DigitalSolutionState.REQUESTED);
                    break;
                case TAB_KEYS.ACTIVATED:
                    data = await digitalSolutionService.fetchDigitalSolutionsWithState(DigitalSolutionState.ACTIVATED);
                    break;
                case TAB_KEYS.DEACTIVATED:
                    data = await digitalSolutionService.fetchDigitalSolutionsWithState(DigitalSolutionState.DEACTIVATED);
                    break;
                case TAB_KEYS.DRAFTS:
                    data = await digitalSolutionService.fetchDigitalSolutionsWithState(DigitalSolutionState.DRAFT);
                    break;
            }
            if (data) {
                setDigitalSolutions(data);
            }
        } catch {
            message.error("Digitale Lösungen konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDigitalSolutions(activeTab);
    }, [activeTab, loadDigitalSolutions]);

    const filteredAndSorted = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let list = digitalSolutions.slice();
        if (term.length > 0) {
            list = list.filter(ds => {
                const orgName = ds.organization?.name ?? "";
                const presenterName = `${ds.presentedByUser?.firstName ?? ""} ${ds.presentedByUser?.lastName ?? ""}`.trim();
                return (
                    (ds.name ?? "").toLowerCase().includes(term) ||
                    (ds.presentedByUser?.email ?? "").toLowerCase().includes(term) ||
                    presenterName.toLowerCase().includes(term) ||
                    orgName.toLowerCase().includes(term)
                );
            });
        }

        const compare = (a: any, b: any) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === 'organization') {
                aVal = a.organization?.name ?? '';
                bVal = b.organization?.name ?? '';
            } else if (sortField === 'presenter') {
                aVal = `${a.presentedByUser?.firstName ?? ""} ${a.presentedByUser?.lastName ?? ""}`.trim();
                bVal = `${b.presentedByUser?.firstName ?? ""} ${b.presentedByUser?.lastName ?? ""}`.trim();
            }

            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        };

        list.sort(compare);
        return list;
    }, [digitalSolutions, searchTerm, sortField, sortDirection]);

    const handleTabChange = (key: string) => {
        setActiveTab(key as keyof typeof TAB_KEYS);
        const tabKey = key as keyof typeof TAB_KEYS;
        setActiveTab(tabKey);
    };

    const handleRowClick = (row: DigitalSolutionWithRelationsDto) => {
        navigate(
            `/admin/digital-solution-management/digital-solution/${row.id}/edit`,
            {state: {tab: activeTab}}
        );
    };

    const handleNew = () => {
        navigate(
            `/admin/digital-solution-management/digital-solution/new`,
            {state: {tab: activeTab}}
        );
    };

    const headerControls = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
                <Input.Search
                    placeholder="Nach Name, Email, Presenter oder Organisation suchen"
                    onSearch={(v) => setSearchTerm(v)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ width: 420 }}
                />

                <Select value={sortField} onChange={(v) => setSortField(String(v))} style={{ width: 160 }}>
                    <Select.Option value="name">Name</Select.Option>
                    <Select.Option value="presenter">Presenter</Select.Option>
                    <Select.Option value="organization">Organisation</Select.Option>
                    <Select.Option value="createdAt">Eingereicht am</Select.Option>
                    <Select.Option value="state">Status</Select.Option>
                </Select>

                <Select value={sortDirection} onChange={(v) => setSortDirection(v)} style={{ width: 120 }}>
                    <Select.Option value="asc">Aufsteigend</Select.Option>
                    <Select.Option value="desc">Absteigend</Select.Option>
                </Select>
            </Space>
        </div>
    );

    return (

            <TableView<DigitalSolutionWithRelationsDto>
                title="Digitale Lösungen Management"
                buttonLabel="Digitale Lösung anlegen"
                onButtonClick={handleNew}
                tabs={TABS}
                activeTabKey={activeTab}
                onTabChange={handleTabChange}
                data={filteredAndSorted}
                columns={columns}
                rowKey="id"
                loading={loading}
                onRowClick={handleRowClick}
                headerExtra={headerControls}
            />

    );
};

export default DigitalSolutionManagementAdminPage;