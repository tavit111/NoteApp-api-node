const request = require("supertest");
const { User } = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
let server;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  describe("POST", () => {
    let password;
    let email;
    let name;

    const exec = () => {
      return request(server).post("/api/auth").send({
        email,
        password,
      });
    };

    beforeEach(async () => {
      email = "12345@email.com";
      password = "12345";
      name = "123";
      const user = new User({
        email,
        name,
      });
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    });

    it("should return status 200", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return valid jwt token", async () => {
      const res = await exec();
      const decoded = await jwt.verify(res.text, config.get("jwtPrivateKey"));
      expect(decoded).toHaveProperty("_id");
      expect(decoded).toHaveProperty("email", email);
      expect(decoded).toHaveProperty("name", name);
      expect(decoded).not.toHaveProperty("password");
    });

    it("should return status 400 if email is not given", async () => {
      email = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return status 400 if password is not given", async () => {
      password = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return status 400 if email donse not match", async () => {
      email = "9999@email.com";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return status 400 if password donse not match", async () => {
      password = "99999";
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});
