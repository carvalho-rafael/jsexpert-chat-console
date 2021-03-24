import EventEmitter from "events"
import { constants } from "./constants"
import SocketClient from "./socket"

export default class EventManager {
    [k: string]: any

    private allUsers = new Map()
    componentEmitter: EventEmitter
    socketClient: SocketClient

    constructor({ componentEmitter, socketClient }: { socketClient: SocketClient, componentEmitter: EventEmitter }) {
        this.componentEmitter = componentEmitter
        this.socketClient = socketClient
    }

    joinRoomAndWaitForMessage(data: any) {
        this.socketClient.sendMessage(constants.events.socket.JOIN_ROOM, data)

        this.componentEmitter.on(constants.events.app.MESSAGE_SENT, msg => {
            this.socketClient.sendMessage(constants.events.socket.MESSAGE, msg)
        })
    }

    newUserConnected(message: any) {
        const user = message
        this.allUsers.set(user.id, user.username)

        this.updateUsersComponent()
        this.updateActivityLogComponent(`${user.username} joined!`)
    }

    updateUsers(users: []) {
        const connectedUsers = users
        connectedUsers.forEach(({id, username}) => this.allUsers.set(id, username))
        this.updateUsersComponent()
    }

    private emitComponentUpdate(event: string, message: any) {
        this.componentEmitter.emit(
            event,
            message
        )
    }

    private updateActivityLogComponent(message: string) {
        this.emitComponentUpdate(
            constants.events.app.ACTIVITYLOG_UPDATED,
            message
        )
    }
    private updateUsersComponent() {
        this.emitComponentUpdate(
            constants.events.app.STATUS_UPDATED,
            Array.from(this.allUsers.values())
        )
    }

    getEvents() {
        const functions: any[] = Reflect.ownKeys(EventManager.prototype)
            .filter(fn => fn != 'constructor')
            .map(name => [name, this[String(name)].bind(this)])
        
        return new Map(functions)  as Map<string, any>
    }


}