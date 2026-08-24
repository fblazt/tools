import { tools, toolsById, toolsByCategory } from "./tools-registry";

describe("tools-registry", () => {
  describe("tools array", () => {
    it("has at least one tool", () => {
      expect(tools.length).toBeGreaterThan(0);
    });

    it("every tool has all required fields", () => {
      for (const tool of tools) {
        expect(tool.id).toBeTruthy();
        expect(tool.title).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.category).toBeTruthy();
        expect(tool.keywords.length).toBeGreaterThan(0);
        expect(tool.icon).toBeDefined();
        expect(tool.component || tool.externalUrl).toBeDefined();
      }
    });

    it("external tools have externalUrl defined", () => {
      const externalTools = tools.filter((t) => t.externalUrl);
      expect(externalTools.length).toBeGreaterThan(0);
      for (const tool of externalTools) {
        expect(tool.externalUrl).toMatch(/^https?:\/\//);
      }
    });

    it("all tool IDs are unique", () => {
      const ids = tools.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("toolsById", () => {
    it("returns correct tool for valid ID", () => {
      const tool = toolsById.get("jwt-decoder");
      expect(tool?.title).toBe("JWT Decoder");
    });

    it("returns undefined for invalid ID", () => {
      expect(toolsById.get("nonexistent")).toBeUndefined();
    });

    it("has same count as tools array", () => {
      expect(toolsById.size).toBe(tools.length);
    });
  });

  describe("toolsByCategory", () => {
    it("groups all tools into categories", () => {
      const totalTools = toolsByCategory.reduce((sum, cat) => sum + cat.tools.length, 0);
      expect(totalTools).toBe(tools.length);
    });

    it("each category has a title and at least one tool", () => {
      for (const category of toolsByCategory) {
        expect(category.title).toBeTruthy();
        expect(category.tools.length).toBeGreaterThan(0);
      }
    });
  });
});
