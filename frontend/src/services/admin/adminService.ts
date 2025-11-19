import axiosInstance from "../auth/axiosInstance.ts";
import {AccountState, Role} from "../../types/constants/enums.ts";
import {UserWithOrganizationDto} from "../../types/dtos/User.dto.ts";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const baseUrl = `${backendUrl}/users`;

const fetchUsersWithState = async (accountState: AccountState
): Promise<UserWithOrganizationDto[]> => {
    const params = accountState ? {accountState} : undefined;
    const {data} = await axiosInstance.get<UserWithOrganizationDto[]>(baseUrl + "/by-state", {params});
    return data;
};

// const fetchUsersWithRole = async (role: Role
// ): Promise<UserWithOrganizationDto[]> => {
//     const params = role ? {role} : undefined;
//     const {data} = await axiosInstance.get<UserWithOrganizationDto[]>(baseUrl, {params});
//     return data;
// };

export const fetchUsersWithRoles = async (
    ...roles: Role[]
): Promise<UserWithOrganizationDto[]> => {
    // Wenn mindestens eine Rolle übergeben wurde, bauen wir params: { role: ['ADMIN', 'MODERATOR', ...] }
    // Axios serialisiert das dann zu: ?role=ADMIN&role=MODERATOR&…
    const params = roles.length > 0
        ? { role: roles }
        : undefined;

    const { data } = await axiosInstance.get<UserWithOrganizationDto[]>(baseUrl + "/by-role", { params });
    return data;
};

export const adminService = {
    fetchUsersWithState,
    fetchUsersWithRoles
};
