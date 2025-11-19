import {useCallback, useMemo, useRef, useState} from "react";
import {Row, Col, List, Typography, Space, Empty, Divider, Avatar, Tag, Button, Tooltip} from "antd";
import {EnvironmentOutlined, LinkOutlined, AimOutlined, BankOutlined} from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {OrganizationBaseDto} from "../../../types/dtos/Organization.dto.ts";
import {MapContainer, TileLayer, Marker, Popup, LayersControl} from "react-leaflet";
import L, {Map as LeafletMap, Marker as LeafletMarker} from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import {buildOrgLogoSrc} from "../../../utils/logoHelper.ts";
import "./SolutionUsersTabComponent.less";
import 'leaflet-gesture-handling';
import GestureHandling from "leaflet-gesture-handling";
import {ScrollHint} from "../../../utils/leaflet.tsx";
import ExternalLink from "../../externalLink/ExternalLink.tsx";

export interface DigitalSolutionCardProps {
    solutionUsers: OrganizationBaseDto[] | undefined;
    solutionName: string;
}

// Leaflet-Icon-Fix
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);


export function SolutionUsersTabComponent({solutionUsers, solutionName}: DigitalSolutionCardProps) {
    const users = solutionUsers ?? [];

    // Map/Marker Refs + UI-State
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRefs = useRef<Record<string, LeafletMarker | null>>({});
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // Nur Einträge mit Koordinaten
    const usersWithCoords = useMemo(
        () => users.filter((u) => typeof u.lat === "number" && typeof u.lon === "number"),
        [users]
    );

    const focusUser = useCallback(
        (id: string) => {
            const map = mapRef.current;
            if (!map) return;

            const u = usersWithCoords.find((x) => String(x.id) === String(id));
            if (!u || typeof u.lat !== "number" || typeof u.lon !== "number") return;

            const target: [number, number] = [u.lat, u.lon];
            const targetZoom = Math.max(map.getZoom() ?? 6, 13);

            map.flyTo(target, targetZoom, {duration: 0.7});
            markerRefs.current[String(id)]?.openPopup();
            setFocusedId(String(id));
        },
        [usersWithCoords]
    );

    return (
        <div style={{paddingTop: 48}}>
            {/* ROW 1: Überschrift allein */}
            <Row>
                <Col span={24}>
                    <Typography.Title level={4} style={{marginBottom: 20}}>
                        Übersicht aller Anwender von {solutionName}
                    </Typography.Title>
                </Col>
            </Row>

            {/* ROW 2: Liste links, Karte rechts */}
            <Row gutter={[24, 24]}>
                {/* LINKE SPALTE: LISTE */}
                <Col xs={24} xl={8}>
                    {users.length === 0 ? (
                        <Empty description="Keine Anwender hinterlegt"/>
                    ) : (
                        <List
                            dataSource={users}
                            bordered
                            style={{maxHeight: 420, overflowY: "auto", overflowX: "hidden"}}
                            renderItem={(u) => {
                                const hasCoords = typeof u.lat === "number" && typeof u.lon === "number";
                                const isFocused = focusedId === String(u.id);
                                const logo = buildOrgLogoSrc(u);

                                return (
                                    <List.Item
                                        key={u.id}
                                        className="users-item"
                                        style={isFocused ? {background: "#e6f4ff"} : undefined}
                                    >
                                        {/* Haupt-Content (Avatar + Texte) */}
                                        <div className="users-item-main"
                                             style={{display: "flex", gap: 12, flex: 1, minWidth: 0}}>
                                            <Avatar
                                                shape="square"
                                                size={40}
                                                src={logo}
                                                icon={!logo ? <BankOutlined/> : undefined}
                                                alt={u.name}
                                                style={{background: logo ? "transparent" : undefined}}
                                            />

                                            <Space direction="vertical" size={2} style={{minWidth: 0, flex: 1}}>
                                                <Space size={8} align="center" style={{minWidth: 0}}>
                                                    <Typography.Text
                                                        strong
                                                        style={{
                                                            display: "block",
                                                            whiteSpace: "normal",
                                                            wordBreak: "break-word"
                                                        }}
                                                    >
                                                        {u.name}
                                                    </Typography.Text>
                                                    {isFocused && <Tag color="blue">Im Kartenfokus</Tag>}
                                                </Space>

                                                <Typography.Paragraph
                                                    type="secondary"
                                                    style={{
                                                        marginBottom: 0,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word"
                                                    }}
                                                >
                                                    <EnvironmentOutlined/> {u.zip} {u.city}
                                                </Typography.Paragraph>

                                                {u.website && (
                                                    <Typography.Paragraph
                                                        style={{
                                                            marginBottom: 0,
                                                            whiteSpace: "normal",
                                                            wordBreak: "break-word"
                                                        }}
                                                    >
                                                        <Space size={4} align="start">
                                                            <LinkOutlined />
                                                            <ExternalLink href={u.website}>{u.website}</ExternalLink>
                                                        </Space>
                                                    </Typography.Paragraph>
                                                )}

                                                {/* Button JETZT DIREKT UNTER DEM TEXT */}
                                                <div>
                                                    {hasCoords ? (
                                                        <Button
                                                            size="small"
                                                            type="link"
                                                            style={{padding: 0}}
                                                            icon={<AimOutlined/>}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                focusUser(String(u.id));
                                                            }}
                                                        >
                                                            Auf Karte zeigen
                                                        </Button>
                                                    ) : (
                                                        <Tooltip title="Kein Standort vorhanden">
                                                            <Button size="small" type="link" disabled
                                                                    icon={<AimOutlined/>}>
                                                                Auf Karte zeigen
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </Space>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </Col>

                {/* RECHTE SPALTE: KARTE (rutscht unter die Liste bei < lg) */}
                <Col xs={24} xl={16}>
                    <Divider style={{margin: "0 0 12px"}}/>
                    <div style={{height: 420, borderRadius: 8, overflow: "hidden"}}>
                        <MapContainer
                            center={[51.1657, 10.4515]}
                            zoom={6}
                            style={{ height: "100%", width: "100%" }}
                            ref={mapRef}
                            gestureHandling={true}
                        >
                            {/* Basiskarten zum Umschalten */}
                            <LayersControl position="topright">
                                <LayersControl.BaseLayer checked name="Straßenkarte (OSM)">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                </LayersControl.BaseLayer>

                                <LayersControl.BaseLayer name="Satellit (Esri)">
                                    <TileLayer
                                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    />
                                </LayersControl.BaseLayer>
                            </LayersControl>
                            {usersWithCoords.map((u) => {
                                const logo = buildOrgLogoSrc(u);
                                return (
                                    <Marker
                                        key={u.id}
                                        position={[u.lat!, u.lon!]}
                                        ref={(ref) => {
                                            markerRefs.current[String(u.id)] = (ref as unknown as LeafletMarker) ?? null;
                                        }}
                                    >
                                        <Popup className="ds-popup" minWidth={350} maxWidth={640}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                {logo && (
                                                    <img
                                                        src={logo}
                                                        alt={u.name}
                                                        width={32}
                                                        height={32}
                                                        style={{ borderRadius: 6, objectFit: "cover" }}
                                                    />
                                                )}
                                                <div>
                                                    <strong>{u.name}</strong>
                                                    <br />
                                                    {u.zip} {u.city}
                                                    {u.website && (
                                                        <div className="ds-popup-url">
                                                            <ExternalLink href={u.website}>
                                                                {u.website}
                                                            </ExternalLink>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                            <ScrollHint />
                        </MapContainer>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
