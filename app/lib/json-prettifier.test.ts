import { describe, it, expect } from "vitest";
import {
  validateAndFormatJson,
  buildJsonNodeTree,
  collectAllCollapsibleNodeIds,
  calculateJsonDepth,
  calculateJsonKeyCount,
  detectJsonType,
  parseJsonSyntaxError,
  SAMPLE_JSON,
} from "./json-prettifier";

describe("JSON Prettifier Engine", () => {
  describe("Formatting and Indentation", () => {
    it("formats valid JSON with default 2-space indentation", () => {
      const input = '{"name":"Alex","age":30}';
      const result = validateAndFormatJson(input);

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('{\n  "name": "Alex",\n  "age": 30\n}');
      expect(result.error).toBeUndefined();
    });

    it("formats valid JSON with explicit 4-space indentation", () => {
      const input = '{"name":"Alex","age":30}';
      const result = validateAndFormatJson(input, { indent: 4 });

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('{\n    "name": "Alex",\n    "age": 30\n}');
    });

    it("formats empty object and empty array correctly", () => {
      const objResult = validateAndFormatJson("{}");
      expect(objResult.isValid).toBe(true);
      expect(objResult.formatted).toBe("{}");
      expect(objResult.stats?.keyCount).toBe(0);
      expect(objResult.stats?.depth).toBe(1);

      const arrResult = validateAndFormatJson("[]");
      expect(arrResult.isValid).toBe(true);
      expect(arrResult.formatted).toBe("[]");
      expect(arrResult.stats?.keyCount).toBe(0);
      expect(arrResult.stats?.depth).toBe(1);
    });

    it("formats primitive JSON values (number, string, boolean, null)", () => {
      expect(validateAndFormatJson("42").isValid).toBe(true);
      expect(validateAndFormatJson('"hello"').isValid).toBe(true);
      expect(validateAndFormatJson("true").isValid).toBe(true);
      expect(validateAndFormatJson("null").isValid).toBe(true);
    });
  });

  describe("Syntax Error Diagnostics", () => {
    it("returns error for empty input and whitespace-only input", () => {
      const emptyResult = validateAndFormatJson("");
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error?.message).toContain("empty");

      const wsResult = validateAndFormatJson("   \n\t  ");
      expect(wsResult.isValid).toBe(false);
      expect(wsResult.error?.message).toContain("empty");
    });

    it("extracts line and column numbers for syntax errors", () => {
      const badJson = '{\n  "key": "val",\n  "trailing": ,\n}';
      const result = validateAndFormatJson(badJson);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBeDefined();
      expect(result.error?.line).toBeGreaterThanOrEqual(1);
      expect(result.error?.column).toBeGreaterThanOrEqual(1);
    });

    it("handles single-line malformed JSON gracefully", () => {
      const badJson = '{"unclosed": "string}';
      const result = validateAndFormatJson(badJson);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBe(1);
    });

    it("parses error message fallback gracefully", () => {
      const fallbackError = parseJsonSyntaxError(new Error("Unexpected token"), "abc");
      expect(fallbackError.line).toBe(1);
      expect(fallbackError.column).toBe(1);
    });
  });

  describe("Diagnostic Stats Calculation", () => {
    it("computes accurate UTF-8 byte counts and reduction percentage", () => {
      const unformatted = '{\n  "foo"   :   "bar"   ,\n  "count":   100\n}';
      const result = validateAndFormatJson(unformatted);

      expect(result.isValid).toBe(true);
      const stats = result.stats!;
      expect(stats.rawBytes).toBe(new TextEncoder().encode(unformatted).length);
      expect(stats.formattedBytes).toBe(new TextEncoder().encode(result.formatted!).length);
      expect(stats.minifiedBytes).toBe(new TextEncoder().encode('{"foo":"bar","count":100}').length);
      expect(stats.lineCount).toBe(4);
      expect(stats.keyCount).toBe(2);
      expect(stats.depth).toBe(2);
      expect(stats.reductionPercentage).toBeGreaterThanOrEqual(0);
    });

    it("calculates nesting depth accurately", () => {
      expect(calculateJsonDepth("hello")).toBe(1);
      expect(calculateJsonDepth({})).toBe(1);
      expect(calculateJsonDepth([])).toBe(1);
      expect(calculateJsonDepth({ a: 1 })).toBe(2);
      expect(calculateJsonDepth({ a: { b: 2 } })).toBe(3);
      expect(calculateJsonDepth([1, [2, [3]]])).toBe(4);
      expect(calculateJsonDepth({ arr: [{ nested: true }] })).toBe(4);
    });

    it("calculates key count accurately", () => {
      expect(calculateJsonKeyCount(123)).toBe(0);
      expect(calculateJsonKeyCount({})).toBe(0);
      expect(calculateJsonKeyCount([])).toBe(0);
      expect(calculateJsonKeyCount({ a: 1, b: 2 })).toBe(2);
      expect(calculateJsonKeyCount({ a: { b: 1, c: { d: 2 } } })).toBe(4);
      expect(calculateJsonKeyCount([{ a: 1 }, { b: 2, c: 3 }])).toBe(3);
    });

    it("calculates zero reduction percentage when minified is not smaller than raw", () => {
      const result = validateAndFormatJson("1");
      expect(result.stats?.reductionPercentage).toBe(0);
    });
  });

  describe("Type Detection", () => {
    it("detects all JSON types accurately", () => {
      expect(detectJsonType(null)).toBe("null");
      expect(detectJsonType([])).toBe("array");
      expect(detectJsonType({})).toBe("object");
      expect(detectJsonType("text")).toBe("string");
      expect(detectJsonType(100)).toBe("number");
      expect(detectJsonType(true)).toBe("boolean");
    });
  });

  describe("Tree View Structure Construction", () => {
    it("builds a hierarchical node tree for an object with nested properties", () => {
      const data = {
        name: "Dev",
        details: { role: "admin", active: true },
        tags: ["tool", "json"],
      };

      const tree = buildJsonNodeTree(data);

      expect(tree.id).toBe("root");
      expect(tree.type).toBe("object");
      expect(tree.depth).toBe(1);
      expect(tree.itemCount).toBe(3);
      expect(tree.children?.length).toBe(3);

      const nameNode = tree.children?.find((c) => c.key === "name");
      expect(nameNode?.id).toBe("root.name");
      expect(nameNode?.type).toBe("string");
      expect(nameNode?.value).toBe("Dev");
      expect(nameNode?.depth).toBe(2);

      const detailsNode = tree.children?.find((c) => c.key === "details");
      expect(detailsNode?.id).toBe("root.details");
      expect(detailsNode?.type).toBe("object");
      expect(detailsNode?.itemCount).toBe(2);
      expect(detailsNode?.children?.length).toBe(2);

      const roleNode = detailsNode?.children?.find((c) => c.key === "role");
      expect(roleNode?.id).toBe("root.details.role");
      expect(roleNode?.value).toBe("admin");

      const tagsNode = tree.children?.find((c) => c.key === "tags");
      expect(tagsNode?.id).toBe("root.tags");
      expect(tagsNode?.type).toBe("array");
      expect(tagsNode?.itemCount).toBe(2);
      expect(tagsNode?.children?.[0].id).toBe("root.tags[0]");
      expect(tagsNode?.children?.[0].value).toBe("tool");
    });

    it("builds tree for root arrays and primitive items", () => {
      const data = [1, 2, "three"];
      const tree = buildJsonNodeTree(data);

      expect(tree.id).toBe("root");
      expect(tree.type).toBe("array");
      expect(tree.itemCount).toBe(3);
      expect(tree.children?.[0].id).toBe("root[0]");
      expect(tree.children?.[0].type).toBe("number");
      expect(tree.children?.[2].id).toBe("root[2]");
      expect(tree.children?.[2].type).toBe("string");
    });

    it("builds tree for primitive root values", () => {
      const tree = buildJsonNodeTree("raw string");
      expect(tree.id).toBe("root");
      expect(tree.type).toBe("string");
      expect(tree.value).toBe("raw string");
      expect(tree.children).toBeUndefined();
    });
  });

  describe("Collapsible Node IDs Collection", () => {
    it("collects collapsible IDs for expandable objects and arrays", () => {
      const data = {
        user: {
          profile: {
            title: "Engineer",
          },
        },
        skills: ["typescript", "react"],
        emptyObj: {},
        emptyArr: [],
      };

      const tree = buildJsonNodeTree(data);
      const collapsibleIds = collectAllCollapsibleNodeIds(tree);

      expect(collapsibleIds).toContain("root");
      expect(collapsibleIds).toContain("root.user");
      expect(collapsibleIds).toContain("root.user.profile");
      expect(collapsibleIds).toContain("root.skills");

      // Empty objects/arrays should not be considered collapsible (no children to fold)
      expect(collapsibleIds).not.toContain("root.emptyObj");
      expect(collapsibleIds).not.toContain("root.emptyArr");
    });

    it("returns empty array for primitive root values or empty objects", () => {
      const primTree = buildJsonNodeTree(42);
      expect(collectAllCollapsibleNodeIds(primTree)).toEqual([]);

      const emptyObjTree = buildJsonNodeTree({});
      expect(collectAllCollapsibleNodeIds(emptyObjTree)).toEqual([]);

      const emptyArrTree = buildJsonNodeTree([]);
      expect(collectAllCollapsibleNodeIds(emptyArrTree)).toEqual([]);
    });
  });

  describe("SAMPLE_JSON Constants", () => {
    it("is valid JSON and passes validation", () => {
      expect(typeof SAMPLE_JSON).toBe("string");
      const parsed = JSON.parse(SAMPLE_JSON);
      expect(parsed.user).toBeDefined();
      expect(parsed.user.profile).toBeDefined();
      expect(parsed.user.roles).toBeInstanceOf(Array);

      const result = validateAndFormatJson(SAMPLE_JSON);
      expect(result.isValid).toBe(true);
      expect(result.stats?.depth).toBeGreaterThanOrEqual(3);
      expect(result.stats?.keyCount).toBeGreaterThan(5);

      const tree = buildJsonNodeTree(parsed);
      const collapsibleIds = collectAllCollapsibleNodeIds(tree);
      expect(collapsibleIds.length).toBeGreaterThan(0);
    });
  });
});
