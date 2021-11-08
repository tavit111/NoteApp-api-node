// TODO: get finished, post,
const request = require("supertest");
const { User } = require("../../models/user");
const { Notes } = require("../../models/notes");
const jwt = require("jsonwebtoken");
const config = require("config");
let server;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Notes.remove({});
  });

  describe("GET", () => {
    let user;
    let token;
    let title;
    let body;

    const exec = () => {
      return request(server).get("/api/notes").set("x-auth-token", token);
    };

    beforeEach(async () => {
      user = new User();
      token = user.genereateJwt();

      title = "1";
      body = "1";
      const note = new Notes({
        title,
        body,
        userId: user._id,
      });
      await note.save();
      console.log("user", user);
    });

    it("should return status 200", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return note if valid input is provided", async () => {
      const res = await exec();
      expect(res.body[0]).toHaveProperty("_id");
      expect(res.body[0]).toHaveProperty("title", title);
      expect(res.body[0]).toHaveProperty("body", body);
    });

    it("should return status 401 if token is not provided", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return status 400 if token is invalid", async () => {
      token = "11111111";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return noting if token of other use is provided", async () => {
      token = new User().genereateJwt();
      const res = await exec();
      expect(res.body.length).toBe(0);
    });
  });
});
