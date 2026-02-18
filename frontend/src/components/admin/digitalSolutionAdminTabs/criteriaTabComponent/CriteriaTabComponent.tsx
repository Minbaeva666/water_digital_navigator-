import React, { useMemo } from "react";
import { Form, Select, Typography, FormInstance, Row, Col, Empty, Input } from "antd";
import { DigitalSolutionFormValues } from "../../../../forms/digital-solution/DigitalSolutionFormValues";
import { TaxonomyNodeDto } from "../../../../types/dtos/TaxonomyNodeDto";
import { findOtherTargetGroupNodeId } from "../../../../utils/taxonomyTree";

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
  const otherTargetGroupId = useMemo(
    () => findOtherTargetGroupNodeId(taxonomyNodes),
    [taxonomyNodes]
  );

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

            const isTargetGroupParent =
              parent.nameDe.trim().toLowerCase() ===
              "zielgruppe / nutzerkreis".toLowerCase();
            const showOtherInput =
              !!otherTargetGroupId &&
              isTargetGroupParent &&
              selected.includes(otherTargetGroupId);

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
                        if (isTargetGroupParent && otherTargetGroupId && !vals.includes(otherTargetGroupId)) {
                          form.setFieldValue("targetGroupOther", undefined);
                        }
                      }}
                      filterOption={(input, option) => {
                        const label = (option?.label as string) || "";
                        return label.toLowerCase().includes(input.toLowerCase());
                      }}
                      options={branches.map((b) => ({
                        label: b.branch.nameDe, 
                        options: b.options.map((n) => ({
                          label: n.nameDe,
                          value: n.id,
                          disabled: selected.length >= max && !selected.includes(n.id),
                        })),
                      }))}
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
                      name="targetGroupOther"
                      label="Andere Zielgruppe angeben"
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
                              new Error("Bitte die andere Zielgruppe angeben")
                            );
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Andere Zielgruppe angeben" />
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
