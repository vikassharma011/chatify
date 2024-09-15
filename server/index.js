import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';



const app = express();
const users=[{}];
// Enable CORS
app.use(cors({
    origin: ["http://localhost:5002"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.get('/',(req,res)=>{
    res.send('hi its working')
})
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        res.status(500).send('Error retrieving messages');
    }
});
// Create an HTTP server and integrate Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5002",
        methods: ["GET", "POST"]
    }
});

io.on("connection",(socket)=>{
    console.log("New Connection");

   

    socket.on('joined',({user})=>{
          users[socket.id]=user;
          console.log(`${user} has joined `);
          socket.broadcast.emit('userJoined',{user:"Admin",message:` ${users[socket.id]} has joined`});
          socket.emit('welcome',{user:"Admin",message:`Welcome to the chat,${users[socket.id]} ,  {"Hi share this link to your friend to start live communication "}`})
    })

    socket.on('message', ({message,id})=>{
         
        io.emit('sendMessage',{user:users[id],message,id});
    })

    socket.on('disconnect',()=>{
          socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
        console.log(`user left`);
    })
});

// Listen on a specific port
const port = process.env.PORT || 5002;
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
