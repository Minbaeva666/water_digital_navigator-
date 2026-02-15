import {Button, Col, Image, Row, Space, Typography} from "antd";
import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {digitalSolutionService} from "../../services/digitalSolutionService/digitalSolutionService.ts";
import {
    DigitalSolutionFormValues
} from "../../forms/digital-solution/DigitalSolutionFormValues.ts";
import {formatDateToGerman, mapDigitalSolutionDtoToForm} from "../../utils/formDataHelper.ts";
import {LeftOutlined, EditOutlined} from "@ant-design/icons";
import './DigitalAtlasDetailPage.less';
import {OverviewTabComponent} from "../../components/digitalAtlas/overviewTab/OverviewTabComponent.tsx";
import {FurtherImagesTabComponent} from "../../components/digitalAtlas/furtherImagesTab/FurtherImagesTabComponent.tsx";
import {DetailsTabComponent} from "../../components/digitalAtlas/detailsTab/DetailsTabComponent.tsx";
import {EMPTY_DIGITAL_SOLUTION_FORM} from "../../services/digitalSolutionService/digitalSolution.mapper.ts";
import {fetchSalutationTypes, TranslatedEnumOption} from "../../services/input/inputService.ts";
import {TaxonomyIndexRecord} from "../../types/UiTreeNode.ts";
import {taxonomyNodeService} from "../../services/taxonomyNodeService/taxonomyNodeService.ts";
import {SolutionUsersTabComponent} from "../../components/digitalAtlas/solutionUsersTab/SolutionUsersTabComponent.tsx";
import ExternalLink from "../../components/externalLink/ExternalLink.tsx";
import {useAuth} from "../../context/AuthContext.tsx";

const {Title, Text} = Typography; 


const DigitalAtlasDetailPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [digitalSolution, setdigitalSolution] = useState<DigitalSolutionFormValues>(EMPTY_DIGITAL_SOLUTION_FORM);
    const [activeTab, setActiveTab] = useState<"overview" | "details" | "solution-users" | "images">("overview");
    const [taxonomyIndex, setTaxonomyIndex] = useState<Record<string, TaxonomyIndexRecord> | null>(null);

    const [salutationsMap, setSalutationsMap] = useState<Record<string, string>>({});

    const hasFurtherImages = useMemo(
        () => (digitalSolution?.detailImages?.filter(Boolean).length ?? 0) > 0,
        [digitalSolution?.detailImages]
    );

    const hasSolutionUsers =
        ((digitalSolution?.solutionUsers?.length ??
            digitalSolution?.solutionUserIds?.length ??
            0) > 0);

    const images = useMemo(() => {
        if (!digitalSolution) return [];
        const title = digitalSolution.titleImage?.[0];
        const details = digitalSolution.detailImages ?? [];

        // Titelbild zuerst, danach alle Detailbilder, die nicht dasselbe uid haben
        const ordered = [
            ...(title ? [title] : []),
            ...details.filter(d => d?.uid && d.uid !== title?.uid),
        ];

        return ordered;
    }, [digitalSolution]);


    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const [dto, titleImage, detailImages, structure] = await Promise.all([
                        digitalSolutionService.fetchDigitalSolutionById(id),
                        digitalSolutionService.fetchTitleImageByDigitalSolution(id),
                        digitalSolutionService.fetchDetailImagesByDigitalSolution(id),
                        taxonomyNodeService.fetchTaxonomyStructure()
                    ]);

                    const formData = mapDigitalSolutionDtoToForm(dto, titleImage, detailImages);
                    setdigitalSolution(formData);
                    setTaxonomyIndex(structure?.index ?? null);
                } catch (error) {
                    console.error('Error fetching digital solution data:', error);
                } finally {
                }
            };
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const [salutations] = await Promise.all([
                    fetchSalutationTypes(),
                ]);
                setSalutationsMap(Object.fromEntries((salutations as TranslatedEnumOption[]).map(o => [o.value, o.label])));
                // setCountriesMap(Object.fromEntries((countries as TranslatedEnumOption[]).map(o => [o.value, o.label])));
            } catch (e) {
                console.error("Lookup fetch error:", e);
            }
        })();
    }, []);

    const handleBackClick = () => {
        window.history.back();
    };

    const handleEditClick = () => {
        navigate(`/admin/digital-solution-management/digital-solution/${id}/edit`);
    };


    function getPresenterName(values: DigitalSolutionFormValues): string {
        // Fall 1: von User präsentiert
        if (values?.solutionPresentedByUser) {
            if (values.presentedByUser) {
                const u = values.presentedByUser;
                // Prüfen ob Felder vorhanden sind (abhängig von deinem DTO: firstName oder firstName?)
                return [u.firstName, u.lastName].filter(Boolean).join(" ");
            }
            return ""; // kein presentedByUser → leer
        }

        // Fall 2: von Organisation präsentiert
        if (values?.organization) {
            return values.organization.name ?? "";
        }

        // Fallback
        return "Keine Quelle vorhanden";
    }

    return (
        <div className={"digital-atlas-detail-container"}>
            {/* Kopfzeile mit Navigation */}
            <Row justify="space-between" align="middle">
                {/* Linker Bereich */}
                <Col>
                    <Button
                        icon={<LeftOutlined/>}
                        onClick={handleBackClick}
                        type="link"
                        style={{padding: 0, fontSize: '1rem'}}
                    >
                        Zurück zu Übersicht
                    </Button>
                </Col>
                {/* Rechter Bereich */}
                {user?.role === "ADMIN" && (
                    <Col>
                        <Button
                            icon={<EditOutlined/>}
                            onClick={handleEditClick}
                            type="primary"
                        >
                            Bearbeiten
                        </Button>
                    </Col>
                )}
            </Row>

            <Row gutter={[24, 24]} align="top">
                {/* Textbereich */}
                <Col xs={24} md={12} xl={12} xxl={10} order={1}>
                    <Title>{digitalSolution?.name}</Title>

                    {/* Mobil: Text + Buttons erst nach dem Bild */}
                    <div className="desktop-only">
                        <Text>{digitalSolution?.shortDescription}</Text>

                        <div style={{marginTop: "1rem"}}>
                            <Title level={4}>Link zur Digitalen Lösung</Title>
                            <Text>
                                <ExternalLink href={digitalSolution?.link!}>
                                    {digitalSolution?.link}
                                </ExternalLink>
                            </Text>
                        </div>

                        <div style={{marginTop: "3rem"}}>
                            <Space wrap>
                                <Button size={"large"}
                                        type={activeTab === "overview" ? "primary" : "default"}
                                        onClick={() => setActiveTab("overview")}
                                >
                                    Übersicht
                                </Button>
                                <Button size={"large"}
                                        type={activeTab === "details" ? "primary" : "default"}
                                        onClick={() => setActiveTab("details")}
                                >
                                    Details
                                </Button>
                                {hasSolutionUsers && (
                                    <Button size="large"
                                            type={activeTab === "solution-users" ? "primary" : "default"}
                                            onClick={() => setActiveTab("solution-users")}
                                    >
                                        Anwender
                                    </Button>
                                )}
                                {hasFurtherImages && (
                                    <Button size={"large"}
                                            type={activeTab === "images" ? "primary" : "default"}
                                            onClick={() => setActiveTab("images")}
                                    >
                                        Weitere Bilder
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                </Col>

                {/* Bild */}
                <Col xs={24} md={12} xl={12} xxl={10} order={2} style={{ textAlign: "left" }}>
                    {/* Bild + Caption gemeinsam kleiner */}
                    <div style={{ maxWidth: 320 }}> {/* << Größe hier anpassen (z.B. 300–360) */}
                        {images.length > 0 && (() => {
                            const file = images[0];
                            const src = typeof file?.thumbUrl === "string" ? file.thumbUrl : undefined;
                            if (!src) return null;
                            return (
                                <Image
                                    src={src}
                                    alt={file?.name}
                                    style={{
                                        width: "100%",          // füllt nur die kleine Wrapper-Box
                                        height: "auto",
                                        objectFit: "contain",
                                        userSelect: "none",
                                    }}
                                    preview={false}
                                    draggable={false}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            );
                        })()}

                        {/* Text unter Bild */}
                        <div
                            style={{
                                fontSize: "0.85em",
                                color: "#666",
                                textAlign: "left",
                                marginTop: 4,
                                maxWidth: "100%",       // an Wrapper angepasst
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                hyphens: "auto",
                            }}
                        >
                            © {getPresenterName(digitalSolution!)}
                            {formatDateToGerman(digitalSolution?.createdAtOverride)
                                ? `, ${formatDateToGerman(digitalSolution?.createdAtOverride)}`
                                : ""}
                        </div>
                    </div>

                    {/* Nur auf Mobil: ... (unverändert) */}
                    <div className="mobile-only">
                        <Text>{digitalSolution?.longDescription}</Text>

                        <div style={{marginTop: "1rem"}}>
                            <Title level={5}>Link zur Digitalen Lösung</Title>
                            <Text>
                                <a
                                    href={digitalSolution?.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {digitalSolution?.link}
                                </a>
                            </Text>
                        </div>

                        <div style={{marginTop: "2rem"}}>
                            <Space wrap>
                                <Button
                                    type={activeTab === "overview" ? "primary" : "default"}
                                    onClick={() => setActiveTab("overview")}
                                >
                                    Übersicht
                                </Button>
                                <Button
                                    type={activeTab === "details" ? "primary" : "default"}
                                    onClick={() => setActiveTab("details")}
                                >
                                    Details
                                </Button>
                                {hasSolutionUsers && (
                                    <Button
                                        type={activeTab === "solution-users" ? "primary" : "default"}
                                        onClick={() => setActiveTab("solution-users")}
                                    >
                                        Anwender
                                    </Button>
                                )}
                                {hasFurtherImages && (
                                    <Button
                                        type={activeTab === "images" ? "primary" : "default"}
                                        onClick={() => setActiveTab("images")}
                                    >
                                        Weitere Bilder
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                </Col>
            </Row>


            {/* Detaillierte Beschreibung */}
            {activeTab === "details" && (
                <DetailsTabComponent
                    digitalSolution={digitalSolution}
                />
            )}

            {/* Kurzübersicht */}
            {activeTab === "overview" && (
                <OverviewTabComponent
                    digitalSolution={digitalSolution}
                    salutationsMap={salutationsMap}
                    taxonomyIndex={taxonomyIndex}
                />
            )}

            {/* Anwender */}
            {activeTab === "solution-users" && (
                <SolutionUsersTabComponent
                    solutionUsers={digitalSolution?.solutionUsers}
                    solutionName={digitalSolution?.name}
                />
            )}

            {/* Bilder */}
            {activeTab === "images" && (
                <FurtherImagesTabComponent
                    images={digitalSolution.detailImages}
                />
            )}

        </div>
    );
}

export default DigitalAtlasDetailPage;