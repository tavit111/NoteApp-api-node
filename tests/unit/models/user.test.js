const { User } = require("../../../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("user.genereateJwt", () => {
  it("should generate valid json web token", async () => {
    const payload = { _id: mongoose.Types.ObjectId().toString() };
    const user = new User(payload);
    const token = user.genereateJwt();

    const decoded = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    expect(decoded).toMatchObject(payload);
  });
});
