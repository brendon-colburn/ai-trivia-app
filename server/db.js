const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID || "TriviaDB";
const containerId = process.env.COSMOS_DB_CONTAINER_ID || "Scores";

const client = new CosmosClient({ endpoint, key });

async function init() {
  // Create database (if not exists)
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  // Create container (if not exists)
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { kind: "Hash", paths: ["/userId"] }
  });
  return container;
}

async function addScore(score) {
  const container = await init();
  const { resource } = await container.items.create(score);
  return resource;
}

async function getScores() {
  const container = await init();
  const querySpec = {
    query: "SELECT * FROM c"
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}

module.exports = { addScore, getScores };