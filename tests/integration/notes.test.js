const request = require("supertest");
const { User } = require("../../models/user");
const { Notes } = require("../../models/notes");
const { Categories } = require("../../models/categories");
const mongoose = require("mongoose");

let server;
let user;
let token;
let title;
let body;
let category;

describe("/api/notes", () => {
  beforeEach(async () => {
    server = require("../../index");
    user = new User();
    category = new Categories({ name: "A", count: 1 });
    await category.save();
    token = user.genereateJwt();
    title = "a";
    body = "b";
  });
  afterEach(async () => {
    await server.close();
    await Notes.remove({});
    await Categories.remove({});
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
        category: category._id,
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
      expect(res.body[0]).toHaveProperty("date");
      expect(res.body[0].category).toMatchObject({
        _id: category._id,
        name: category.name,
      });
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

  describe("GET /:id", () => {
    let note;
    let id;

    beforeEach(async () => {
      note = new Notes({
        title,
        body,
        userId: user._id,
        category: category._id,
      });
      await note.save();

      id = note._id;
    });

    const exec = () => {
      return request(server).get(`/api/notes/${id}`).set("x-auth-token", token);
    };

    it("should retunr staus 200 if the id is in server", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should retunr note with valid _id", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", note._id.toString());
    });

    it("should retunr status 401 if no token is povided ", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should retunr status 400 if ivalid token is povided ", async () => {
      token = "a";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should retunr status 404 if note id is not valid id ", async () => {
      id = "a";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should retunr status 404 if note id is not in database ", async () => {
      id = mongoose.Types.ObjectId().toString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });

  describe("POST", () => {
    const exec = () => {
      return request(server)
        .post("/api/notes")
        .set("x-auth-token", token)
        .send({ title, body, category: category._id });
    };

    it("should return posted note if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", title);
      expect(res.body).toHaveProperty("body", body);
      expect(res.body).toHaveProperty("category", category._id.toString());
    });

    it("should increment category count if category id is provided", async () => {
      await exec();
      const res = await Categories.findById(category._id);

      expect(res).toHaveProperty("count", 2);
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
      body = Array(1001).join("a");
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

  describe("PUT", () => {
    let note;
    let newTitle;
    let newBody;
    let newCategory;
    let id;

    beforeEach(async () => {
      newTitle = "aa";
      newBody = "bb";
      newCategory = new Categories({ name: "B" });
      await newCategory.save();

      note = new Notes({
        title,
        body,
        userId: user._id,
        category: category._id,
      });
      await note.save();

      id = note._id.toString();
    });

    const exec = () => {
      return request(server)
        .put(`/api/notes/${id}`)
        .set("x-auth-token", token)
        .send({ title: newTitle, body: newBody, category: newCategory._id });
    };

    it("should retunr status 200 if the input and note id is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should retunr new note if the input and id is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("title", newTitle);
      expect(res.body).toHaveProperty("body", newBody);
      expect(res.body).toHaveProperty("category", newCategory._id.toString());
    });

    it("should decrement old category and increment new category count if new category is provided", async () => {
      await exec();
      const oldCategoryResult = await Categories.findById(category._id);
      const newCategoryResult = await Categories.findById(newCategory._id);

      expect(oldCategoryResult).toHaveProperty("count", 0);
      expect(newCategoryResult).toHaveProperty("count", 1);
    });

    it("should retunr status 404 if the note id is not valid id", async () => {
      id = "a";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should retunr status 404 if the note id is not in databse", async () => {
      id = mongoose.Types.ObjectId().toString();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return status 400 if title is not provide", async () => {
      newTitle = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if title is more then 100 characters", async () => {
      newTitle = Array(102).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return status 400 if body is more then 999 characters", async () => {
      newBody = Array(1001).join("a");
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

  describe("DELETE /:id", () => {
    let note;
    let id;

    beforeEach(async () => {
      note = new Notes({
        title,
        body,
        userId: user._id,
        category: category._id,
      });
      await note.save();

      id = note._id;
    });

    const exec = () => {
      return request(server)
        .delete(`/api/notes/${id}`)
        .set("x-auth-token", token);
    };

    it("should retunr staus 200 if the id is in server", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should set category count to 0 when deleted", async () => {
      await exec();
      catgoryResult = await Categories.findById(category._id);

      expect(catgoryResult).toHaveProperty("count", 0);
    });

    it("should retunr note with valid _id", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", note._id.toString());
    });

    it("should delete note with given note id", async () => {
      await exec();
      const res = await Notes.findById(id);

      expect(res).toBeNull();
    });

    it("should retunr status 401 if no token is povided ", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should retunr status 400 if ivalid token is povided ", async () => {
      token = "a";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should retunr status 404 if note id is not valid id ", async () => {
      id = "a";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should retunr status 404 if note id is not in database ", async () => {
      id = mongoose.Types.ObjectId().toString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
