import { exchange, cancelOrders, seller, buyer } from './varios/ccxtLibreria.js';
import { guardarAllMarkets, allMarkets, filtroBaseBTC, sleep } from './varios/varios.js';
import fs from 'fs';

// 0 cancelar todas las ordenes
// 1 balance
// 2 vender
// 3 comprar


const main = async () => {
    while (true) {
        guardarAllMarkets(await exchange.loadMarkets ());
        let markets = allMarkets();
        markets = filtroBaseBTC(markets);
        await cancelOrders(markets);
        await seller(markets);
        await buyer(markets);
        await sleep(900000)
    };
};

main();

const mainPruebas = async () => {
    guardarAllMarkets(await exchange.loadMarkets ());
    let markets = allMarkets();
    markets = filtroBaseBTC(markets);
};

//mainPruebas();



