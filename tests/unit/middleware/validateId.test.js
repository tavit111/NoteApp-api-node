const validateId = require("../../../middleware/validateId");

describe("middleware/validateId", () => {
  it("should call res.status(404) if the req.params.id is not valid mongodb id", () => {
    const req = { params: { id: "a" } };
    const res = { status: jest.fn(() => ({ send: jest.fn() })) };
    const next = jest.fn();

    validateId(req, res, next);

    expect(res.status.mock.calls[0][0]).toBe(404);
  });
});
