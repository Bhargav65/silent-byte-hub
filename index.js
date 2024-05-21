const express = require('express'); 
const app = express(); 
const { Server } = require('socket.io'); 
const http = require('http'); 
const bodyParser = require('body-parser');
const server = http.createServer(app); 
const io = new Server(server); 
require('dotenv').config();
const port = process.env.PORT ||3000; 
app.use(express.static(__dirname));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.uri;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    db = client.db('chatapp').collection('chat');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas', err);
    process.exit(1); // Exit process with failure
  }
};



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => { 
	res.sendFile(__dirname + '/index.html'); 
}); 

var dis=0

app.get('/create_room',(req,res)=>{
    res.sendFile(__dirname + '/index1.html'); 
})

app.get('/join_room',(req,res)=>{
    res.sendFile(__dirname + '/joinroom.html'); 
})



io.on('connection', (socket) => {
  console.log("A user connected");

  
  socket.on('typing', (id) => {
    io.emit(`${id}user typing1`, 'User'); 
});

socket.on('stop typing', (id) => {
    io.emit(`${id}user stopped typing1`, 'User');

});

socket.on('typing1', (id) => {
    io.emit(`${id}user typing`, 'User'); 

});

socket.on('stop typing1', (id) => {
    io.emit(`${id}user stopped typing`, 'User'); 

});


    socket.on('send message', (chat) => { 
        const id = chat.id;
        socket.broadcast.emit(`${id}0`, chat); 
    }); 

    socket.on('send message1', (chat) => { 
        const id = chat.id;
        socket.broadcast.emit(`${id}1`, chat); 
    }); 
}); 



io.on('connection', (socket) => {
    
  
    // These events are emitted to alert and disconnecting the call
    
    
    socket.on('disconnect_call1', (id) => {
      io.emit(`disconnect_call${id}1`)
    })
    socket.on('disconnect_call', (id) => {
      io.emit(`disconnect_call${id}`)
    })
    socket.on('alert_call', (val) => {
      io.emit(`alert${val.id}`,(val.type))
    })
    socket.on('alert_call1', (val) => {
      io.emit(`alert${val.id}1`,(val.type))
    })


    //-------------------------------------------------------------------------------------------------------//



    socket.on('join', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', socket.id);
    });
  
    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', data);
    });
  
    socket.on('answer', (data) => {
      socket.to(data.roomId).emit('answer', data);
    });
  
    socket.on('ice-candidate', (data) => {
      socket.to(data.roomId).emit('ice-candidate', data);
    });
  })





app.get('/room',async(req,res)=>{
    res.sendFile(__dirname + '/joinroom.html'); 
})




app.post('/seconduser', async (req, res) => {
    const id = req.body.id;
    db = client.db('chatapp').collection('chat');
    const doc = await db.findOne({ id: id });

    if (!doc) {
        
        io.emit('send error', 'error');
        res.sendFile(__dirname + '/joinroom.html'); 
    }
    else if(doc['user']==1){
        await db.findOneAndUpdate(
            { id: id }, 
            { $set: { user: 2 } }, 
            { upsert: true } 
          );
        io.emit('send name', {hello:'helo',id:id});
        res.sendFile(__dirname + '/chat1.html'); 
    }
    else {
      res.sendFile(__dirname + '/limit.html'); 
    }})




app.get('/chat',async(req,res)=>{
    io.emit('send name', "nil");
    res.sendFile(__dirname + '/chat.html'); 
})

app.post('/firstuser', async(req, res) => {
  db = client.db('chatapp').collection('chat');
    res.redirect(`/${req.body.id}`)
    const id=req.body.id
    app.get(`/${req.body.id}`, async(req, res) => {
        await db.insertOne({ id: id, user: 1 });
        io.on('connection', (socket) => {
            io.emit('send name', {hello:'hello',id:id});
        })
        res.sendFile(__dirname + '/waiting.html');
    })
})


app.post('/logout',async(req,res)=>{
  await db.deleteOne({id:req.body.hide});
  io.emit(`logout${req.body.hide}`, "logout");
})

server.listen(port, () => { 
	console.log(`Server is listening at the port: ${port}`); 
});
