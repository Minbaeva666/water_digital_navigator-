import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Row, Col, Pagination, Spin, Empty, Typography } from "antd";

import { digitalSolutionService } from "../../services/digitalSolutionService/digitalSolutionService";
import type { DigitalSolutionDto } from "../../types/dtos/DigitalSolutionDto";

import DigitalSolutionCard from "../../components/digitalAtlas/digitalSolutionCard/DigitalSolutionCard";
import { TaxonomyIndexRecord } from "../../types/UiTreeNode";
import { PickedNode } from "../../components/taxonomyFilterNav/TaxonomyFilterNav";

const { Title, Text } = Typography;

const PAGE_SIZE_DEFAULT = 12;

const DigitalSolutionsOverviewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<DigitalSolutionDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [taxonomyIndex] =
    useState<Record<string, TaxonomyIndexRecord> | null>(null);

  // Клик по категории / taxonomy-node из карточки
  const handlePickedNodeClick = useCallback(
    (node: PickedNode) => {
      // здесь ничего не знаем о структуре PickedNode, поэтому используем "any"
      const n: any = node;
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);

        // если хотим сбросить фильтр – можно проверять какое-то условие
        if (!n) {
          p.delete("taxonomyNodeId");
          p.delete("taxonomyPath");
          p.set("page", "1");
          return p;
        }

        // если у узла есть path – фильтруем по path
        if (n.path) {
          p.set("taxonomyPath", String(n.path));
          p.delete("taxonomyNodeId");
        } else if (n.id) {
          // fallback: фильтруем по id узла
          p.set("taxonomyNodeId", String(n.id));
          p.delete("taxonomyPath");
        }

        // при смене фильтра всегда на первую страницу
        p.set("page", "1");

        return p;
      });
    },
    [setSearchParams]
  );

  const page = useMemo(() => {
    const raw = searchParams.get("page");
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isNaN(n) || n < 1 ? 1 : n;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const raw = searchParams.get("pageSize");
    const n = raw ? parseInt(raw, 10) : PAGE_SIZE_DEFAULT;
    return Number.isNaN(n) || n < 1 ? PAGE_SIZE_DEFAULT : n;
  }, [searchParams]);

  const q = searchParams.get("q") || undefined;
  const taxonomyNodeId = searchParams.get("taxonomyNodeId") || undefined;
  const taxonomyPath = searchParams.get("taxonomyPath") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const organizationId = searchParams.get("organizationId") || undefined;

  const sort =
    (searchParams.get("sort") as "newest" | "oldest" | "az" | "za" | null) ||
    "newest";

  // --- загрузка данных ---
  const loadSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await digitalSolutionService.fetchActiveDigitalSolutionsWithTitleImage(
          page,
          pageSize,
          taxonomyNodeId,
          q,
          sort,
          taxonomyPath,
          dateFrom,
          dateTo,
          organizationId
        );

      setItems(result.items);
      setTotal(result.total);

      // если хочешь индекс таксономии – можно положить сюда result.taxonomyIndex, если бэк его отдаёт
      // setTaxonomyIndex(result.taxonomyIndex ?? null);
    } catch (e) {
      console.error("Fehler beim Laden der Digitalen Lösungen:", e);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    taxonomyNodeId,
    q,
    sort,
    taxonomyPath,
    dateFrom,
    dateTo,
    organizationId,
  ]);

  useEffect(() => {
    loadSolutions();
  }, [loadSolutions]);

  const handlePageChange = (nextPage: number, nextPageSize?: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);

      p.set("page", String(nextPage));
      if (nextPageSize) {
        p.set("pageSize", String(nextPageSize));
      }

      return p;
    });
  };

  const organizationContextTitle = useMemo(() => {
    if (!organizationId) return null;

    const orgName = items[0]?.organization?.name;
    if (!orgName) return null;

    return (
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Es werden nur digitale Lösungen der Organisation{" "}
        <strong>{orgName}</strong> angezeigt.
      </Text>
    );
  }, [organizationId, items]);

  return (
    <div style={{ padding: "24px 24px 48px" }}>
      <Title level={2} style={{ marginBottom: 8 }}>
        Digitale Lösungen
      </Title>

      {organizationContextTitle}

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: 48 }}>
          <Empty description="Keine digitalen Lösungen gefunden." />
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {items.map((solution) => (
              <Col key={solution.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <DigitalSolutionCard
                  digitalSolution={solution}
                  taxonomyIndex={taxonomyIndex}
                  setQuery={handlePickedNodeClick}
                />
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DigitalSolutionsOverviewPage;
