import { useEffect, useState } from "react";
import { Button, Col, Row, Tabs, Typography, Table, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./TableView.less";

const { Title } = Typography;

interface TableViewProps<T> {
    title: string;
    buttonLabel?: string;
    onButtonClick?: () => void;
    tabs?: { key: string; label: string }[];
    activeTabKey?: string;
    onTabChange?: (key: string) => void;

    data: T[];
    columns: ColumnsType<T>;
    rowKey: string;
    loading?: boolean;
    pageSize?: number;
    onRowClick?: (row: T) => void;
}

function TableView<T>({
                          title,
                          buttonLabel,
                          onButtonClick,
                          tabs,
                          activeTabKey,
                          onTabChange,
                          data,
                          columns,
                          rowKey,
                          loading = false,
                          pageSize = 10,
                          onRowClick,
                      }: TableViewProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [bodyHeight, setBodyHeight] = useState(300);
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, data.length);

    // Dynamische Scrollhöhe berechnen
    useEffect(() => {
        const updateHeight = () => {
            const reservedSpace = 40+ 65 + 50 + 60 + 25 + 60;
            setBodyHeight(window.innerHeight - reservedSpace);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, [tabs]);

    useEffect(() => {
        setCurrentPage(1); // reset page when tab changes
    }, [activeTabKey]);

    const paginatedData = data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );


    return (
        <div className="table-view">
            <div className="table-view-header">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>{title}</Title>
                    </Col>
                    {buttonLabel && onButtonClick && (
                        <Col>
                            <Button type="primary" onClick={onButtonClick}>
                                {buttonLabel}
                            </Button>
                        </Col>
                    )}
                </Row>

                {tabs && (
                    <Tabs
                        style={{ marginTop: 12 }}
                        items={tabs.map(tab => ({
                            key: tab.key,
                            label: tab.label
                        }))}
                        activeKey={activeTabKey}
                        onChange={onTabChange}
                    />
                )}
            </div>

            <div className="table-view-content">
                    <Table<T>
                        scroll={{ y: bodyHeight }}
                        loading={loading}
                        dataSource={paginatedData}
                        columns={columns}
                        rowKey={rowKey}
                        size="middle"
                        pagination={false}
                        locale={{ emptyText: "Keine Daten vorhanden" }}
                        onRow={(record) => ({
                            onClick: () => onRowClick?.(record),
                            style: { cursor: onRowClick ? "pointer" : "default" },
                        })}
                    />
                <div className="table-pagination">
                    <Pagination
                        current={currentPage}
                        total={data.length}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                    />
                    <div className="pagination-info">
                        Einträge {from}–{to} von {data.length}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TableView;
