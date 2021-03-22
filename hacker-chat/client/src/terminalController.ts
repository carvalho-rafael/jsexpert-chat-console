import EventEmitter from "node:events";

import ComponentBuilder from "./components";
import IComponentBuild from "./interfaces/IComponentBuild";

import { constants } from './constants';

export default class TerminalController {
    private _userColors = new Map();

    constructor() {

    }
    private _getUserColor(username: string) {
        if (this._userColors.has(username)) {
            return this._userColors.get(username);
        }

        const color = this._pickColor();
        this._userColors.set(username, color);

        return color;
    }

    private _pickColor() {
        return `#` + ((1 << 24) * Math.random() | 0).toString(16) + '-fg'
    }

    private _onInputReceived(eventEmitter: EventEmitter) {
        return function (this: any) {
            const message = this.getValue();
            console.log('message: ', message);
            this.clearValue;
        }
    }

    private _onMessageReceived({ screen, chat }: IComponentBuild) {
        return (msg: { username: string, message: string }) => {
            const { username, message } = msg;
            const color = this._getUserColor(username);
            chat?.addItem(`{${color}}{bold}${username}:{/} ${message}`);
            screen?.render();
        }
    }

    private _onLogChanged({ screen, activityLog }: IComponentBuild) {
        return (msg: string) => {
            const [username] = msg.split(/\s/);
            const color = this._getUserColor(username);
            activityLog?.addItem(`{${color}}{bold}${msg}{/}`);
            screen?.render();
        }
    }

    private _onStatusChanged({ screen, status }: IComponentBuild) {
        return (users: []) => {
            const item = status?.shiftItem();
            status?.clearItems();
            status?.addItem(item?.content?? 'ra')
            users.forEach((username)=> {
                const color = this._getUserColor(username);
                status?.addItem(`{${color}}{bold}${username}{/}`);
            })
            screen?.render();
        }
    }

    private _registerEvents(eventEmitter: EventEmitter, components: IComponentBuild) {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this._onMessageReceived(components));
        eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this._onLogChanged(components));
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this._onStatusChanged(components));
    }

    async initializeTable(eventEmitter: EventEmitter) {
        console.log("dsafdsaf")
        const components = new ComponentBuilder()
            .setScreen({ title: 'Hacker-chat - Rafael' })
            .setLayoutComponent()
            .setInputComponent(this._onInputReceived(eventEmitter))
            .setChatComponent()
            .setStatusComponent()
            .setActivityLogComponent()
            .build()

        this._registerEvents(eventEmitter, components);

        components.input?.focus();
        components.screen?.render();

        setInterval(() => {
            const users = ['rafael']
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            users.push('maria')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            users.push('josé')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'rafael saiu')
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { username: 'rafael', message: 'Bom dia Brasil, boa tarde Itália' })
        }, 500)
    }
}