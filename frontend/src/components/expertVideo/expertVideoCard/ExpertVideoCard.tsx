import React from "react";
import { Typography } from "antd";
import { Link } from "react-router-dom";
import { ExpertVideoDto } from "../../../types/dtos/ExpertVideoDto";
import "./ExpertVideoCard.less";

const { Title } = Typography;

const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

let FILE_BASE_URL = "";
if (RAW_BACKEND_URL) {
  try {
    const u = new URL(RAW_BACKEND_URL, window.location.origin);
    const basePath = u.pathname.replace(/\/api\/?$/, "");
    FILE_BASE_URL = u.origin + basePath;
  } catch (e) {
    FILE_BASE_URL = RAW_BACKEND_URL.replace(/\/api\/?$/, "");
  }
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
  const cardUrl = `/expert-videos?focusId=${video.id}`;

  return (
    <Link to={cardUrl} style={{ textDecoration: "none" }}>
      <div
        className="expert-video-card"
        role="button"
        tabIndex={0}
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
    </Link>
  );
};

export default ExpertVideoCard;
