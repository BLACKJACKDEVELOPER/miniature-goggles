const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require("cors")
const fs = require("fs")

const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors:"https://432c-202-29-220-186.ngrok-free.app",
    maxHttpBufferSize:"5e8"
});

app.use(cors())

const { db } = require("./helper/db");

io.on('connection', (socket) => {
  console.log('a user connected');

  // Get Msg
  socket.on("send",async (data)=> {
    data.date = (new Date().getDate())+"-"+(new Date().getMonth())+"-"+(new Date().getFullYear());
    if (data.type == "text") {
      db("INSERT INTO messenges(type,owner,room,msg,date) VALUES (?,?,?,?,?);",[data.type,data.Mid,data.chatID,data.msg,data.date]);
    }else if (data.type == "image"){
      const FILENAME = Math.floor(Math.random() * 100000)+".png"
      fs.writeFileSync("../assets/img/"+FILENAME,data.msg.split(";base64,").pop(),{ encoding:"base64" })
      db("INSERT INTO messenges(type,owner,room,msg,date) VALUES (?,?,?,?,?);",[data.type,data.Mid,data.chatID,FILENAME,data.date]);
    }else if (data.type == "video") {
      const FILENAME = Math.floor(Math.random() * 100000)+".mp4"
      fs.writeFileSync("../assets/video/"+FILENAME,data.msg.split(";base64,").pop(),{ encoding:"base64" })
      db("INSERT INTO messenges(type,owner,room,msg,date) VALUES (?,?,?,?,?);",[data.type,data.Mid,data.chatID,FILENAME,data.date]);
    }
    io.emit(data.chatID,data)
  })

  // Caller one to one
  socket.on("caller",async (data)=> {
    const queryRoom = (await db("SELECT * FROM friends WHERE id = ?;",[data.roomID]))[0]
    const IDS = [queryRoom.Mid,queryRoom.Fid];
    const callee = IDS.indexOf(data.callerID) == 1 ? 0 : 1
    console.log(IDS[callee])
    io.emit("callee"+IDS[callee],data)
  })
  // LOCALDES_ EVENT
  socket.on("LOCALDES_",async (data)=> {
    io.emit("CALLER_GET_LOCALDES"+data.Token,data)
  })
  // REMOTE_ EVENT
  socket.on("REMOTE_",async (data)=> {
    io.emit("CALLEE_GET_REMOTEDES",data)
  })
  // ICE CANDIDATE EVENT
  socket.on("ICE",async (data)=> {
    if (data.FOR == "caller") {
      io.emit("ICE_CALLER"+data.Token,data)
    }else if (data.FOR == "callee") {
      io.emit("ICE_CALLEE"+data.Token,data)
    }
  })

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
