// src/components/ContactFloatingButton/ContactFloatingButton.tsx

import React, { useState } from "react";
import { Button, message, Tooltip, Modal, Input } from "antd";
import {
  LinkOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ContactFloatingButton.less";

const ContactFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleOpenContact = () => {
    navigate("/kontakt");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title || "Digital Lotse Wasser";
    const text = "Schauen Sie sich diese Website an:";

    try {
      if (navigator.share) {
        // HTTPS oder localhost → nativer Share-Dialog
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // HTTP (z.B. auf dem Server) → Kopieren + eigene Share-Modal
        await navigator.clipboard.writeText(url);
        message.success("Link in die Zwischenablage kopiert.");
        setShareModalOpen(true);
      } else {
        // ganz alte Browser 
        setShareModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <div
        className={`fab-wrapper ${collapsed ? "fab-wrapper-collapsed" : ""}`}
      >
        {/* Toggle-Leiste */}
        <Tooltip
          title={collapsed ? "Einblenden" : "Ausblenden"}
          placement="left"
        >
          <Button
            type="default"
            shape="circle"
            size="large"
            icon={collapsed ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
            className="fab-toggle"
            onClick={toggleCollapsed}
          />
        </Tooltip>

        {/* Buttons nur wenn nicht eingeklappt */}
        {!collapsed && (
          <>
            <Tooltip title="Seite teilen" placement="left">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<LinkOutlined />}
                className="share-fab"
                onClick={handleShare}
              />
            </Tooltip>

            <Tooltip title="Kontakt" placement="left">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<ContactsOutlined />}
                className="contact-fab"
                onClick={handleOpenContact}
              />
            </Tooltip>
          </>
        )}
      </div>

      {/* Eigene Share-Modal für HTTP / Fallback */}
      <Modal
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        title="Seite teilen"
      >
        <p>Nutzen Sie diesen Link, um die Seite zu teilen:</p>
        <Input
          value={currentUrl}
          readOnly
          style={{ marginBottom: 8 }}
          onFocus={(e) => e.target.select()}
        />
        <Button
          block
          style={{ marginBottom: 8 }}
          onClick={async () => {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(currentUrl);
                message.success("Link in die Zwischenablage kopiert.");
              } else {
                message.info("Bitte den Link manuell kopieren.");
              }
            } catch {
              message.info("Bitte den Link manuell kopieren.");
            }
          }}
        >
          Link kopieren
        </Button>

        <Button
          block
          type="default"
          onClick={() => {
            const subject = encodeURIComponent(
              "Empfehlung: Digital Lotse Wasser"
            );
            const body = encodeURIComponent(
              `Schauen Sie sich diese Seite an:\n\n${currentUrl}`
            );
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
          }}
        >
          Per E-Mail teilen
        </Button>
      </Modal>
    </>
  );
};

export default ContactFloatingButton;
