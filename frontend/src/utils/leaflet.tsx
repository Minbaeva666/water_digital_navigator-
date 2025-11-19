import {useMap} from "react-leaflet";
import {useEffect, useState} from "react";

export function EnableCtrlZoom() {
    const map = useMap();

    useEffect(() => {
        function onWheel(e: WheelEvent) {
            if (e.ctrlKey) {
                // wenn STRG gedrückt → temporär aktivieren
                map.scrollWheelZoom.enable();
            } else {
                map.scrollWheelZoom.disable();
            }
        }

        map.scrollWheelZoom.disable(); // initial aus
        map.getContainer().addEventListener("wheel", onWheel);

        return () => {
            map.getContainer().removeEventListener("wheel", onWheel);
        };
    }, [map]);

    return null;
}

export function ScrollHint() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.ctrlKey) setShow(false);
        }

        function onKeyUp() {
            setShow(true);
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    if (!show) return null;

    return (
        <div
            style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                pointerEvents: "none", // nicht klickbar
                zIndex: 1000,
            }}
        >
            Zum Zoomen STRG + Mausrad benutzen
        </div>
    );
}