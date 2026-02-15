import {useCallback, useEffect, useMemo, useState} from "react";
import {message, Input, Select, Space} from "antd";
import {ColumnsType} from "antd/es/table";
import {adminService} from "../../../services/admin/adminService.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {UserWithOrganizationDto} from "../../../types/dtos/User.dto.ts";
import {AccountState, Role} from "../../../types/constants/enums.ts";
import TableView from "../../../components/TableView/TableView.tsx";

const TAB_KEYS = {
    UNVERIFIED: "UNVERIFIED",
    REGISTERED: "REGISTERED",
    MODERATORS: "MODERATORS",
} as const;

const TABS = [
    { key: TAB_KEYS.UNVERIFIED, label: "Registrierungsanfragen" },
    { key: TAB_KEYS.REGISTERED, label: "Registrierte User" },
    { key: TAB_KEYS.MODERATORS, label: "Administratoren/Moderatoren" },
];


const columns: ColumnsType<UserWithOrganizationDto> = [
    {
        title: "Vorname",
        dataIndex: "firstName",
        key: "firstName",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Nachname",
        dataIndex: "lastName",
        key: "lastName",
        width: 200,
        ellipsis: true,
    },
    {
        title: "E-Mail",
        dataIndex: "email",
        key: "email",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Organisation",
        dataIndex: ["organization", "name"],
        key: "organization",
        render: (name) => name ?? "–",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Rolle",
        dataIndex: "role",
        key: "role",
        width: 200,
        ellipsis: true,
    },
    {
        title: "Status",
        dataIndex: "accountState",
        key: "accountState",
        width: 200,
        ellipsis: true,
    },
];

const UserManagementAdminPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.tab ?? TAB_KEYS.REGISTERED;
    const [users, setUsers] = useState<UserWithOrganizationDto[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortField, setSortField] = useState<string>("lastName");
    const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc');
    const [loading, setLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<keyof typeof TAB_KEYS>(initialTab);


    const loadUsers = useCallback(async (type: keyof typeof TAB_KEYS) => {
        setLoading(true);
        try {
            let data: UserWithOrganizationDto[] = [];
            switch (type) {
                case TAB_KEYS.UNVERIFIED:
                    data = await adminService.fetchUsersWithState(AccountState.VERIFY_EMAIL);
                    break;
                case TAB_KEYS.REGISTERED:
                    data = await adminService.fetchUsersWithState(AccountState.REGISTERED);
                    break;
                case TAB_KEYS.MODERATORS:
                    data = await adminService.fetchUsersWithRoles(Role.ADMIN, Role.MODERATOR);
                    break;
            }
            setUsers(data);
        } catch {
            message.error("Benutzer konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers(activeTab);
    }, [activeTab]);

    const filteredAndSorted = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let list = users.slice();
        if (term.length > 0) {
            list = list.filter(u => {
                const orgName = u.organization?.name ?? "";
                return (
                    (u.firstName ?? "").toLowerCase().includes(term) ||
                    (u.lastName ?? "").toLowerCase().includes(term) ||
                    (u.email ?? "").toLowerCase().includes(term) ||
                    orgName.toLowerCase().includes(term)
                );
            });
        }

        const compare = (a: any, b: any) => {
            const aVal = sortField === 'organization' ? a.organization?.name ?? '' : (a[sortField] ?? '');
            const bVal = sortField === 'organization' ? b.organization?.name ?? '' : (b[sortField] ?? '');
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        };

        list.sort(compare);
        return list;
    }, [users, searchTerm, sortField, sortDirection]);

    const handleTabChange = (key: string) => {
        setActiveTab(key as keyof typeof TAB_KEYS);
        const tabKey = key as keyof typeof TAB_KEYS;
        setActiveTab(tabKey);
    };

    const handleNew = () => {
        navigate(
            `/admin/user-management/user/new`,
            { state: { tab: activeTab } }
        );
    };

    const handleRowClick = (row: UserWithOrganizationDto) => {
        navigate(
            `/admin/user-management/user/${row.id}/edit`,
            { state: { tab: activeTab } }
        );
    };

    const headerControls = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
                <Input.Search
                    placeholder="Nach Vorname, Nachname, E-Mail oder Organisation suchen"
                    onSearch={(v) => setSearchTerm(v)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ width: 420 }}
                />

                <Select value={sortField} onChange={(v) => setSortField(String(v))} style={{ width: 160 }}>
                    <Select.Option value="firstName">Vorname</Select.Option>
                    <Select.Option value="lastName">Nachname</Select.Option>
                    <Select.Option value="email">E-Mail</Select.Option>
                    <Select.Option value="organization">Organisation</Select.Option>
                    <Select.Option value="role">Rolle</Select.Option>
                    <Select.Option value="accountState">Status</Select.Option>
                </Select>

                <Select value={sortDirection} onChange={(v) => setSortDirection(v)} style={{ width: 120 }}>
                    <Select.Option value="asc">Aufsteigend</Select.Option>
                    <Select.Option value="desc">Absteigend</Select.Option>
                </Select>
            </Space>
        </div>
    );

    return (
        <TableView<UserWithOrganizationDto>
            title="Benutzer Management"
            buttonLabel="Benutzer anlegen"
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

export default UserManagementAdminPage;