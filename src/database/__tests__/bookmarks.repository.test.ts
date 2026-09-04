import { getDatabase } from "../database";
import { getBookmark } from "../bookmarks.repository";

jest.mock("../database", () => ({
  getDatabase: jest.fn(),
}));

const getDatabaseMock = jest.mocked(getDatabase);

describe("getBookmark", () => {
  it("returns the persisted note for a bookmarked launch", async () => {
    const getFirstAsync = jest.fn().mockResolvedValue({
      launch_id: "launch-1",
      note: "Watch the livestream",
      created_at: "2026-09-04T10:00:00.000Z",
      updated_at: "2026-09-04T11:00:00.000Z",
    });

    getDatabaseMock.mockResolvedValue({ getFirstAsync } as never);

    await expect(getBookmark("launch-1")).resolves.toEqual({
      launchId: "launch-1",
      note: "Watch the livestream",
      createdAt: "2026-09-04T10:00:00.000Z",
      updatedAt: "2026-09-04T11:00:00.000Z",
    });
    expect(getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE launch_id = ?"),
      "launch-1",
    );
  });

  it("returns null when the launch is not bookmarked", async () => {
    const getFirstAsync = jest.fn().mockResolvedValue(null);

    getDatabaseMock.mockResolvedValue({ getFirstAsync } as never);

    await expect(getBookmark("missing-launch")).resolves.toBeNull();
  });
});
