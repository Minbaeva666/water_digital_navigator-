import dayjs from "dayjs";
import "dayjs/locale/de";
dayjs.locale("de");
import deDE from "antd/locale/de_DE";


// Definiere das benutzerdefinierte Thema
export const  customTheme = {
    token: {
        colorPrimary: '#2962FA', // Primärfarbe
        fontFamily: 'Sora', // Schriftart
        fontSizeBase: 16, // Basis-Schriftgröße (Standardgröße, z.B. für Buttons und Inputs)
        fontSizeHeading1: 32, // Schriftgröße für H1-Überschriften
        fontSizeHeading2: 24, // Schriftgröße für H2-Überschriften
        fontSizeHeading3: 18, // Schriftgröße für H3-Überschriften
        fontSizeHeading4: 16, // Schriftgröße für H4-Überschriften
        fontSizeHeading5: 14, // Schriftgröße für H5-Überschriften
        motion: false,
    },
    components: {
        Button: {
            defaultBg: "#ffffff",
            defaultColor: "rgba(0,0,0,0.88)",
            defaultBorderColor: "#d9d9d9",

            // Hover/Active sollen weiß bleiben
            defaultHoverBg: "#ffffff",
            defaultHoverBorderColor: "#1677ff",
            defaultActiveBg: "#ffffff",
            defaultActiveBorderColor: "#1677ff",

            // Optional: Schatten deaktivieren
            defaultShadow: "none",
            primaryShadow: "none",
        },
    },
};

// Definiere die benutzerdefinierte Lokalisierung
export const customLocale = deDE;

// Definiere andere benutzerdefinierte Einstellungen (optional)
// export const customSettings = {
//     autoInsertSpaceInButton: false, // Option für chinesische Buttons
// };