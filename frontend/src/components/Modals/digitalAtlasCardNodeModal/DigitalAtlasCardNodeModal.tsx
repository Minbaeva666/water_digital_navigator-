import React from "react";
import {Button, Modal, Tooltip, Typography} from "antd";
import "./DigitalAtlasCardNodeModal.less";
import {PickedNode} from "../../taxonomyFilterNav/TaxonomyFilterNav.tsx";

const {Text} = Typography;

export type NodeGroup = {
    rootId: string;
    rootName: string;
    rootColor?: string;
    items: any[];
};

type Props = {
    open: boolean;
    onCancel: () => void;
    groupedAll: NodeGroup[];
    loading?: boolean;
    getNodeName: (n: any) => string;
    width?: string | number;
    rootClassName?: string;
    setQuery: (node: PickedNode) => void;
};

const DigitalAtlasCardNodeModal: React.FC<Props> = ({
                                                        open,
                                                        onCancel,
                                                        groupedAll,
                                                        loading = false,
                                                        getNodeName,
                                                        width = "50vw",
                                                        rootClassName = "responsive-modal",
                                                        setQuery
                                                    }) => {


    const sorted = React.useMemo(
        () => [...groupedAll].sort((a, b) => a.rootName.localeCompare(b.rootName, "de")),
        [groupedAll]
    );

    const stopEarly: React.MouseEventHandler = (e) => e.stopPropagation();

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={"Alle Kategorien"}
            destroyOnHidden={true}
            centered
            width={width}
            rootClassName={rootClassName}
            styles={{
                content: { display: "flex", flexDirection: "column", height: "60vh" },
                body: { flex: 1, overflowY: "auto", paddingTop: 8 },
            }}
            maskClosable
            footer={[
                <Button key="close" onClick={onCancel}>
                    Fenster schließen
                </Button>,
            ]}
        >
            <div className="da-modal" onClick={stopEarly}>
                {loading && <Text type="secondary">Lade Kategorien…</Text>}
                {!loading && sorted.length === 0 && (
                    <Text type="secondary">Keine Kategorien verfügbar.</Text>
                )}

                {!loading && sorted.length > 0 && (
                    <div className="da-grid cozy">
                        {sorted.map((group) => {
                            return (
                                <section
                                    className={`da-group`}
                                    key={group.rootId}
                                >
                                    <header
                                        className="da-group-header"
                                    >
                                        <span className="da-group-title">{group.rootName}</span>
                                    </header>

                                        <div className="da-tags">
                                            {group.items.map((node) => (
                                                <Tooltip title="Begriff auswählen, um danach zu filtern" key={node.id}>
                                                    <Typography.Text
                                                        className="node-text"
                                                        style={{
                                                            color: node.color || "inherit",
                                                            lineHeight: "20px",
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setQuery(node);
                                                            onCancel();
                                                        }}
                                                    >
                                                        {getNodeName(node)}
                                                    </Typography.Text>
                                                </Tooltip>
                                            ))}
                                        </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default DigitalAtlasCardNodeModal;
