import ISocket from "./interfaces/ISocket";
import SocketServer from "./socket";

interface UserData {
    id: string
    socket: ISocket
}
export default class Controller {
    users = new Map()
    socketServer: SocketServer;

    constructor(socketServer: SocketServer) {
        this.socketServer = socketServer
    }

    onNewConnection(socket: ISocket) {
        const { id } = socket;
        console.log('connection stablished with', id)
        const userData: UserData = { id, socket }

        this.updateGlobalUserData(id, userData)

        socket.on('data', this.onSocketData(id))
        socket.on('error', this.onSocketClosed(id))
        socket.on('end', this.onSocketClosed(id))
    }

    onSocketData(id: string) {
        return (data: any) => {
            console.log('onsocketdata', data.toString())
        }
    }

    onSocketClosed(id: string) {
        return (data: any) => {
            console.log('onSocketClosed', data.toString())
        }
    }

    updateGlobalUserData(socketId: string, userData: UserData) {
        const users = this.users
        const user = users.get(socketId) ?? {}

        const updatedUserData = {
            ...user,
            ...userData
        }

        users.set(socketId, updatedUserData)

        return users.get(socketId)
    }
}