import React from "react";
import { Typography } from "antd";
import { ExpertVideoDto } from "../../../types/dtos/ExpertVideoDto";
import "./ExpertVideoDetailCard.less"; 
import ExternalLink from "../../externalLink/ExternalLink.tsx";

const { Title, Paragraph, Text, Link } = Typography;

const formatDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("de-DE").format(new Date(iso)) : "";

// Берём VITE_BACKEND_URL, например:
// - dev:  http://localhost:3001/api
// - prod: http://192.168.84.86/dilowa/api
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

let FILE_BASE_URL = "";
if (RAW_BACKEND_URL) {
  const u = new URL(RAW_BACKEND_URL);
  // убираем только хвост `/api` или `/api/`
  const basePath = u.pathname.replace(/\/api\/?$/, ""); // "" или "/dilowa"
  FILE_BASE_URL = u.origin + basePath;                  // "http://localhost:3001" или "http://192.168.../dilowa"
}

// helper для корректного src
const buildThumbnailSrc = (path?: string) => {
  if (!path) return "";
  // если уже полный URL или data-uri — не трогаем
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  // относительный путь из backend ("/uploads/...") → приклеиваем FILE_BASE_URL
  return `${FILE_BASE_URL}${path}`;
};

interface Props {
  video: ExpertVideoDto;
}

/**
 * Детальная карточка Expert Video для страницы /expert-videos
 * Показывает:
 * - заголовок
 * - дату
 * - автора (с кликабельной ссылкой, если есть authorUrl)
 * - описание
 * - картинку
 * - текст про внешнюю ссылку на YouTube
 */
const ExpertVideoDetailCard: React.FC<Props> = ({ video }) => {
  return (
    <div className="expert-video-detail">
      <div className="expert-video-text">
        <Title level={2}>{video.title}</Title>

        {(video.publishedAt || video.authorName) && (
          <Paragraph>
            {video.publishedAt && (
              <Text italic strong>
                {formatDate(video.publishedAt)}
              </Text>
            )}
            {video.publishedAt && video.authorName && " – "}
            {video.authorName && video.authorUrl ? (
              <Link href={video.authorUrl} target="_blank" rel="noreferrer">
                {video.authorName}
              </Link>
            ) : (
              video.authorName
            )}
          </Paragraph>
        )}

        {video.description && <Paragraph>{video.description}</Paragraph>}
      </div>

      <div className="expert-video-media">
        {video.thumbnailUrl && (
          <img
            src={buildThumbnailSrc(video.thumbnailUrl)}
            alt={video.title}
            className="expert-video-image"
          />
        )}

        <Paragraph className="expert-video-external-note">
  <ExternalLink href={video.videoUrl}>
    Links zum Video öffnen
  </ExternalLink>
</Paragraph>

      </div>
    </div>
  );
};

export default ExpertVideoDetailCard;
