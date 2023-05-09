const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
//Initializing the server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
  }
};
initializeDBAndServer();
//Converting the DB objects as needed
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET all players details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//POST the players details to db
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayersQuery = `INSERT INTO cricket_team ('player_name',
        'jersey_number','role')
        VALUES('${playerDetails.playerName}',${playerDetails.jerseyNumber},'${playerDetails.role}')`;
  const dbResponse = await db.run(addPlayersQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});
//getting a player in team

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const searchQuery = `SELECT * FROM cricket_team 
    WHERE player_id=${playerId}`;
  const dbResp = await db.get(searchQuery);
  response.send(convertDbObjectToResponseObject(dbResp));
});

//UPDATING a player details
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `UPDATE cricket_team SET player_name='${playerName}',
        jersey_number=${jerseyNumber},role='${role}'
        WHERE player_id=${playerId}
        `;
  const dbResponse = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE a player in team

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
