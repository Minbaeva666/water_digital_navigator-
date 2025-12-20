import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useLocation } from "react-router-dom";
import { ExpertVideoDto } from "../../types/dtos/ExpertVideoDto";
import { expertVideoService } from "../../services/expertVideoService/expertVideoService";
import ExpertVideoDetail from "../../components/expertVideo/expertVideoDetailCard/ExpertVideoDetailCard";

const ExpertVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<ExpertVideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await expertVideoService.fetchPage(1, 100);
        setVideos(res.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(location.search);
    const focusId = params.get("focusId");
    if (!focusId) return;

    const el = document.getElementById(`expert-video-${focusId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, location.search, videos]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div className="page-container">
      {videos.map((v) => (
        <div
          key={v.id}
          id={`expert-video-${v.id}`}
          style={{ marginBottom: 48 }}
        >
          <ExpertVideoDetail video={v} />
        </div>
      ))}
    </div>
  );
};

export default ExpertVideosPage;
