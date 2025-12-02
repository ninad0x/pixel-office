import { Server } from "socket.io";
import type { activePlayer } from "./types";

const io = new Server(3001, {
  cors: { origin: "http://localhost:3000" },
});

let socketCount = 0;

const players:activePlayer[] = []

io.on("connection", (socket) => {

    console.log("socket count ", ++socketCount);

    socket.on("join", (player: activePlayer) => {
        players.push(player);
        socket.join(player.room);

        socket.emit("players-in-room", players.filter(p => p.room === player.room));
        socket.to(player.room).emit("player-joined", player);
    });



    socket.on("move", (data) => {
        socket.to(data.room).emit("move", data);
    });


    socket.on("disconnect", () => {
        socketCount = 0;
        console.log(socket.id, "disconnected");
        io.emit("player-left", { id: socket.id });
    });
});
