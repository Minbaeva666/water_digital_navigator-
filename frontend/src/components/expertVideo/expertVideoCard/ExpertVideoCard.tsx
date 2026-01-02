import React from "react";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { ExpertVideoDto } from "../../../types/dtos/ExpertVideoDto";
import "./ExpertVideoCard.less";

const { Title } = Typography;

const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

let FILE_BASE_URL = "";
if (RAW_BACKEND_URL) {
  const u = new URL(RAW_BACKEND_URL);
  const basePath = u.pathname.replace(/\/api\/?$/, ""); 
  FILE_BASE_URL = u.origin + basePath;
}

const buildThumbnailSrc = (path?: string) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  return `${FILE_BASE_URL}${path}`;
};

interface Props {
  video: ExpertVideoDto;
}

const ExpertVideoCard: React.FC<Props> = ({ video }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/expert-videos?focusId=${video.id}`);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="expert-video-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {video.thumbnailUrl && (
        <div className="expert-video-card-image-wrapper">
          <img
            src={buildThumbnailSrc(video.thumbnailUrl)}
            alt={video.title}
            className="expert-video-card-image"
          />
        </div>
      )}

      <div className="expert-video-card-title">
        <Title level={4} className="expert-video-card-title-text">
          {video.title}
        </Title>
      </div>
    </div>
  );
};

export default ExpertVideoCard;
