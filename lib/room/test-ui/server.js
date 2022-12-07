const express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  WebSocket = require('ws');
app.use(express.json());

const rooms = {
  '~sun-test-room-1-123': {
    rid: '~sun-test-room-1-123',
    provider: '~sun',
    creator: '~sun',
    access: 'public',
    title: 'Test Room 1',
    present: ['~sun'],
    whitelist: [],
    capacity: 4,
    space: '~sun/room-space',
  },
  '~sun-hangout-zone-123': {
    rid: '~sun-hangout-zone-123',
    provider: '~sun',
    creator: '~lomder-librun',
    access: 'public',
    title: 'Hangout Zone',
    present: ['~lomder-librun'],
    whitelist: [],
    capacity: 4,
    space: '~sun/room-space',
  },
};
const sockets = {};

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/rooms', (req, res) => {
  return res.send(Object.values(rooms));
});

app.post('/rooms/:rid/join', (req, res) => {
  const { rid } = req.params;
  const { patp } = req.body;
  const room = rooms[rid];

  if (!room) {
    return res.status(404).send('Room not found');
  }
  if (room.present.length >= room.capacity) {
    return res.status(403).send('Room is full');
  }
  if (!room.present.includes(patp)) {
    room.present.push(req.body.patp);
  }
  updateRoom(room, { enter: patp });
  return res.send(room);
});

app.post('/rooms/:rid/leave', (req, res) => {
  const { rid } = req.params;
  // console.log(req);
  const { patp } = req.body;
  const room = rooms[rid];
  if (!room) {
    return res.status(404).send('Room not found');
  }
  room.present = room.present.filter((p) => p !== patp);
  updateRoom(room, { leave: patp });
  return res.send(room);
});

const updateRoom = (room, diff) => {
  Object.values(sockets).forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ 'room-update': { diff, room } }));
    }
  });
};

// A room in websocket is a generic concept: a pool of sockets that broadcast to each other
// this follows common language in popular libraries like socket.io
// A websocket can request to be moved to a room, or be in multiple rooms at once
// In Realm terms, we can use a room for Realm Rooms OR Channels... just providing their ID as the websocket room ID

// Store references to each socket
// Record<SocketID, WebSocket>
let socketIdInc = 0;
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', function connection(ws) {
  // Store the socket
  const wsId = socketIdInc++;
  sockets[wsId] = ws;
  console.log('New websocket connection:', wsId);

  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);

    try {
      const payload = JSON.parse(message);

      const otherSockets = Object.keys(sockets)
        .filter((socketId) => socketId !== wsId) // TEMPORARY: send payload back to current client to test
        .map((socketId) => sockets[socketId]);

      // Send the message to all other sockets
      otherSockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(payload));
        }
      });
    } catch (e) {
      console.log('message not valid json', e);
      ws.send(
        JSON.stringify({
          event: 'error',
          message: 'message not valid json',
        })
      );
    }
  });
});

const port = process.env.NODE_ENV === 'production' ? 80 : 3100;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
