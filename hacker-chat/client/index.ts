import Events from 'events';
import TerminalController from './src/terminalController';

const componentEmitter = new Events();

const controller = new TerminalController();

async function main() {
    await controller.initializeTable(componentEmitter);
}

main();
