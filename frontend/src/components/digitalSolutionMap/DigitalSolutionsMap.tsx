import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import L, { DivIcon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling";
import GestureHandling from "leaflet-gesture-handling";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import { ScrollHint } from "../../utils/leaflet";
import "./DigitalSolutionsMap.less";
import {SolutionWithCoords} from "../../utils/map.helper.tsx";
import ExternalLink from "../externalLink/ExternalLink.tsx";


// Gesture Handling aktivieren
// @ts-ignore
L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

const coordKey = (lat: number, lon: number) => `${lat}|${lon}`;

interface Props {
    solutions: SolutionWithCoords[];
    height?: number | string;
}

export default function DigitalSolutionsMap({ solutions, height = 500 }: Props) {
    const points = useMemo(
        () => (solutions ?? []).filter((s) => typeof s.lat === "number" && typeof s.lon === "number"),
        [solutions]
    );

    // Nach Koordinaten gruppieren
    const groups = useMemo(() => {
        const map = new Map<string, { lat: number; lon: number; items: SolutionWithCoords[] }>();
        for (const s of points) {
            const key = coordKey(s.lat as number, s.lon as number);
            if (!map.has(key)) {
                map.set(key, { lat: s.lat as number, lon: s.lon as number, items: [] });
            }
            map.get(key)!.items.push(s);
        }
        for (const g of map.values()) {
            g.items.sort((a, b) => (a.title || "").localeCompare(b.title || "", "de"));
        }
        return Array.from(map.values());
    }, [points]);

    // Bounds über alle Marker
    const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
        if (groups.length === 0) return undefined;
        return L.latLngBounds(groups.map((g) => [g.lat, g.lon]));
    }, [groups]);

    const center: [number, number] = [51.1657, 10.4515];

    // Icon-Factory mit Zahl
    const makeCountIcon = (count: number): DivIcon =>
        L.divIcon({
            className: "ds-count-marker",
            html: `<div class="ds-marker-bg"><span class="ds-marker-count">${count}</span></div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18],
        });

    return (
        <div style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}>
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                // @ts-ignore
                gestureHandling={true}
                bounds={bounds}
                boundsOptions={{ padding: [40, 40] }}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Straßenkarte (OSM)">
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
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

                {groups.map((g, i) => (
                    <Marker
                        key={`${g.lat},${g.lon},${i}`}
                        position={[g.lat, g.lon]}
                        icon={makeCountIcon(g.items.length)}
                        title={`${g.items.length} Organisationen in dieser Stadt`}
                    >
                        <Popup className="ds-popup" minWidth={350} maxWidth={640}>
                            <div className="ds-popup-header">
                                <strong>
                                    {g.items.length} Organisation{g.items.length === 1 ? "" : "en"} in {g.items[0].city}
                                </strong>
                            </div>
                            <div className="ds-popup-list">
                                {g.items.map((item) => (
                                    <div key={item.id} className="ds-popup-item">
                                        <div className="ds-popup-title">{item.title}</div>
                                        {item.municipality && <div className="ds-popup-sub">{item.municipality}</div>}
                                        {item.website && (
                                            <div className="ds-popup-url">
                                                <ExternalLink href={item.website}>{item.website}</ExternalLink>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ScrollHint />
            </MapContainer>
        </div>
    );
}
