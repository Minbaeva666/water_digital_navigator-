import { describe, expect, it } from "vitest";
import {
  buildGroupedSelections,
  findOtherTargetGroupNodeId,
  getParentKeyFromTree,
  isOtherTargetGroupSelected,
  slugify,
} from "./taxonomyTree";
import type { TaxonomyNodeDto } from "../types/dtos/TaxonomyNodeDto.ts";

const taxonomyFixture: TaxonomyNodeDto[] = [
  {
    id: "root-target",
    nameDe: "Zielgruppe / Nutzerkreis",
    slug: "zielgruppe-nutzerkreis",
    type: "GROUP",
    parentId: null,
    path: "/root-target",
    depth: 0,
    sort: 1,
    children: [
      {
        id: "child-waterworks",
        nameDe: "Wasserwerke",
        slug: "wasserwerke",
        type: "GROUP",
        parentId: "root-target",
        path: "/root-target/child-waterworks",
        depth: 1,
        sort: 1,
        children: [],
      },
      {
        id: "child-other",
        nameDe: "Andere Zielgruppe",
        slug: "andere-zielgruppe",
        type: "GROUP",
        parentId: "root-target",
        path: "/root-target/child-other",
        depth: 1,
        sort: 2,
        children: [],
      },
    ],
  },
  {
    id: "root-topic",
    nameDe: "Technologie",
    slug: "technologie",
    type: "GROUP",
    parentId: null,
    path: "/root-topic",
    depth: 0,
    sort: 2,
    children: [
      {
        id: "child-ai",
        nameDe: "KI",
        slug: "ki",
        type: "GROUP",
        parentId: "root-topic",
        path: "/root-topic/child-ai",
        depth: 1,
        sort: 1,
        children: [],
      },
    ],
  },
];

describe("taxonomyTree", () => {
  it("slugifies german labels with special characters", () => {
    expect(slugify("Ärzte & Über/Unter   Test")).toBe("arzte-und-uber-unter-test");
  });

  it("groups selected ids by top ancestor and keeps selection order", () => {
    const grouped = buildGroupedSelections(
      ["child-ai", "child-other", "child-waterworks"],
      taxonomyFixture
    );

    expect(grouped).toEqual({
      "root-topic": ["child-ai"],
      "root-target": ["child-other", "child-waterworks"],
    });
  });

  it("finds parent key recursively", () => {
    expect(getParentKeyFromTree("child-ai", taxonomyFixture)).toBe("root-topic");
    expect(getParentKeyFromTree("missing", taxonomyFixture)).toBeNull();
  });

  it("detects 'Andere Zielgruppe' node under target group", () => {
    expect(findOtherTargetGroupNodeId(taxonomyFixture)).toBe("child-other");

    expect(
      isOtherTargetGroupSelected(
        {
          "root-target": ["child-waterworks", "child-other"],
        },
        taxonomyFixture
      )
    ).toBe(true);
  });
});
