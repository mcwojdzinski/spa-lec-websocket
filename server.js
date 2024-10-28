const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server, path: "/voting" });

let results = {
  pizza: 0,
  pasta: 0,
};

app.use(express.static("client"));
server.listen(3001);

const clients = new Set();

wsServer.on("connection", (socket) => {
  console.log("Client connected!");
  clients.add(socket);

  socket.on("message", (message) => {
    // handle vote
    if (message == "Pizza") results.pizza += 1;
    else if (message == "Pasta") results.pasta += 1;

    console.log("Message received: " + JSON.stringify(results));

    wsServer.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(results));
        console.log("Sending to a client from clients.");
      }
    });
  });
  socket.on("error", (error) => {
    console.log("Error:" + error);
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.log(
      "Client disconnected, total numver of clients is: ",
      clients.size
    );
  });

  // send current results to a newly connected client
  socket.send(JSON.stringify(results));
  console.log("Sending to a newly connected client.");
});
