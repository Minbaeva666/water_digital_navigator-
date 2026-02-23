import {
  message,
  Pagination,
  Typography,
  Row,
  Col,
  Empty,
  Divider,
  Button,
  Drawer,
  Grid,
  Input,
  Space,
  Select,
  Spin,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DatePicker } from "antd";
import { DigitalSolutionDto } from "../../types/dtos/DigitalSolutionDto.ts";
import { digitalSolutionService } from "../../services/digitalSolutionService/digitalSolutionService.ts";
import { DigitalSolutionCard } from "../../components/digitalAtlas/digitalSolutionCard/DigitalSolutionCard.tsx";
import { TaxonomyIndexRecord } from "../../types/UiTreeNode.ts";
import { taxonomyNodeService } from "../../services/taxonomyNodeService/taxonomyNodeService.ts";
import TaxonomyFilterNav, {
  PickedNode,
} from "../../components/taxonomyFilterNav/TaxonomyFilterNav.tsx";
import "./DigitalAtlasPage.less";
import {
  mapBackendToSolutionsWithCoords,
  SolutionWithCoords,
} from "../../utils/map.helper.tsx";
import DigitalSolutionsMap from "../../components/digitalSolutionMap/DigitalSolutionsMap.tsx";
import { Dayjs } from "dayjs";
import { toApiDate } from "../../utils/apiHelpers.ts";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;
const KI_TAXONOMY_PATH = "/digitalisierungsthemen/kuenstliche-intelligenz";

type SortKey = "newest" | "oldest" | "az" | "za";

const DigitalAtlasPage = () => {
  const location = useLocation();
  const [digitalSolutions, setDigitalSolutions] = useState<
    DigitalSolutionDto[]
  >([]);
  const [coordinates, setCoordinates] = useState<SolutionWithCoords[]>([]);

  const [initializing, setInitializing] = useState(true);
  const firstLoadRef = useRef(true);

  const [taxonomyIndex, setTaxonomyIndex] = useState<Record<
    string,
    TaxonomyIndexRecord
  > | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(3);
  const [picked, setPicked] = useState<PickedNode | null>(null);

  // Toolbar-States
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  // Responsive: Drawer für schmale Screens
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < md => Drawer
  const [filterOpen, setFilterOpen] = useState(false);
  const isKiAtlasRoute = location.pathname.startsWith("/ki-atlas");
  const forcedTaxonomyPath = isKiAtlasRoute ? KI_TAXONOMY_PATH : undefined;

  const loadParams = useMemo(
    () => ({
      page: current,
      pageSize,
      taxonomyNodeId: picked?.id,
      taxonomyPath: picked?.path ?? forcedTaxonomyPath,
      q: query || undefined,
      sort: sortBy,
      dateFrom: toApiDate(dateFrom),
      dateTo: toApiDate(dateTo),
    }),
    [
      current,
      pageSize,
      picked?.id,
      picked?.path,
      forcedTaxonomyPath,
      query,
      sortBy,
      dateFrom,
      dateTo,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const isFirst = firstLoadRef.current;
      if (isFirst) setInitializing(true);

      try {
        const [solutions, structure, backendCoords] = await Promise.all([
          digitalSolutionService.fetchActiveDigitalSolutionsWithTitleImage(
            loadParams.page,
            loadParams.pageSize,
            loadParams.taxonomyNodeId,
            loadParams.q,
            loadParams.sort,
            loadParams.taxonomyPath,
            loadParams.dateFrom,
            loadParams.dateTo,
          ),
          taxonomyNodeService.fetchTaxonomyStructure(),
          digitalSolutionService.fetchAllCoordinates(),
        ]);

        if (cancelled) return;

        if (solutions) {
          setDigitalSolutions(solutions.items);
          setTotal(solutions.total);
        } else {
          message.warning("Keine digitalen Lösungen gefunden.");
        }

        if (Array.isArray(backendCoords)) {
          const mapped = mapBackendToSolutionsWithCoords(backendCoords).filter(
            (x) => typeof x.lat === "number" && typeof x.lon === "number",
          );
          setCoordinates(mapped);
        } else {
          setCoordinates([]);
        }

        setTaxonomyIndex(structure?.index ?? null);
      } catch (err) {
        if (!cancelled) {
          message.error("Inhalte konnten nicht geladen werden.");
          console.error(err);
        }
      } finally {
        if (isFirst) {
          firstLoadRef.current = false;
          setInitializing(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loadParams]);

  const onPageChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPageSizeChange = (_page: number, size: number) => {
    setPageSize(size);
    setCurrent(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPick = (node: PickedNode | null) => {
    setPicked(node);
    setCurrent(1);
    if (isMobile) setFilterOpen(false); // nach Auswahl auf Mobile schließen
  };

  const resetFilters = () => {
    setPicked(null);
    setQuery("");
    setSortBy("newest");
    setCurrent(1);
    setDateFrom(null);
    setDateTo(null);
  };

  const handleCardNodeClick = (node: PickedNode) => {
    console.log("node", node);
    setPicked(node);
  };

  const SortSelect = (
    <Select
      aria-label="Sortieren"
      value={sortBy}
      onChange={(v: SortKey) => {
        setSortBy(v);
        setCurrent(1);
      }}
      options={[
        { label: "Neueste zuerst", value: "newest" },
        { label: "Älteste zuerst", value: "oldest" },
        { label: "A–Z", value: "az" },
        { label: "Z–A", value: "za" },
      ]}
      suffixIcon={<SortAscendingOutlined />}
      style={{ minWidth: 160 }}
    />
  );

  if (initializing) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Spin size="large" tip="Lade Digitale Lösungen…" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Kopfbereich */}
      <div
        style={{
          paddingBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Title level={3} style={{ marginBottom: 0, flex: 1 }}>
          Digitale Atlas - Projektübersicht
        </Title>
        {isMobile && (
          <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
            Filter
          </Button>
        )}
      </div>

      <div style={{ marginTop: -8, marginBottom: 16 }}>
        <Text>
          Entdecken Sie reale Anwendungsbeispiele aus verschiedenen
          Digital-Wasser-Kategorien. Erhalten Sie praxisnahe Einblicke und
          lokale Ansprechpartner für die erfolgreiche Umsetzung Ihrer
          Digitalisierungsprojekte.
        </Text>
      </div>

      {/* Toolbar: Suche, Sortierung, Reset */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap size={[8, 8]}>
          <Search
            allowClear
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrent(1);
            }}
            onSearch={(v) => {
              setQuery(v);
              setCurrent(1);
            }}
            placeholder="Suchen (Titel, Beschreibung, …)"
            enterButton={<SearchOutlined />}
            style={{ width: 320, maxWidth: "100%" }}
          />

          {/* DATUM: Von/Bis */}
          <DatePicker
            allowClear
            value={dateFrom}
            onChange={(d) => {
              setDateFrom(d);
              setCurrent(1);
            }}
            format="DD.MM.YYYY"
            placeholder="Von"
            disabledDate={(d) => !!dateTo && d.isAfter(dateTo, "day")}
          />
          <DatePicker
            allowClear
            value={dateTo}
            onChange={(d) => {
              setDateTo(d);
              setCurrent(1);
            }}
            format="DD.MM.YYYY"
            placeholder="Bis"
            disabledDate={(d) => !!dateFrom && d.isBefore(dateFrom, "day")}
          />

          {SortSelect}

          <Button
            icon={<ReloadOutlined />}
            onClick={resetFilters}
            disabled={
              !picked && !query && sortBy === "newest" && !dateFrom && !dateTo
            }
          >
            Zurücksetzen
          </Button>
        </Space>
      </div>

      {/* Layout: Sidebar (Desktop) + Cards */}
      <Row gutter={16} align="top">
        {/* Desktop/Tablet (≥ md): feste Sidebar */}
        {!isMobile && (
          <Col xs={24} md={7} lg={6} xl={6} xxl={5}>
            <TaxonomyFilterNav onPick={onPick} pickLeavesOnly={false} />
          </Col>
        )}

        <Col xs={24} md={17} lg={18} xl={18} xxl={19}>
          <div className="solutions-area">
            {digitalSolutions.length === 0 ? (
              <Empty
                description={
                  picked
                    ? "Keine Treffer für diesen Filter"
                    : "Keine digitalen Lösungen gefunden"
                }
              />
            ) : (
              <div className="cards-grid">
                {digitalSolutions.map((sol) => (
                  <div key={sol.id} className="card-cell">
                    <DigitalSolutionCard
                      digitalSolution={sol}
                      taxonomyIndex={taxonomyIndex}
                      setQuery={handleCardNodeClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Divider />
          <div style={{ width: "100%", display: "flex", marginTop: 8 }}>
            <Pagination
              className="pagination-sticky"
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={onPageChange}
              showTotal={(tot, range) =>
                `Digitale Lösung ${range[0]}–${range[1]} von ${tot}`
              }
              pageSizeOptions={["3", "6", "9"]}
              onShowSizeChange={onPageSizeChange}
              showSizeChanger={{
                getPopupContainer: () => document.body,
                popupMatchSelectWidth: false,
              }}
            />
          </div>
        </Col>
      </Row>
      <Row style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <DigitalSolutionsMap solutions={coordinates} height={500} />
      </Row>

      {/* Mobile: Drawer mit Navigation */}
      <Drawer
        title="Filter"
        placement="left"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        width={Math.min(window.innerWidth * 0.9, 360)}
        bodyStyle={{ padding: 8 }}
      >
        <TaxonomyFilterNav onPick={onPick} pickLeavesOnly={false} />
      </Drawer>
    </div>
  );
};

export default DigitalAtlasPage;
