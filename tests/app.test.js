const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../src/app");

test("GET / returns application information", async () => {
  const app = createApp({ query: async () => [[{ database_status: 1 }]] });
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.match(response.body.message, /Lejiend CI\/CD Assignment/);
});

test("GET /health returns 200 when MySQL responds", async () => {
  const app = createApp({ query: async () => [[{ database_status: 1 }]] });
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "healthy");
  assert.equal(response.body.database, "connected");
});

test("GET /health returns 503 when MySQL is unavailable", async () => {
  const app = createApp({
    query: async () => {
      throw new Error("Database unavailable");
    }
  });
  const response = await request(app).get("/health");

  assert.equal(response.status, 503);
  assert.equal(response.body.status, "unhealthy");
  assert.equal(response.body.database, "disconnected");
});
