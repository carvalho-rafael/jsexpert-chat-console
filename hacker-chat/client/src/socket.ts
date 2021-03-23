import CliConfig from "./cliConfig"

export default class SocketClient {
    serverConnection: any = {}
    host: string
    port: string
    protocol: string

    constructor({ host, port, protocol }:  CliConfig) {
        this.host = host
        this.port = port 
        this.protocol = protocol
    }

    async createConnection(): Promise<any> {
        const options = {
            port: this.port,
            host: this.host,
            headers: {
                Connection: 'Upgrade',
                Upgrade: 'websocket'
            }
        }

        const http = await import(this.protocol)
        const req = http.request(options)
        req.end()

        return new Promise(resolve => {
            req.once('upgrade', (res: any, socket: any) => resolve(socket))
        })
    }

    async initialize() {
        this.serverConnection = await this.createConnection()
        console.log('client connected o serve')
    }
}