import { Socket } from "node:dgram";

export default interface ISocket extends Socket {
    id: string
}