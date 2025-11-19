import {Badge, Card, Typography} from "antd";
import {DigitalSolutionDto} from "../../../types/dtos/DigitalSolutionDto.ts";
import {useTranslation} from "react-i18next";
import {formatDateToGerman} from "../../../utils/formDataHelper.ts";
import i18n from "../../../i18n/i18n.ts";
import {useNavigate} from "react-router-dom";
import "./DigitalSolutionCard.less"
import {RightOutlined} from "@ant-design/icons";
import {TaxonomyIndexRecord} from "../../../types/UiTreeNode.ts";
import DigitalAtlasCardNodeModal from "../../Modals/digitalAtlasCardNodeModal/DigitalAtlasCardNodeModal.tsx";
import dayjs from "dayjs";
import React from "react";
import {PickedNode} from "../../taxonomyFilterNav/TaxonomyFilterNav.tsx";

const {Title, Paragraph, Text} = Typography;

export interface DigitalSolutionCardProps {
    digitalSolution: DigitalSolutionDto;
    taxonomyIndex: Record<string, TaxonomyIndexRecord> | null;
    setQuery: (node: PickedNode) => void;
}

type Group = { rootId: string; rootName: string; rootColor?: string; items: any[] };


export function DigitalSolutionCard({digitalSolution, taxonomyIndex, setQuery}: DigitalSolutionCardProps) {
    const navigate = useNavigate();
    const {t} = useTranslation();

    const {name, shortDescription, titleImage, offeringCategory, id, createdAt} = digitalSolution;
    const MAX_TAGS = 6;

    const [isMoreOpen, setIsMoreOpen] = React.useState(false);

    // Nodes aus Response ziehen (Duplikate vermeiden)
    const rawNodes = (digitalSolution.taxonomyNodes ?? [])
        .map((t: any) => t?.taxonomyNode)
        .filter(Boolean);

    const nodes: any[] = React.useMemo(
        () => Array.from(new Map(rawNodes.map((n: any) => [n.id, n])).values()),
        [rawNodes]
    );

    const favNodes = React.useMemo(() => {
        if (!taxonomyIndex) return [];
        return nodes.filter((n: any) => {
            const idx = taxonomyIndex[n.id];
            const rootId = idx?.rootId ?? n.id;
            const rootMeta: any = taxonomyIndex[rootId];

            // Fallback: falls rootMeta fehlt, prüfe den Node selbst nur dann, wenn er root ist (depth === 0)
            const isFav =
                (rootMeta?.isFav !== undefined ? rootMeta.isFav : undefined) ??
                (n?.depth === 0 ? n?.isFav : undefined);

            return isFav === true;
        });
    }, [nodes, taxonomyIndex]);

    // const visibleNodes = favNodes.slice(0, MAX_TAGS);
    // const visibleIds = new Set(visibleNodes.map(n => n.id));
    // const hiddenNodes = nodes.filter(n => !visibleIds.has(n.id));


    // Bildquelle
    const imageSrc =
        titleImage?.dataUri ??
        titleImage?.path ??
        "https://via.placeholder.com/300x200";

    const offeringCategoryLabel = offeringCategory ? t(`offeringCategoryTypes.${offeringCategory}`) : undefined;
    const createdAtDate = formatDateToGerman(digitalSolution.createdAt);

    const getNodeName = (n: any) => {
        const isDe = i18n.language?.startsWith("de");
        return isDe ? (n.nameDe ?? n.nameEn ?? n.slug) : (n.nameEn ?? n.nameDe ?? n.slug);
    };

    // Card Interaktionen
    const openMore = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMoreOpen(true);
    };
    const stopEarly: React.MouseEventHandler = (e) => {
        e.stopPropagation();
    };
    const closeMore = () => setIsMoreOpen(false);

    const handleCardClick: React.MouseEventHandler = (e) => {
        if (isMoreOpen) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        navigate(`/digital-atlas/digitale-solution/${id}`);
    };


    // Gruppierung nach Root (Ebene 0) via taxonomyIndex (vom Parent)
    const groupsMap = React.useMemo(() => {
        const acc: Record<string, Group> = {};
        if (!taxonomyIndex) return acc;

        for (const node of nodes) {
            const idx = taxonomyIndex[node.id];
            const rootId = idx?.rootId ?? node.id;
            const rootMeta = taxonomyIndex[rootId] ?? node;

            const isDe = i18n.language?.startsWith("de");
            const nameDe = (rootMeta as any).nameDe ?? node.nameDe;
            const nameEn = (rootMeta as any).nameEn ?? node.nameEn;
            const rootName = isDe ? (nameDe ?? nameEn ?? (rootMeta as any).slug) : (nameEn ?? nameDe ?? (rootMeta as any).slug);
            const rootColor = (rootMeta as any).color ?? undefined;

            if (!acc[rootId]) {
                acc[rootId] = {rootId, rootName, rootColor, items: []};
            }
            acc[rootId].items.push(node);
        }
        return acc;
    }, [nodes, taxonomyIndex, i18n.language]);

    const groupedAll = React.useMemo(
        () =>
            Object.values(groupsMap).sort((a, b) =>
                a.rootName.localeCompare(b.rootName, i18n.language || "de")
            ),
        [groupsMap, i18n.language]
    );

    const getRootId = (node: any) => {
    const idx = taxonomyIndex?.[node.id];
    return idx?.rootId ?? node.id;
    };

    const rootRank = React.useMemo(() => {
    const m = new Map<string, number>();
    groupedAll.forEach((g, i) => m.set(g.rootId, i));
    return m;
    }, [groupedAll]);

    const sortedFavNodes = React.useMemo(() => {
    const lang = i18n.language || "de";
    return [...favNodes].sort((a, b) => {
        const ra = rootRank.get(getRootId(a)) ?? Number.MAX_SAFE_INTEGER;
        const rb = rootRank.get(getRootId(b)) ?? Number.MAX_SAFE_INTEGER;
        if (ra !== rb) return ra - rb;
        return getNodeName(a).localeCompare(getNodeName(b), lang);
    });
    }, [favNodes, rootRank, i18n.language, taxonomyIndex]);

    const visibleNodes = sortedFavNodes.slice(0, MAX_TAGS);
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const hiddenNodes = nodes.filter(n => !visibleIds.has(n.id));


    // "Neu"-Bedingung: createdAt innerhalb der letzten 4 Monate?
    const isNew = React.useMemo(() => {
        if (!createdAt) return false;
        return dayjs(createdAt).isAfter(dayjs().subtract(2, "month"));
    }, [createdAt]);

    return (
        <Badge.Ribbon text="Neu" color="geekblue" style={{display: isNew ? "block" : "none"}}>
            <Card
                onClick={handleCardClick}
                hoverable
                className="custom-card"
                cover={
                    <div
                        style={{
                            backgroundColor: "#fff",
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={imageSrc}
                            alt={name}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                    </div>
                }
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: 500,
                        width: "100%",
                        padding: 10,
                    }}
                >
                    {(createdAtDate || offeringCategoryLabel) && (
                        <div style={{display: "flex", justifyContent: "space-between", marginTop: 12}}>
                            {createdAtDate && (
                                <Text style={{fontSize: 12, color: "gray"}}>{createdAtDate}</Text>
                            )}
                            {offeringCategoryLabel && (
                                <Text style={{color: "green"}}>{offeringCategoryLabel}</Text>
                            )}
                        </div>
                    )}

                    <Title level={3} style={{margin: "6px 0"}}>
                        {name}
                    </Title>

                    <Paragraph ellipsis={{rows: 8, expandable: false}} style={{whiteSpace: "normal"}}>
                        {shortDescription}
                    </Paragraph>


                    {/* statt Tags -> farbiger Text */}
                    <div
                        style={{
                            marginTop: "auto",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "flex-start",
                        }}
                        className="no-nav"
                        onMouseDown={stopEarly}
                    >
                        {visibleNodes.map((node: any) => (
                            <Typography.Text
                                key={node.id}
                                className="node-text"
                                style={{
                                    color: node.color || "inherit",
                                    lineHeight: "20px",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setQuery(node);
                                }}
                            >
                                {getNodeName(node)}
                            </Typography.Text>
                        ))}

                        {hiddenNodes.length > 0 && (
                            <Typography.Link
                                style={{fontSize: 14, color: "#000", fontWeight: 400}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openMore(e as any);
                                }}
                                className="more-categories-link"
                            >
                                +{hiddenNodes.length}{" "}
                                {t("digitalSolution.moreCategories", "weitere Kategorien ansehen")}
                            </Typography.Link>
                        )}
                    </div>

                    <DigitalAtlasCardNodeModal
                        open={isMoreOpen}
                        onCancel={closeMore}
                        groupedAll={groupedAll}
                        loading={!taxonomyIndex}
                        getNodeName={getNodeName}
                        setQuery={setQuery}
                    />

                    <div
                        style={{
                            marginTop: "16px",
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Typography.Link
                            className="details-link"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(e);
                            }}
                        >
                            {t("common.readMore", "Mehr Details zum Projekt")} <RightOutlined/>
                        </Typography.Link>
                    </div>
                </div>
            </Card>
        </Badge.Ribbon>
    );
}

export default DigitalSolutionCard;
