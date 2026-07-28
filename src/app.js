const express = require("express");

function createApp(databasePool) {
  const app = express();
  const appName = process.env.APP_NAME || "Lejiend CI/CD Assignment";
  const environment = process.env.NODE_ENV || "development";

  app.get("/", (_request, response) => {
    response.json({
      message: `${appName} is running`,
      environment
    });
  });

  app.get("/health", async (_request, response) => {
    try {
      await databasePool.query("SELECT 1 AS database_status");
      response.status(200).json({
        status: "healthy",
        application: appName,
        database: "connected"
      });
    } catch (_error) {
      response.status(503).json({
        status: "unhealthy",
        application: appName,
        database: "disconnected"
      });
    }
  });

  return app;
}

module.exports = { createApp };
