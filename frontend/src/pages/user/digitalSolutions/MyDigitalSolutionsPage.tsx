import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useLocation, useNavigate } from "react-router-dom";
import { digitalSolutionService } from "../../../services/digitalSolutionService/digitalSolutionService";
import { DigitalSolutionWithRelationsDto } from "../../../types/dtos/DigitalSolutionDto";
import { DigitalSolutionState } from "../../../types/constants/enums";
import TableView from "../../../components/TableView/TableView";

const TAB_KEYS = {
  REQUESTED: "REQUESTED",
  ACTIVATED: "ACTIVATED",
  DEACTIVATED: "DEACTIVATED",
  DRAFTS: "DRAFTS",
} as const;

const TABS = [
  { key: TAB_KEYS.REQUESTED, label: "Eingereicht" },
  { key: TAB_KEYS.ACTIVATED, label: "Veröffentlicht" },
  { key: TAB_KEYS.DEACTIVATED, label: "Deaktiviert" },
  { key: TAB_KEYS.DRAFTS, label: "Entwürfe" },
];

const columns: ColumnsType<DigitalSolutionWithRelationsDto> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 260,
    ellipsis: true,
  },
  {
    title: "Organisation",
    dataIndex: ["organization", "name"],
    key: "orgName",
    render: (orgName: string) => orgName ?? "-",
    width: 220,
    ellipsis: true,
  },
  {
    title: "Eingereicht am",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (isoString: string) =>
      isoString
        ? new Date(isoString).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-",
    width: 150,
    ellipsis: true,
  },
  {
    title: "Status",
    dataIndex: "state",
    key: "status",
    render: (state: string) => state ?? "-",
    width: 150,
    ellipsis: true,
  },
];

const MyDigitalSolutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab =
    (location.state as { tab?: keyof typeof TAB_KEYS } | undefined)?.tab ??
    TAB_KEYS.REQUESTED;

  const [activeTab, setActiveTab] =
    useState<keyof typeof TAB_KEYS>(initialTab);
  const [digitalSolutions, setDigitalSolutions] = useState<
    DigitalSolutionWithRelationsDto[]
  >([]);
  const [loading, setLoading] = useState(false);

  const loadDigitalSolutions = useCallback(
    async (type: keyof typeof TAB_KEYS) => {
      setLoading(true);
      try {
        let data: DigitalSolutionWithRelationsDto[] | null = [];
        switch (type) {
          case TAB_KEYS.REQUESTED:
            data =
              await digitalSolutionService.fetchMyDigitalSolutionsWithState(
                DigitalSolutionState.REQUESTED
              );
            break;
          case TAB_KEYS.ACTIVATED:
            data =
              await digitalSolutionService.fetchMyDigitalSolutionsWithState(
                DigitalSolutionState.ACTIVATED
              );
            break;
          case TAB_KEYS.DEACTIVATED:
            data =
              await digitalSolutionService.fetchMyDigitalSolutionsWithState(
                DigitalSolutionState.DEACTIVATED
              );
            break;
          case TAB_KEYS.DRAFTS:
            data =
              await digitalSolutionService.fetchMyDigitalSolutionsWithState(
                DigitalSolutionState.DRAFT
              );
            break;
        }

        if (data) setDigitalSolutions(data);
      } catch (e) {
        console.error(e);
        message.error(
          "Ihre digitalen Lösungen konnten nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDigitalSolutions(activeTab);
  }, [activeTab, loadDigitalSolutions]);

  const handleTabChange = (key: string) => {
    const tabKey = key as keyof typeof TAB_KEYS;
    setActiveTab(tabKey);
  };

  const handleRowClick = (row: DigitalSolutionWithRelationsDto) => {
    navigate(`/my-digital-solutions/${row.id}/edit`, {
      state: { tab: activeTab },
    });
  };

  const handleNew = () => {
    navigate(`/my-digital-solutions/new`, { state: { tab: activeTab } });
  };

  return (
    <TableView<DigitalSolutionWithRelationsDto>
      title="Meine digitalen Lösungen"
      buttonLabel="Neue digitale Lösung anlegen"
      onButtonClick={handleNew}
      tabs={TABS}
      activeTabKey={activeTab}
      onTabChange={handleTabChange}
      data={digitalSolutions}
      columns={columns}
      rowKey="id"
      loading={loading}
      onRowClick={handleRowClick}
    />
  );
};

export default MyDigitalSolutionsPage;
