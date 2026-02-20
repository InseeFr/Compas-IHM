import { groupModulesByApp } from "utils/group-module-by-apps";
import { describe, it, expect } from "vitest";

type TestModule = {
    id: string;
    isModule?: boolean;
    parentApplication?: string;
};

describe("groupModulesByApp", () => {
    it("returns an empty object when given an empty array", () => {
        expect(groupModulesByApp([])).toEqual({});
    });

    it("groups modules under their parent application", () => {
        const data: TestModule[] = [
            { id: "1", isModule: true, parentApplication: "app-a" },
            { id: "2", isModule: true, parentApplication: "app-a" },
            { id: "3", isModule: true, parentApplication: "app-b" }
        ];

        expect(groupModulesByApp(data)).toEqual({
            "app-a": [
                { id: "1", isModule: true, parentApplication: "app-a" },
                { id: "2", isModule: true, parentApplication: "app-a" }
            ],
            "app-b": [{ id: "3", isModule: true, parentApplication: "app-b" }]
        });
    });

    it("excludes items where isModule is false", () => {
        const data: TestModule[] = [
            { id: "1", isModule: false, parentApplication: "app-a" },
            { id: "2", isModule: true, parentApplication: "app-a" }
        ];

        expect(groupModulesByApp(data)).toEqual({
            "app-a": [{ id: "2", isModule: true, parentApplication: "app-a" }]
        });
    });

    it("excludes items where isModule is undefined", () => {
        const data: TestModule[] = [
            { id: "1", parentApplication: "app-a" },
            { id: "2", isModule: true, parentApplication: "app-a" }
        ];

        expect(groupModulesByApp(data)).toEqual({
            "app-a": [{ id: "2", isModule: true, parentApplication: "app-a" }]
        });
    });

    it("excludes items where parentApplication is undefined", () => {
        const data: TestModule[] = [
            { id: "1", isModule: true },
            { id: "2", isModule: true, parentApplication: "app-a" }
        ];

        expect(groupModulesByApp(data)).toEqual({
            "app-a": [{ id: "2", isModule: true, parentApplication: "app-a" }]
        });
    });

    it("excludes items where both isModule and parentApplication are undefined", () => {
        const data: TestModule[] = [{ id: "1" }, { id: "2" }];

        expect(groupModulesByApp(data)).toEqual({});
    });

    it("preserves all extra properties on grouped items", () => {
        type RichModule = TestModule & { version: number; label: string };

        const data: RichModule[] = [
            { id: "1", isModule: true, parentApplication: "app-a", version: 2, label: "Auth" }
        ];

        expect(groupModulesByApp(data)).toEqual({
            "app-a": [{ id: "1", isModule: true, parentApplication: "app-a", version: 2, label: "Auth" }]
        });
    });

    it("handles a large number of modules across many applications", () => {
        const data: TestModule[] = Array.from({ length: 100 }, (_, i) => ({
            id: String(i),
            isModule: true,
            parentApplication: `app-${i % 5}`
        }));

        const result = groupModulesByApp(data);

        expect(Object.keys(result)).toHaveLength(5);
        Object.values(result).forEach(group => expect(group).toHaveLength(20));
    });
});
