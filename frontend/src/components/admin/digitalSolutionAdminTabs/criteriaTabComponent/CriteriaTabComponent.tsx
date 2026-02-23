import React, { useEffect, useMemo, useRef } from "react";
import { Form, Select, Typography, FormInstance, Row, Col, Empty, Input } from "antd";
import { DigitalSolutionFormValues } from "../../../../forms/digital-solution/DigitalSolutionFormValues";
import { TaxonomyNodeDto } from "../../../../types/dtos/TaxonomyNodeDto";

const { Title } = Typography;

type Props = {
  form: FormInstance<DigitalSolutionFormValues>;
  onFormChange?: () => void;
  taxonomyNodes: TaxonomyNodeDto[];
};

type TaxonomyBranch = {
  branch: TaxonomyNodeDto;        // Level-1 node
  options: TaxonomyNodeDto[];     // deepest nodes under this branch
};

type TaxonomyGroup = {
  parent: TaxonomyNodeDto;        // Level-0 root
  branches: TaxonomyBranch[];     // grouped by level-1
};

const hasChildrenProp = (n: TaxonomyNodeDto) => Array.isArray((n as any).children);
const normalize = (value: string) => value.trim().toLowerCase();
const OTHER_OPTION_PREFIX = "__other__:";

function collectDeepestInSubtree(
  root: TaxonomyNodeDto,
  getChildren: (node: TaxonomyNodeDto) => TaxonomyNodeDto[]
): TaxonomyNodeDto[] {
  let maxDepth = -Infinity;
  const buckets: Record<number, TaxonomyNodeDto[]> = {};

  const stack: TaxonomyNodeDto[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    const kids = getChildren(node);
    if (kids.length === 0) {
      maxDepth = Math.max(maxDepth, node.depth);
      (buckets[node.depth] ||= []).push(node);
    } else {
      for (const k of kids) stack.push(k);
    }
  }

  if (maxDepth === -Infinity) return [root];
  return buckets[maxDepth] || [root];
}

const CriteriaTabComponent: React.FC<Props> = ({ form, taxonomyNodes, onFormChange }) => {
  const solutionState = Form.useWatch("state", form);
  const targetGroupOtherValue = Form.useWatch("targetGroupOther", form);
  const initializedFromLegacyRef = useRef(false);

  const groups: TaxonomyGroup[] = useMemo(() => {
    if (!taxonomyNodes.length) return [];

    const getChildren = (node: TaxonomyNodeDto) => {
      if (hasChildrenProp(node) && Array.isArray((node as any).children)) {
        return (((node as any).children as TaxonomyNodeDto[]) || []);
      }
      return taxonomyNodes.filter((n) => n.parentId === node.id);
    };

    const roots = taxonomyNodes.filter((n) => n.depth === 0);
    const rootList = roots.length ? roots : taxonomyNodes.filter((n) => n.parentId == null);

    return rootList.map((parent) => {
      const level1 = getChildren(parent);

      const branches: TaxonomyBranch[] = level1.map((l1) => {
        const l1Children = getChildren(l1);

        const collected =
          l1Children.length === 0
            ? [l1]
            : collectDeepestInSubtree(l1, getChildren);

        // dedupe + sort
        const seen = new Set<string>();
        const options = collected
          .filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)))
          .sort(
            (a, b) =>
              (a.sort ?? 0) - (b.sort ?? 0) ||
              a.nameDe.localeCompare(b.nameDe, "de")
          );

        return { branch: l1, options };
      });

      const nonEmptyBranches = branches.filter((b) => b.options.length > 0);

      nonEmptyBranches.sort((a, b) => a.branch.nameDe.localeCompare(b.branch.nameDe, "de"));

      return { parent, branches: nonEmptyBranches };
    });
  }, [taxonomyNodes]);

  const otherNodeIdByParent = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const { parent, branches } of groups) {
      const allOptions = branches.flatMap((branch) => branch.options);
      const otherNode = allOptions.find((node) =>
        normalize(node.nameDe).startsWith("andere")
      );
      map[parent.id] = otherNode?.id;
    }
    return map;
  }, [groups]);

  const syncCombinedOtherField = () => {
    const parts: string[] = [];
    const taxonomyOtherMap: Record<string, string> = {};

    for (const { parent } of groups) {
      const otherNodeId = otherNodeIdByParent[parent.id];
      const otherOptionValue = otherNodeId ?? `${OTHER_OPTION_PREFIX}${parent.id}`;
      const selected = (form.getFieldValue(["taxonomySelections", parent.id]) as string[]) || [];
      if (!selected.includes(otherOptionValue)) continue;

      const text = (form.getFieldValue(["taxonomyOther", parent.id]) as string | undefined)?.trim();
      if (!text) continue;

      parts.push(`${parent.nameDe}: ${text}`);
      taxonomyOtherMap[parent.id] = text;
    }

    form.setFieldValue("targetGroupOther", parts.length ? parts.join("\n") : undefined);
    form.setFieldValue("taxonomyOther", Object.keys(taxonomyOtherMap).length ? taxonomyOtherMap : undefined);
  };

  useEffect(() => {
    if (initializedFromLegacyRef.current) return;
    if (!groups.length) return;

    const existingTaxonomyOther = form.getFieldValue("taxonomyOther") as Record<string, string> | undefined;
    if (existingTaxonomyOther && Object.keys(existingTaxonomyOther).length > 0) {
      initializedFromLegacyRef.current = true;
      return;
    }

    const raw = typeof targetGroupOtherValue === "string" ? targetGroupOtherValue : "";
    if (!raw.trim()) {
      initializedFromLegacyRef.current = true;
      return;
    }

    const parsedMap: Record<string, string> = {};
    const byParentName = new Map(groups.map(({ parent }) => [normalize(parent.nameDe), parent.id]));
    const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);

    for (const line of lines) {
      const sep = line.indexOf(":");
      if (sep <= 0) continue;
      const parentLabel = line.slice(0, sep).trim();
      const text = line.slice(sep + 1).trim();
      if (!text) continue;

      const parentId = byParentName.get(normalize(parentLabel));
      if (!parentId) continue;
      parsedMap[parentId] = text;
    }

    if (Object.keys(parsedMap).length > 0) {
      form.setFieldValue("taxonomyOther", parsedMap);
    }

    initializedFromLegacyRef.current = true;
  }, [form, groups, targetGroupOtherValue]);

  return (
    <div className="flex flex-col gap-6">
      {groups.length === 0 ? (
        <Empty description="Der Administrator hat bisher keine Kriterien zur Auswahl bereitgestellt." />
      ) : (
        <>
          <Title level={4} className="pa-title">
            Wählen Sie aus den Kategorien die Kriterien aus, die am besten zu Ihrer digitalen Lösung passen.
          </Title>

          {groups.map(({ parent, branches }) => {
            const min = parent.minSelectableNodes ?? 0;
            const allOptionsCount = branches.reduce((sum, b) => sum + b.options.length, 0);
            const max = parent.maxSelectableNodes ?? allOptionsCount;

            const fieldName = ["taxonomySelections", parent.id] as any;
            const selected = (form.getFieldValue(fieldName) as string[]) || [];

            const otherNodeId = otherNodeIdByParent[parent.id];
            const otherOptionValue = otherNodeId ?? `${OTHER_OPTION_PREFIX}${parent.id}`;
            const showOtherInput = selected.includes(otherOptionValue);
            const otherFieldName = ["taxonomyOther", parent.id] as any;

            return (
              <Row gutter={64} key={parent.id}>
                <Col xs={24} md={12} xl={12} style={{ maxWidth: 800 }}>
                  <Form.Item
                    name={fieldName}
                    required={solutionState !== "DRAFT" && min > 0}
                    hasFeedback
                    validateTrigger={["onChange", "onBlur"]}
                    label={parent.nameDe}
                    rules={[
                      {
                        validator(_, value: string[] = []) {
                          if (solutionState === "DRAFT") return Promise.resolve();
                          if (value.length < min) return Promise.reject(new Error(`Mindestens ${min} auswählen`));
                          if (value.length > max) return Promise.reject(new Error(`Maximal ${max} erlaubt`));
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      placeholder={`Bitte ${min > 0 ? `mindestens ${min}` : "Kriterien"} auswählen`}
                      onChange={(vals) => {
                        onFormChange?.();
                        if (!vals.includes(otherOptionValue)) {
                          form.setFieldValue(otherFieldName, undefined);
                        }
                        syncCombinedOtherField();
                      }}
                      filterOption={(input, option) => {
                        const label = (option?.label as string) || "";
                        return label.toLowerCase().includes(input.toLowerCase());
                      }}
                      options={[
                        ...branches.map((b) => ({
                          label: b.branch.nameDe,
                          options: b.options.map((n) => ({
                            label:
                              otherNodeId && n.id === otherNodeId
                                ? `Andere ${parent.nameDe} angeben`
                                : n.nameDe,
                            value: n.id,
                            disabled: selected.length >= max && !selected.includes(n.id),
                          })),
                        })),
                        ...(otherNodeId
                          ? []
                          : [
                              {
                                label: "Weitere",
                                options: [
                                  {
                                    label: `Andere ${parent.nameDe} angeben`,
                                    value: otherOptionValue,
                                    disabled:
                                      selected.length >= max &&
                                      !selected.includes(otherOptionValue),
                                  },
                                ],
                              },
                            ]),
                      ]}
                      onSelect={(val) => {
                        const next = [...selected, val as string];
                        if (next.length > max) {
                          form.setFieldValue(fieldName, selected);
                        }
                      }}
                    />
                  </Form.Item>
                  {showOtherInput && (
                    <Form.Item
                      name={otherFieldName}
                      label={`Andere ${parent.nameDe} angeben`}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          validator(_, value: string | undefined) {
                            if (solutionState === "DRAFT" || !showOtherInput) {
                              return Promise.resolve();
                            }
                            if (value && value.trim().length > 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(`Bitte die andere Angabe für ${parent.nameDe} ausfüllen`)
                            );
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder={`Andere ${parent.nameDe} angeben`}
                        onChange={() => syncCombinedOtherField()}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            );
          })}
        </>
      )}
    </div>
  );
};

export default CriteriaTabComponent;
