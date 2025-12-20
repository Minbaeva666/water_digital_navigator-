// src/components/ContactFloatingButton/ContactFloatingButton.tsx

import React, { useState } from "react";
import { Button, message, Tooltip } from "antd";
import { LinkOutlined, DoubleLeftOutlined, DoubleRightOutlined, ContactsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ContactFloatingButton.less";

const ContactFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleOpenContact = () => {
    navigate("/kontakt");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title || "Digital Lotse Wasser";
    const text = "Schauen Sie sich diese Website an:";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        message.success("Link in die Zwischenablage kopiert.");
      } else {
        message.info(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <div className={`fab-wrapper ${collapsed ? "fab-wrapper-collapsed" : ""}`}>
      {/* Кнопка-свёртка/развёртка панели */}
      <Tooltip
        title={collapsed ? "Leiste öffnen" : "Leiste einklappen"}
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

      {/* Остальные кнопки показываем только если панель развернута */}
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
  );
};

export default ContactFloatingButton;
