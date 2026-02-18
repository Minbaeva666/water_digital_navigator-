import React from "react";
import { Typography } from "antd";
import { ExpertVideoDto } from "../../../types/dtos/ExpertVideoDto";
import "./ExpertVideoDetailCard.less";
import ExternalLink from "../../externalLink/ExternalLink.tsx";

const { Title, Paragraph, Text, Link } = Typography;

const formatDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("de-DE").format(new Date(iso)) : "";

const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

let FILE_BASE_URL = "";
if (RAW_BACKEND_URL) {
  try {
    const u = new URL(RAW_BACKEND_URL, window.location.origin);
    const basePath = u.pathname.replace(/\/api\/?$/, "");
    FILE_BASE_URL = u.origin + basePath;
  } catch (e) {
    // fallback: treat as path prefix
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

const renderAuthors = (video: ExpertVideoDto) => {
  if (video.authors && video.authors.length > 0) {
    return (
      <>
        {video.authors.map((author, index) => {
          const content = author.url ? (
            <Link
              key={author.name + author.url}
              href={author.url}
              target="_blank"
              rel="noreferrer"
            >
              {author.name}
            </Link>
          ) : (
            <Text key={author.name}>{author.name}</Text>
          );

          const separator =
            index < video.authors!.length - 1 ? <Text> · </Text> : null;

          return (
            <React.Fragment key={author.name + index}>
              {content}
              {separator}
            </React.Fragment>
          );
        })}
      </>
    );
  }

  if (video.authorName && video.authorUrl) {
    return (
      <Link href={video.authorUrl} target="_blank" rel="noreferrer">
        {video.authorName}
      </Link>
    );
  }

  if (video.authorName) {
    return <>{video.authorName}</>;
  }

  return null;
};

interface Props {
  video: ExpertVideoDto;
}

const ExpertVideoDetailCard: React.FC<Props> = ({ video }) => {
  return (
    <div className="expert-video-detail">
      <div className="expert-video-text">
        <Title level={2}>{video.title}</Title>

        {(video.publishedAt || video.authors?.length || video.authorName) && (
          <Paragraph>
            {video.publishedAt && (
              <Text italic strong>
                {formatDate(video.publishedAt)}
              </Text>
            )}
            {video.publishedAt &&
              (video.authors?.length || video.authorName) &&
              " – "}
            {renderAuthors(video)}
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
            Zum Video / weiteren Infos
          </ExternalLink>
        </Paragraph>
      </div>
    </div>
  );
};

export default ExpertVideoDetailCard;
