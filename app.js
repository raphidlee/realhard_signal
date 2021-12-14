
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// //
//  exports.helloWorld = functions.https.onRequest((request, response) => {
//    functions.logger.info("Hello logs!", {structuredData: true});
//    response.send("Hello from Firebase!");
//  });

const restApp = express();
restApp.use(cors({ origin: "https://realhard.web.app/", credentials: true }));


restApp.use(bodyParser.json());
restApp.use(bodyParser.urlencoded({extended: false}));

restApp.get('/status', (request, response) => response.json({clients: clients.length}));

let clients = [];
let facts = [];
function eventsHandler(request, response, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

//   const data = `data: ${JSON.stringify(facts)}\n\n`;

//   response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

function sendEventsToAll(newFact) {
    console.debug(clients.length +" clients");
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`))
}

async function addFact(request, respsonse, next) {
  const newFact = request.body;
  facts.push(newFact);
  respsonse.json(newFact)
  return sendEventsToAll(newFact);
}

restApp.post('/fact', addFact);

restApp.get('/events', eventsHandler);



const server = require('http').Server(restApp);

if (module === require.main) {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
  }
module.export = server;