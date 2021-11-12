import app from './app';
import http from 'http';
import { Server, Socket } from 'socket.io';

/**
 * CREATE A SERVER OBJECT
 */
const server = http.createServer(app);

const io = new Server(server, {});

io.on('connection', (socket: Socket) => {
    // ...
});
server.listen(process.env.PORT || 3001);
