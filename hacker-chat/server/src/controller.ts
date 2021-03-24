import { constants } from "./constants";
import ISocket from "./interfaces/ISocket";
import SocketServer from "./socket";

interface User {
    id?: string
    socket?: ISocket
    username?: string
    roomId?: string
}

export default class Controller {
    [k: string]: any;

    users: Map<any, User> = new Map()
    rooms = new Map()
    socketServer: SocketServer;

    constructor(socketServer: SocketServer) {
        this.socketServer = socketServer
    }

    onNewConnection(socket: ISocket) {
        const { id } = socket;
        console.log('connection stablished with', id)
        const userData: User = { id, socket }

        this.updateGlobalUserData(id, userData)

        socket.on('data', this.onSocketData(id))
        socket.on('error', this.onSocketClosed(id))
        socket.on('end', this.onSocketClosed(id))
    }

    broadcast({socketId, roomId, event, message, includeCurrentSocket = false}: any) {
        const usersOnRoom = this.rooms.get(roomId)

        for(const [key, user] of usersOnRoom) {
            if(!includeCurrentSocket && key === socketId) continue
            this.socketServer.sendMessage(user.socket, event, message)
        }
    }

    async joinRoom(socketId: string, data: User) {
        const userData = data
        const user = this.updateGlobalUserData(socketId, userData)

        console.log(`${userData.username} joined: ${socketId}`)
        const { roomId } = userData

        const users = this.joinUserInRoom(roomId, user)

        const currentUsers = (Array.from(users.values()) as User[])
            .map(({ id, username }) => ({ id, username }))

            console.log(currentUsers)
        this.socketServer
            .sendMessage(user?.socket, constants.events.UPDATE_USERS, currentUsers)
            
        this.broadcast({
            socketId,
            roomId,
            message: {id: socketId, username: user?.username},
            event: constants.events.NEW_USER_CONNECTED
        })
    }

    joinUserInRoom(roomId: string | undefined, user: any) {
        const usersOnRoom = this.rooms.get(roomId) ?? new Map()
        usersOnRoom.set(user.id, user)

        this.rooms.set(roomId, usersOnRoom)

        return usersOnRoom
    }

    onSocketData(id: string) {
        return (data: string) => {
            try {
                const { event, message } = JSON.parse(data)
                console.log(event)
                this[event](id, message)

            } catch (error) {
                console.error('Wrong event format', error)
            }

            console.log('onsocketdata', data.toString())
        }
    }

    onSocketClosed(id: string) {
        return (data: any) => {
            console.log('onSocketClosed', id)
        }
    }

    updateGlobalUserData(socketId: string, userData: User) {
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