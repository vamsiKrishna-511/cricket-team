const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// return a list of all the players from the team
// API 1

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team;`;
  const PlayersArray = await db.all(getPlayersQuery);
  response.send(
    PlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// Add a new player in the team
// API 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayersQuery = ` insert into cricket_team(player_name,jersey_number,role)
    values ('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(addPlayersQuery);
  response.send(`Player Added to Team`);
});

//Returns a player based on player id
// API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id = ${playerId};`;
  const book = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(book));
});

//update a player based on player id
// API 4

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `update cricket_team
    set 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    where
     player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//deletes a player based on player id
// API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from
      cricket_Team
    where
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send(`Player Removed`);
});

module.exports = app;
