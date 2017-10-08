const chalk = require('chalk');
var server = require('http').createServer();
var io = require('socket.io')(server);

const LISTEN_PORT = process.env.PORT || 3000;
const WORK_TIMER = 2000;
const WORK_LOOPS = 1000;
const COLOR_RESET = '\x1b[0m';

io.on('connection', function(client) {
  console.log(`\tClient connected\t${client.id}`);

  let starWork, stopWork, workStartedAt,
      shader, shaders = ['red', 'green', 'blue'];

  startWork = () => {
    // Cycle through shaders with each run
    if (shader === 'red') {
      shader = 'green';
    } else if (shader === 'green') {
      shader = 'blue';
    } else {
      shader = 'red';
    }
    client.emit('start', shader, { loops: WORK_LOOPS });
    workStartedAt = (new Date()).getTime();
    console.log(`\t\tStart ${toConsoleColor(shader)}${shader}${COLOR_RESET} on ${client.id}`);
  }

  client.on('work', (work) => {
    if (work) {
      let workEndedAt = (new Date()).getTime(),
      timeToWork = workEndedAt - workStartedAt,
      hashrate, payload_string, rgb = toConsoleColor(work.payload);
      hashrate = (work.hashes*work.threads) / (timeToWork/1000);
      payload_string = `${rgb}${work.payload}${COLOR_RESET}`;

      console.log(`\t\tStop ${toConsoleColor(shader)}${shader}${COLOR_RESET} on ${client.id}`);
      console.log(`\t\t\ttime: ${(timeToWork/1000)}s`);
      console.log(`\t\t\treported: ${work.time}s`);
      console.log(`\t\t\tloops: ${work.hashes}`);
      console.log(`\t\t\tthreads: ${work.threads}`);
      console.log(`\t\t\tpayload: ${payload_string}`);
      console.log(`\t\t\thashrate: ${hashrate.toFixed(3)} h/s`);
      console.log(`\t\t\treported: ${work.hashrate.toFixed(3)} h/s`);

      startWork();
      //console.log(`\t\t\tGot work from ${client.id}:`, work);
    }
  });

  client.on('disconnect', () => {
    console.log(`\tClient disconnected\t${client.id}`);
  });

  startWork();
});

server.listen(LISTEN_PORT, () => {
  console.log(`Overlord listening on port ${LISTEN_PORT}\n`);
});

function toConsoleColor(rgba) {
  if (rgba[0] > 0 || rgba === 'red') {
    return '\x1b[31m'; // console red
  } else if (rgba[1] > 0 || rgba === 'green') {
    return '\x1b[32m'; // console green
  } else if (rgba[2] > 0 || rgba === 'blue') {
    return '\x1b[34m'; // console blue
  } else if (rgba[0] === 0
          && rgba[1] === 0
          && rgba[2] === 0) {
    return '\x1b[33m'; // console yellow, winner!
  }
  return '';
}
