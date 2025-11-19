import React, { useState } from "react";
import GenericModal from "../Modals/genericModal/GenericModal.tsx";

interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
    const [open, setOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleConfirm = () => {
        window.open(href, "_blank", "noopener,noreferrer");
        setOpen(false);
    };

    const urlStyle: React.CSSProperties = {
        margin: "16px 0",
        fontWeight: "bold",
        whiteSpace: "normal",
        overflowWrap: "anywhere", // moderne Browser
        wordBreak: "break-word",  // Fallback für andere
        // wordBreak: "break-all", // <- nur falls wirklich nötig (unsanfterer Break)
    };

    return (
        <>
            <a href={href} onClick={handleClick} rel="noopener noreferrer">
                {children}
            </a>

            <GenericModal
                open={open}
                title="Externe Seite öffnen?"
                text={
                    <div>
                        Sie verlassen Digital Lotse Wasser und werden auf eine externe Webseite weitergeleitet:
                        <div style={urlStyle}>{href}</div>
                        Möchten Sie fortfahren?
                    </div>
                }
                onCancel={() => setOpen(false)}
                onConfirm={handleConfirm}
                cancelText="Abbrechen"
                confirmText="Externe Seite öffnen"
            />
        </>
    );
};

export default ExternalLink;
