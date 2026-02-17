import axiosInstance from "../auth/axiosInstance.ts";
import {AccountState, Role} from "../../types/constants/enums.ts";
import {UserWithOrganizationDto} from "../../types/dtos/User.dto.ts";

const baseUrl = `/api/users`;

const fetchUsersWithState = async (accountState: AccountState
): Promise<UserWithOrganizationDto[]> => {
    const params = accountState ? {accountState} : undefined;
    const {data} = await axiosInstance.get<UserWithOrganizationDto[]>(baseUrl + "/by-state", {params});
    return data;
};

export const fetchUsersWithRoles = async (
    ...roles: Role[]
): Promise<UserWithOrganizationDto[]> => {
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
