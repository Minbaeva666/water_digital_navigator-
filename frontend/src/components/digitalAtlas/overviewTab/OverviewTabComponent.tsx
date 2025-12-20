import { Avatar, Col, Row, Space, Typography } from "antd";
import dayjs from "dayjs";
import { DigitalSolutionFormValues } from "../../../forms/digital-solution/DigitalSolutionFormValues.ts";
import { useTranslation } from "react-i18next";
import {
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { buildOrgLogoSrc } from "../../../utils/logoHelper.ts";
import { TaxonomyIndexRecord } from "../../../types/UiTreeNode.ts";
import "./OverviewTabComponent.less";
import ExternalLink from "../../externalLink/ExternalLink.tsx";
import { SalutationType } from "../../../types/constants/enums.ts";
import {
  getSourceCountryName,
  getSourceRegionName,
} from "../../../utils/formDataHelper.ts";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export interface DigitalSolutionCardProps {
  digitalSolution: DigitalSolutionFormValues;
  salutationsMap: Record<string, string>;
  taxonomyIndex: Record<string, TaxonomyIndexRecord> | null;
}

type Group = {
  rootId: string;
  rootName: string;
  rootColor?: string;
  items: any[];
};

export function OverviewTabComponent({
  digitalSolution,
  salutationsMap,
  taxonomyIndex,
}: DigitalSolutionCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const countryName = getSourceCountryName(digitalSolution);
  const regionName = getSourceRegionName(digitalSolution);
  const partners: any[] = (digitalSolution as any).projectPartners ?? [];

  const ensureHttp = (url?: string | null) =>
    !url ? "" : /^https?:\/\//i.test(url) ? url : `https://${url}`;

  const getPhone = (u: any) =>
    u?.phonenumber ??
    u?.phone ??
    u?.phoneNumber ??
    u?.mobile ??
    u?.tel ??
    null;

  const u = digitalSolution.presentedByUser;
  const salutationType = u?.salutationType;
  const salutationLabel =
    salutationType === SalutationType.MR ||
    salutationType === SalutationType.MS
      ? salutationsMap[salutationType]
      : undefined;
  const fullName = [salutationLabel, u?.firstName, u?.lastName]
    .filter(Boolean)
    .join(" ");

  const org =
    u?.organization ?? (digitalSolution as any).organization ?? null;
  const orgUrl = ensureHttp(org?.website || org?.link || org?.url);
  const orgLogoSrc = buildOrgLogoSrc(org);

  const getOrgAddressOneLine = (o?: any | null) => {
    if (!o) return "";
    const streetWithNo = [
      o.street ?? o.addressStreet ?? o.streetName,
      o.houseNumber ?? o.streetNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const zip = o.zip ?? o.postalCode ?? o.zipCode ?? o.plz;
    const city = o.city ?? o.town ?? o.locality;

    const rawCountry = o.country ?? o.countryCode ?? o.countryName;
    const countryLabel = rawCountry?.nameDe ?? rawCountry ?? "";

    const parts = [streetWithNo || o.street, zip, city, countryLabel].filter(
      Boolean
    );
    return parts.join(", ");
  };

  const getPublishedByLabel = (value?: string) =>
    value ? t(`publishedByTypes.${value}`, value) : "";
  const pb = (digitalSolution.publishedBy ?? "").toUpperCase();
  const showSource = pb === "WEB" || pb === "PUBLICATION";

  const orgAddressOneLine = getOrgAddressOneLine(org);

  const getMaturityLabel = (value?: string) =>
    value ? t(`maturityDegrees.${value}`, value) : "";
  const getOfferingCategoryLabel = (value?: string) =>
    value ? t(`offeringCategoryTypes.${value}`, value) : "";
  const getReadyForOperationDate = (value?: string) => {
    if (!value) return "";
    const dDMY = dayjs(value, "DD.MM.YYYY", true);
    if (dDMY.isValid()) return dDMY.format("DD.MM.YYYY");
    const dISO = dayjs(value);
    return dISO.isValid() ? dISO.format("DD.MM.YYYY") : "";
  };

  function getPresenterName(values: DigitalSolutionFormValues): string {
    if (values?.solutionPresentedByUser) {
      const u = values.presentedByUser;
      if (u) {
        const salutationType = u.salutationType;

        const salutationLabel =
          salutationType === SalutationType.MR ||
          salutationType === SalutationType.MS
            ? salutationsMap[salutationType]
            : undefined;

        return [salutationLabel, u.firstName, u.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return "";
    }

    if (values?.organization) {
      return values.organization.name ?? "";
    }

    return "Keine Quelle vorhanden";
  }

  // ---- Навигация по клику на организацию ----
  const handleOrgClick = (orgId?: string) => {
    if (!orgId) return;
    // Переход на список цифровых решений с фильтром по организации
    navigate(`/digital-solutions?organizationId=${orgId}`);
  };

  // ---------- Taxonomie: Nodes auflösen, nach Root (Ebene 0) gruppieren ----------
  const isDe = i18n?.language?.startsWith("de");
  const getNodeName = (n: any) =>
    isDe
      ? n?.nameDe ?? n?.nameEn ?? n?.slug ?? ""
      : n?.nameEn ?? n?.nameDe ?? n?.slug ?? "";

  const getById = (id?: string | null) =>
    id && taxonomyIndex ? taxonomyIndex[id] : undefined;
  const getSelf = (rec: any) => rec?.self ?? rec?.node ?? rec;
  const getParent = (n: any) => {
    if (!taxonomyIndex) return n?.parent ?? null;
    const parentId = n?.parentId ?? n?.parent?.id ?? null;
    if (!parentId) return n?.parent ?? null;
    const prec = getById(parentId);
    if (prec) return getSelf(prec);
    return n?.parent ?? null;
  };
  const getRoot = (n: any) => {
    let cur = n;
    const seen = new Set<string>();
    while (cur?.id && !seen.has(cur.id)) {
      seen.add(cur.id);
      const p = getParent(cur);
      if (!p) break;
      cur = p;
    }
    return cur ?? n;
  };

  const nodeIds: string[] = digitalSolution.taxonomyNodeIds ?? [];
  const nodes: any[] = Array.from(
    new Map(
      nodeIds
        .map((id) => {
          const rec = taxonomyIndex ? taxonomyIndex[id] : undefined;
          return rec ? getSelf(rec) : undefined;
        })
        .filter(Boolean)
        .map((n: any) => [n.id, n])
    ).values()
  );

  const groupsMap: Record<string, Group> = nodes.reduce(
    (acc: Record<string, Group>, node: any) => {
      const root = getRoot(node);
      const rootId = root?.id ?? "__ohne_root__";
      const rootName = root
        ? getNodeName(root)
        : t("common.uncategorized", "Allgemein");
      const rootColor = root?.color ?? undefined;

      if (!acc[rootId])
        acc[rootId] = { rootId, rootName, rootColor, items: [] };
      acc[rootId].items.push(node);
      return acc;
    },
    {} as Record<string, Group>
  );

  const groupedAll = Object.values(groupsMap).sort((a, b) =>
    a.rootName.localeCompare(b.rootName, i18n?.language || "de")
  );

  const presenterName = (getPresenterName(digitalSolution) ?? "").trim();
  const hasPresenter = !!presenterName;

  const hasOrganization =
    !!org?.id ||
    !!digitalSolution?.organizationId ||
    !!digitalSolution?.organization;

  const showBlock = hasOrganization || hasPresenter;

  const showLogo = hasOrganization && org?.logoBase64;

  return (
    <div>
      <Row gutter={[55, 32]} style={{ paddingTop: 80 }}>
        {/* LINKE SPALTE */}
        <Col xs={24} md={12}>
          {showBlock && (
            <>
              {!!digitalSolution?.name?.trim() && (
                <Title level={4}>
                  {digitalSolution.name} wird präsentiert von
                </Title>
              )}
              <Space align="center" size={12}>
                {showLogo && (
                  <Avatar
                    shape="square"
                    size={72}
                    src={orgLogoSrc}
                    alt={org?.name || "Organisation"}
                    className="org-avatar"
                  />
                )}
                {/* здесь делаем организацию кликабельной */}
                <Text>
                  {hasPresenter ? (
                    presenterName
                  ) : org?.id ? (
                    <span
                      className="org-link"
                      onClick={() => handleOrgClick(org.id)}
                    >
                      {org.name ?? "Organisation"}
                    </span>
                  ) : (
                    org?.name ?? "Organisation"
                  )}
                </Text>
              </Space>
            </>
          )}

          {digitalSolution.publishedBy && (
            <>
              <Title level={4} style={{ marginTop: 24 }}>
                {t(
                  "solution.publishedBy.title",
                  "Digitale Lösung veröffentlicht durch"
                )}
              </Title>
              <Text>{getPublishedByLabel(digitalSolution.publishedBy)}</Text>

              {showSource &&
                (digitalSolution.publishedSource?.trim()?.length ?? 0) >
                  0 && (
                  <>
                    <br />
                    <Text type="secondary">
                      {t(
                        "solution.publishedBy.sourceLabel",
                        "Quelle"
                      )}
                      : {digitalSolution.publishedSource}
                    </Text>
                  </>
                )}
            </>
          )}

          <Title level={4}>Art der Digitalen Lösung</Title>
          <Text>
            {getOfferingCategoryLabel(digitalSolution.offeringCategory)}
          </Text>

          <Title level={4} style={{ marginTop: 24 }}>
            Reifegrad der Digitalen Lösung
          </Title>
          <Text>{getMaturityLabel(digitalSolution.maturityDegree)}</Text>

          {(() => {
            const ready = getReadyForOperationDate(
              digitalSolution.readyForOperation
            );
            return ready ? (
              <>
                <Title level={4} style={{ marginTop: 24 }}>
                  Betriebsbereit ab
                </Title>
                <Text>{ready}</Text>
              </>
            ) : null;
          })()}

          <Title level={4} style={{ marginTop: 24 }}>
            Land
          </Title>
          {countryName && <Text>{countryName}</Text>}

          {regionName && (
            <>
              <Title level={4} style={{ marginTop: 24 }}>
                Bundesland / Region
              </Title>
              <Text>{regionName}</Text>
            </>
          )}

          {u && (
            <>
              <Title level={4} style={{ marginTop: 24 }}>
                Ansprechpartner
              </Title>

              <Space align="center" size={12} style={{ display: "flex" }}>
                {showLogo && org && (
                  <Avatar
                    shape="square"
                    size={72}
                    src={orgLogoSrc}
                    alt={org?.name || "Organisation"}
                    className="org-avatar"
                  />
                )}

                <div>
                  <Text strong style={{ display: "block" }}>
                    {fullName || "—"}
                  </Text>

                  {org && (
                    <Text style={{ display: "block" }}>
                      <BankOutlined style={{ marginRight: 8 }} />
                      {org.id ? (
                        <span
                          className="org-link"
                          onClick={() => handleOrgClick(org.id)}
                        >
                          {org.name || "—"}
                        </span>
                      ) : (
                        org.name || "—"
                      )}
                    </Text>
                  )}

                  {org && orgAddressOneLine && (
                    <Text style={{ display: "block" }}>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {orgAddressOneLine}
                    </Text>
                  )}

                  {getPhone(u) && (
                    <Text style={{ display: "block" }}>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      <a
                        href={`tel:${String(getPhone(u)).replace(
                          /\s+/g,
                          ""
                        )}`}
                      >
                        {getPhone(u)}
                      </a>
                    </Text>
                  )}

                  {u.email && (
                    <Text style={{ display: "block" }}>
                      <MailOutlined style={{ marginRight: 8 }} />
                      <a href={`mailto:${u.email}`}>{u.email}</a>
                    </Text>
                  )}

                  {orgUrl && (
                    <Text style={{ display: "block" }}>
                      <GlobalOutlined style={{ marginRight: 8 }} />
                      <ExternalLink href={orgUrl}>{orgUrl}</ExternalLink>
                    </Text>
                  )}
                </div>
              </Space>
            </>
          )}

          {/* ------- Projektpartner mit кликабельными организациями ------- */}
          {partners.length > 0 && (
            <>
              <Title level={4} style={{ marginTop: 24 }}>
                Projektpartner
              </Title>
              <Space
                direction="vertical"
                size={14}
                style={{ display: "flex" }}
              >
                {partners
                  .slice()
                  .sort((a, b) =>
                    (a?.name || "").localeCompare(
                      b?.name || "",
                      i18n?.language || "de"
                    )
                  )
                  .map((p) => {
                    const pUrl = ensureHttp(p?.website);
                    const pAddress = getOrgAddressOneLine(p);
                    return (
                      <Space
                        key={p?.id || p?.name}
                        align="start"
                        size={12}
                      >
                        <div>
                          <Text strong style={{ display: "block" }}>
                            {p?.id ? (
                              <span
                                className="org-link"
                                onClick={() => handleOrgClick(p.id)}
                              >
                                {p?.name || "—"}
                              </span>
                            ) : (
                              p?.name || "—"
                            )}
                          </Text>

                          {pAddress && (
                            <Text style={{ display: "block" }}>
                              <EnvironmentOutlined
                                style={{ marginRight: 8 }}
                              />
                              {pAddress}
                            </Text>
                          )}

                          {p?.email && (
                            <Text style={{ display: "block" }}>
                              <MailOutlined style={{ marginRight: 8 }} />
                              <a href={`mailto:${p.email}`}>{p.email}</a>
                            </Text>
                          )}

                          {pUrl && (
                            <Text style={{ display: "block" }}>
                              <GlobalOutlined style={{ marginRight: 8 }} />
                              <ExternalLink href={pUrl}>
                                {pUrl}
                              </ExternalLink>
                            </Text>
                          )}
                        </div>
                      </Space>
                    );
                  })}
              </Space>
            </>
          )}
        </Col>

        {/* RECHTE SPALTE */}
        <Col xs={24} md={12}>
          {groupedAll.length > 0 && (
            <>
              <Title level={4} style={{ marginBottom: 0 }}>
                Kategorien von {digitalSolution.name}
              </Title>

              <Row>
                {groupedAll.map((group) => (
                  <Col xs={24} md={24} key={group.rootId}>
                    <div
                      className="category-group"
                      style={{ marginTop: 40 }}
                    >
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        {group.rootName}
                      </Text>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "start",
                        }}
                      >
                        {group.items.map((node: any) => (
                          <Text
                            key={node.id}
                            style={{
                              color: node.color || "inherit",
                              fontSize: 14,
                              lineHeight: "20px",
                            }}
                          >
                            {getNodeName(node)}
                          </Text>
                        ))}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
