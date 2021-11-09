const auth = require("../../../middleware/auth");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");

describe("middleware/auth", () => {
  it("should populate user with valid json web token", () => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      name: "aaa",
      email: "a@a.com",
    };
    const token = new User(user).genereateJwt();

    const req = {
      get: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
