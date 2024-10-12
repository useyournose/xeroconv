import { test, expect, mock } from "bun:test";

mock.module("./module", () => {
 return {
 default: () => "mocked default export",
 };
});

test("mock.module", async () => {
 const esm = await import("./module");
 expect(esm.default().mock.calls[0] ).toBe("mocked default export");

 const cjs = require("./module");
 expect(cjs.default().mock.calls[0]).toBe("mocked default export");
});