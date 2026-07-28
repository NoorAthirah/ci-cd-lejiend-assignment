require("dotenv").config();

const { createApp } = require("./app");
const { createDatabasePool } = require("./database");

const port = Number(process.env.PORT || 3000);
const appName = process.env.APP_NAME || "Lejiend CI/CD Assignment";
const databasePool = createDatabasePool();
const app = createApp(databasePool);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`${appName} is running on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down.`);
  server.close(async () => {
    await databasePool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
