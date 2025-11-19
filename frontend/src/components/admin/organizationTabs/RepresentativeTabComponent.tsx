import React from "react";
import {FormInstance, Table} from "antd";
import type { ColumnsType } from "antd/es/table";
import {OrganizationFormValues} from "../../../types/dtos/Organization.dto.ts";

interface UserDto {
    id: string;
    firstName: string;
    lastName: string;
    state?: string;
}

interface RepresentativeTabProps {
    form: FormInstance<OrganizationFormValues>;
}

export const RepresentativeTabComponent: React.FC<RepresentativeTabProps> = ({form}) => {
    const users: UserDto[] = form.getFieldValue("users") || [];

    const columns: ColumnsType<UserDto> = [
        {
            title: "Vorname",
            dataIndex: "firstName",
            key: "firstName",
        },
        {
            title: "Nachname",
            dataIndex: "lastName",
            key: "lastName",
        },
        {
            title: "Status",
            dataIndex: "state",
            key: "state",
            render: (state) => state || "–",
        },
    ];

    return (
        <Table<UserDto>
            rowKey="id"
            columns={columns}
            dataSource={users}
            pagination={false}
            locale={{ emptyText: "Keine Vertreter:innen verfügbar" }}
        />
    );
};
