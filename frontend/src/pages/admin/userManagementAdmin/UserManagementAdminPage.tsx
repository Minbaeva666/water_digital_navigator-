import {useCallback, useEffect, useState} from "react";
import {message} from "antd";
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

    return (
        <TableView<UserWithOrganizationDto>
            title="Benutzer Management"
            buttonLabel="Benutzer anlegen"
            onButtonClick={handleNew}
            tabs={TABS}
            activeTabKey={activeTab}
            onTabChange={handleTabChange}
            data={users}
            columns={columns}
            rowKey="id"
            loading={loading}
            onRowClick={handleRowClick}
        />
    );
};

export default UserManagementAdminPage;