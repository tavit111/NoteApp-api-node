const request = require("supertest");
const { User } = require("../../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");

describe("/api/user", () => {
  let name;
  let email;
  let password;
  let user;
  let server;

  beforeEach(() => {
    server = require("../../index");
    name = "123";
    email = "a@a.com";
    password = "12345";
  });
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  describe("POST", () => {
    const exec = () =>
      request(server).post("/api/user").send({ name, email, password });

    it("should return status 200 if input is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
    it("should return user's valid _id, name, email if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
    });
    it("should return header x-auth-token with valid token upon valid input", async () => {
      const res = await exec();

      const token = res.get("x-auth-token");
      const userObject = await jwt.verify(token, config.get("jwtPrivateKey"));
      expect(userObject).toHaveProperty("_id", res.body._id);
    });
    it("should create encripted password", async () => {
      const res = await exec();

      const { password: dbPassword } = await User.findById(res.body._id);
      const validated = await bcrypt.compare(password, dbPassword);

      expect(validated).toBeTruthy();
    });

    it("should return status 400 if is name less then 3 characters", async () => {
      name = "aa";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if name is more then 60 characters", async () => {
      name = Array(62).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if email is not provided", async () => {
      email = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("HERE should return status 400 if email is invalid", async () => {
      email = "a";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if pasword is less then 5 characters", async () => {
      password = "1234";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if pasword is more then 100 characters", async () => {
      password = Array(102).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if email is in database", async () => {
      user = new User({ name, email, password });
      await user.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
