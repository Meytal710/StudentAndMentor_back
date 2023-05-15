const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = new require('socket.io')(http, {
    cors: {
      origin: '*',
    }
});
// creating a mongoClient
const { MongoClient } = require("mongodb");
const { error } = require('console');

app.use(bodyParser.json());
app.use(cors());

// connecting to the mongoDB
const client = new MongoClient("mongodb+srv://mongo:SCeUm39PVF9tROHX@cluster0.l3ziuih.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.connect()
.then(() => console.log("Connected to MongoDB"))

const db = client.db("CodeBlock");
collection = db.collection("AllCodeBlocks");


// const database = {
//     codes: [
//     { id: 1, title: 'Async case', code: 'async function foo() {\n  // async code here\n}' },
//     { id: 2, title: 'Promise example', code: 'const promise = new Promise((resolve, reject) => {\n  // promise code here\n});' },
//     { id: 3, title: 'Array map example', code: 'const arr = [1, 2, 3];\nconst mappedArr = arr.map(num => num * 2);' },
//     { id: 4, title: 'Object example', code: 'const obj = {\n  name: "John",\n  age: 30,\n  occupation: "developer"\n};' }
//     ]
// };



io.on('connection', (ws)=> {
    //happends whenever a new client connected to the server
    const connected = Array.from(io.sockets.sockets.keys()); // the clients that are connected to the server
    console.log(connected);
    io.emit("getStatus", connected.length <= 1); // if connected.length <= 1 is true then the mentor is connected
    //happenes whenever the server receives a message from any client
    ws.on("newCodeChange", (code)=>{
        io.emit("changedCode", code);
    });

});

//get the new code
app.get('/code/:id/', async (req, res)=> {
    const id = req.params.id;
    const savedCode = await collection.find({}).toArray()[id -1].code;
    console.log(savedCode);
    res.send(savedCode);
})

//get all the data
app.get('/', async (req, res)=> {
    const codes = await collection.find({}).toArray();
    res.send(codes);
})

// save the changes 
app.put('/code/:id/saveChanges', async (req, res) => {
    const id = req.params.id;
    const newCode = req.body.code;
    const filter = {id: Number(id)};
    const updateDoc = {
        $set: {
          code: newCode
        },
      };

    const r = await collection.updateOne(filter, updateDoc);
    const codes = await collection.find({}).toArray();
    console.log(codes);
    res.json(newCode);
})

const PORT = process.env.PORT;
http.listen(PORT, ()=> console.log(`listening on port ${PORT}`));
