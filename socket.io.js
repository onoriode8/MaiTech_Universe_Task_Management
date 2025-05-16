import { Server } from 'socket.io'
import "dotenv/config.js"


let io;
export const init = (httpServer) => { 
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000", //process.env.FRONTEND_URL, //Frontend_Url.
            methods: ["GET, POST"]
        }
    })
    return io;
}

export const getIo = () => {
    if(!io) throw new Error("Io empty.")
    return io;
}

