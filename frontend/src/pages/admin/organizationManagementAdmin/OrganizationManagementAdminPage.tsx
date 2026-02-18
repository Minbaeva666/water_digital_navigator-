import {useCallback, useEffect, useMemo, useState} from "react";
import {message, Input, Select, Space} from "antd";
import {ColumnsType} from "antd/es/table";
import {useLocation, useNavigate} from "react-router-dom";
import {organizationService} from "../../../services/organization/organizationService.ts";
import {OrganizationFullDto} from "../../../types/dtos/Organization.dto.ts";
import TableView from "../../../components/TableView/TableView.tsx";

const TAB_KEYS = {
    ALL: "ALL",
} as const;

const TABS = [
    {key: TAB_KEYS.ALL, label: "Alle Organisationen"},
];

const columns: ColumnsType<OrganizationFullDto> = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Kontakt E-Mail",
        dataIndex: ["email"],
        key: "email",
        render: (email: string) => email ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Webseite",
        dataIndex: ["website"],
        key: "website",
        render: (website: string) => website ?? "-",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Anzahl an Vertretern",
        dataIndex: "users",
        key: "users",
        render: (users: { id: string }[]) => users?.length ?? 0,
        width: 200,
        ellipsis: true,
    },
    {
        title: "Eigene Digitale Lösungen",
        dataIndex: "digitalSolutions",
        key: "digitalSolutions",
        render: (sols: { id: string }[]) => sols?.length ?? 0,
        width: 200,
        ellipsis: true,
    },
    {
        title: "Projekt-Partner",
        dataIndex: "projectPartners",
        key: "projectPartners",
        render: (parts: { id: string }[]) => parts?.length ?? 0,
        width: 200,
        ellipsis: true,
    },
    {
        title: "Bei Digitale Lösungen vertreten",
        dataIndex: "solutionUsers",
        key: "solutionUsers",
        render: (su: { id: string }[]) => su?.length ?? 0,
        width: 200,
        ellipsis: true,
    },
];

const OrganizationManagementAdminPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.tab ?? TAB_KEYS.ALL;
    const [activeTab, setActiveTab] = useState<keyof typeof TAB_KEYS>(initialTab);
    const [organizations, setOrganizations] = useState<OrganizationFullDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");


    const loadOrganizations = useCallback(async () => {
        setLoading(true);
        try {
            const result = await organizationService.fetchOrganizations()
            setOrganizations(result);
        } catch {
            message.error("Organisationen konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const filteredOrganizations = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let list = organizations.slice();

        if (term) {
            list = list.filter((org) => {
            const name = (org.name ?? "").toLowerCase();
            const email = (org.email ?? "").toLowerCase();
            const website = (org.website ?? "").toLowerCase();
            const city = (org.city ?? "").toLowerCase();
            const zip = (org.zip ?? "").toLowerCase();
            return (
                name.includes(term) ||
                email.includes(term) ||
                website.includes(term) ||
                city.includes(term) ||
                zip.includes(term)
            );
            });
        }

        list.sort((a, b) => {
            const aName = String(a.name ?? "").toLowerCase();
            const bName = String(b.name ?? "").toLowerCase();
            if (aName < bName) return sortDirection === "asc" ? -1 : 1;
            if (aName > bName) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [organizations, searchTerm, sortDirection]);

    const handleTabChange = (key: string) => {
        setActiveTab(key as keyof typeof TAB_KEYS);
        const tabKey = key as keyof typeof TAB_KEYS;
        setActiveTab(tabKey);
    };


    const handleRowClick = (row: OrganizationFullDto) => {
        navigate(
            `/admin/organization-management/organization/${row.id}/edit`,
            {state: {tab: activeTab}}
        );
    };

    const handleNew = () => {
        navigate(
            '/admin/organization-management/organization/new',
            {state: {tab: activeTab}}
        );
    };

    const headerControls = (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
                <Input.Search
                    placeholder="Nach Name, E-Mail, Website oder Ort suchen"
                    onSearch={(v) => setSearchTerm(v)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ width: 420 }}
                />
                <Select
                    value={sortDirection}
                    onChange={(v) => setSortDirection(v)}
                    style={{ width: 160 }}
                >
                    <Select.Option value="asc">Name A-Z</Select.Option>
                    <Select.Option value="desc">Name Z-A</Select.Option>
                </Select>
            </Space>
        </div>
    );

    return (
        <section className="page-fill page-top">
            <TableView<OrganizationFullDto>
                title="Organisationen Management"
                buttonLabel="Organisation anlegen"
                onButtonClick={handleNew}
                tabs={TABS}
                activeTabKey={activeTab}
                onTabChange={handleTabChange}
                data={filteredOrganizations}
                columns={columns}
                rowKey="id"
                loading={loading}
                onRowClick={handleRowClick}
                headerExtra={headerControls}
            />
        </section>
    );
};

export default OrganizationManagementAdminPage;