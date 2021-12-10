const request = require("supertest");
const { User } = require("../../models/user");
const { Categories } = require("../../models/categories");
const mongoose = require("mongoose");
const { iteratee } = require("lodash");

let server;
let user;
let token;
let name;

describe("/api/categories", () => {
  beforeEach(async () => {
    server = require("../../index");
    user = new User();
    token = user.genereateJwt();
    name = "a";
  });
  afterEach(async () => {
    await server.close();
    await Categories.remove({});
  });

  describe("GET", () => {
    const exec = () => {
      return request(server).get("/api/categories").set("x-auth-token", token);
    };
    beforeEach(async () => {
      const category = new Categories({ name, userId: user._id });
      await category.save();
    });

    it("should return status 200 upon valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
    it("should return valid category _id, name and count = 0", async () => {
      const res = await exec();

      expect(res.body[0]).toHaveProperty("_id");
      expect(res.body[0]).toHaveProperty("name", name);
      expect(res.body[0]).toHaveProperty("count", 0);
    });
    it("should return status 401 if no token is provided", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 400 if invalid token is provided", async () => {
      token = "1";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status noting if token of diffrent user is provid", async () => {
      user = new User();
      token = user.genereateJwt();
      const res = await exec();

      expect(res.body.length).toBe(0);
    });
  });
  describe("POST", () => {
    const exec = () => {
      return request(server)
        .post("/api/categories")
        .set("x-auth-token", token)
        .send({ name });
    };
    it("should return 200 upon valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
    it("should return valid category _id, name and count = 0", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("count", 0);
    });
    it("should return status 401 if no token is provided", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 400 if invalid token is provided", async () => {
      token = "1";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 401 if name is too short ", async () => {
      name = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 401 if name is too long ", async () => {
      name = Array(18).join("a");
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 400 if the name arleady is declare for the user ", async () => {
      const category = new Categories({ name, userId: user._id });
      await category.save();
      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
  describe("DELETE", () => {
    let id;

    const exec = () => {
      return request(server)
        .delete(`/api/categories/${id}`)
        .set("x-auth-token", token);
    };
    beforeEach(async () => {
      const category = new Categories({ name, userId: user._id });
      await category.save();
      id = category._id;
    });
    it("should return 200 upon valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
    it("should not found the category of given id after deletion", async () => {
      await exec();
      const res = await Categories.findById(id);

      expect(res).toBeFalsy();
    });
    it("should return status 401 if no token is provided", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return status 400 if invalid token is provided", async () => {
      token = "1";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should retunr status 404 if the category's id is not valid id ", async () => {
      id = "a";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should retunr status 404 if the category's id is not in database ", async () => {
      id = mongoose.Types.ObjectId().toString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
