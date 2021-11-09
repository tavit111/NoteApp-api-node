const request = require("supertest");
const { User } = require("../../models/user");
const { Notes } = require("../../models/notes");

let server;
let user;
let token;
let title;
let body;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../index");
    user = new User();
    token = user.genereateJwt();
    title = "a";
    body = "a";
  });
  afterEach(async () => {
    await server.close();
    await Notes.remove({});
  });

  describe("GET", () => {
    const exec = () => {
      return request(server).get("/api/notes").set("x-auth-token", token);
    };

    beforeEach(async () => {
      const note = new Notes({
        title,
        body,
        userId: user._id,
      });
      await note.save();
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
      token = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return noting if token of other useer is provided", async () => {
      token = new User().genereateJwt();
      const res = await exec();
      expect(res.body.length).toBe(0);
    });
  });

  describe("POST", () => {
    const exec = () => {
      return request(server)
        .post("/api/notes")
        .set("x-auth-token", token)
        .send({ title, body });
    };

    it("should return posted note if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", title);
      expect(res.body).toHaveProperty("body", body);
      expect(res.body).toHaveProperty("userId", user._id.toString());
    });

    it("should return status 400 if title is not provide", async () => {
      title = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if title is more then 100 characters", async () => {
      title = Array(102).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if body is more then 999 characters", async () => {
      title = Array(1001).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 401 if token is not provided", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 400 if token is not valid", async () => {
      token = "a";
      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
