import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Spin } from "antd";
import heroImage from "../../assets/wasserwirtschaft.png";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import DigitalSolutionCard from "../../components/digitalAtlas/digitalSolutionCard/DigitalSolutionCard.tsx";
import { taxonomyNodeService } from "../../services/taxonomyNodeService/taxonomyNodeService.ts";
import { digitalSolutionService } from "../../services/digitalSolutionService/digitalSolutionService.ts";
import { TaxonomyIndexRecord } from "../../types/UiTreeNode.ts";
import { DigitalSolutionDto } from "../../types/dtos/DigitalSolutionDto.ts";
import { RightOutlined } from "@ant-design/icons";

// --- EXPERT VIDEOS ---
import { ExpertVideoDto } from "../../types/dtos/ExpertVideoDto.ts";
import { expertVideoService } from "../../services/expertVideoService/expertVideoService.ts";
import ExpertVideoCard from "../../components/expertVideo/expertVideoCard/ExpertVideoCard.tsx";

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // --- NEU: State für Vorschau ---
  const [preview, setPreview] = useState<DigitalSolutionDto[]>([]);
  const [taxonomyIndex, setTaxonomyIndex] = useState<Record<
    string,
    TaxonomyIndexRecord
  > | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);

  // --- EXPERT VIDEOS: State ---
  const [videos, setVideos] = useState<ExpertVideoDto[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [solutions, structure, latestVideos] = await Promise.all([
          digitalSolutionService.fetchActiveDigitalSolutionsWithTitleImage(
            1, // page
            4, // pageSize: genau 4 Karten
            undefined, // taxonomyNodeId
            undefined, // q
            "newest", // sort
            undefined, // taxonomyPath
            undefined, // dateFrom
            undefined, // dateTo
          ),
          taxonomyNodeService.fetchTaxonomyStructure(),
          // --- EXPERT VIDEOS ---
          expertVideoService.fetchLatest(4),
        ]);

        if (cancelled) return;

        setPreview(solutions?.items ?? []);
        setTaxonomyIndex(structure?.index ?? null);
        setVideos(latestVideos ?? []);
      } catch (e) {
        // bewusst kein message.warning hier auf der Startseite, um die Hero-Experience nicht zu stören
        console.error(e);
      } finally {
        if (!cancelled) {
          setLoadingPreview(false);
          setLoadingVideos(false); // --- EXPERT VIDEOS ---
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Oberer Bereich im einheitlichen Container */}
      <div className="page-container">
        <Row justify="start" align="middle">
          {/* Bild soll auf Mobile ganz oben */}
          <Col
            xs={{ span: 24, order: 1 }}
            md={{ span: 12, order: 2 }}
            className="hero-image-col"
          >
            <img
              loading="lazy"
              src={heroImage}
              alt="Wasserwirtschaft"
              className="hero-image"
            />
          </Col>

          {/* Text soll auf Mobile unter dem Bild */}
          <Col
            xs={{ span: 24, order: 2 }}
            md={{ span: 12, order: 1 }}
            className="hero-text-col"
          >
            <div>
              <Title level={1}>
                Das Webportal für digitale Lösungen in der Wasserwirtschaft
              </Title>
              <Paragraph>
                Dieses Portal bietet eine Vielzahl von Schnittstellen zur
                Digitalisierung der Wasserwirtschaft. Entdecke den Digital
                Atlas, reiche eigene Lösungen ein und mehr.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<RightOutlined style={{ color: "#fff" }} />}
                iconPosition="end"
                onClick={() => navigate("/digital-atlas")}
              >
                Digital Atlas aufrufen
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Vorschau-Band über volle Breite, Inhalt wieder im Container */}
      <section className="band">
        <div className="page-container">
          <Row justify="space-between" className="atlas-title" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                Aus dem Digital Atlas
              </Title>
            </Col>
          </Row>
          {loadingPreview ? (
            <div
              style={{
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin tip="Lade Digitale Lösungen…" fullscreen={false} />
            </div>
          ) : preview.length === 0 ? (
            <Paragraph type="secondary">
              Aktuell sind noch keine Lösungen verfügbar.
            </Paragraph>
          ) : (
            <div className="cards-grid-home">
              {preview.map((sol) => (
                <div key={sol.id} style={{ width: 300 }}>
                  <DigitalSolutionCard
                    digitalSolution={sol}
                    taxonomyIndex={taxonomyIndex}
                    setQuery={() => navigate("/digital-atlas")}
                  />
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "start",
              gap: 16,
              marginTop: 32,
              marginBottom: 32,
              flexWrap: "wrap",
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<RightOutlined style={{ color: "#fff" }} />}
              iconPosition="end"
              onClick={() => navigate("/digital-atlas")}
            >
              Alle Digitale Lösungen ansehen
            </Button>

            <Button
              size="large"
              type="primary"
              icon={<RightOutlined style={{ color: "#fff" }} />}
              iconPosition="end"
              onClick={() => navigate("/create-digital-solution")}
            >
              Ihr digitales Projekt fehlt?
            </Button>
          </div>
        </div>
      </section>

      {/* --- EXPERT VIDEOS: Sektion unterhalb der Atlas-Karten --- */}
      <section className="band">
        <div className="page-container">
          <Row justify="space-between" align="middle" className="atlas-title">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                Experten Interviews/Videos
              </Title>
            </Col>
          </Row>

          {loadingVideos ? (
            <div
              style={{
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin tip="Lade Interviews/Videos…" fullscreen={false} />
            </div>
          ) : videos.length === 0 ? (
            <Paragraph type="secondary">
              Aktuell sind noch keine Interviews/Videos verfügbar.
            </Paragraph>
          ) : (
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              {videos.map((video) => (
                <Col key={video.id} xs={24} md={12} lg={8} xl={6}>
                  <ExpertVideoCard video={video} />
                </Col>
              ))}
            </Row>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 32,
              marginBottom: 32,
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<RightOutlined style={{ color: "#fff" }} />}
              iconPosition="end"
              onClick={() => navigate("/expert-videos")}
            >
              Alle Interviews/Videos
            </Button>
          </div>
        </div>
      </section>
      <section className="band">...</section>
    </>
  );
};

export default HomePage;
