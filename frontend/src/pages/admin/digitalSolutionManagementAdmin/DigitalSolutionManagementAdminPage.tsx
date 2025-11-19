import {useCallback, useEffect, useState} from "react";
import {message} from "antd";
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

    return (

            <TableView<DigitalSolutionWithRelationsDto>
                title="Digitale Lösungen Management"
                buttonLabel="Digitale Lösung anlegen"
                onButtonClick={handleNew}
                tabs={TABS}
                activeTabKey={activeTab}
                onTabChange={handleTabChange}
                data={digitalSolutions}
                columns={columns}
                rowKey="id"
                loading={loading}
                onRowClick={handleRowClick}
            />

    );
};

export default DigitalSolutionManagementAdminPage;