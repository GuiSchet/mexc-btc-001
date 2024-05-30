import dotenv from 'dotenv';
import ccxt from 'ccxt';
import { sleep } from './varios.js';

dotenv.config({path: '.env'});

//Inicializar exchange.
const exchangeId = 'mexc';
const exchangeClass = ccxt[exchangeId];
const exchange = new exchangeClass ({
        'apiKey': process.env.API_PUBLIC,
        'secret': process.env.API_SECRET,
        'timeout': 30000,
        'enableRateLimit': true,
});

const cancelOrders = async () => {
    console.log('Cancelando ordenes:');
    try{     
        const orders = await exchange.fetchOpenOrders();
        //console.log(orders);
        for (const order in orders) {
            //console.log(orders[order]['id'])
            await exchange.cancelOrder(orders[order]['id'], orders[order]['symbol'])
            console.log('Orden correctamente cancelada: ', orders[order]['symbol'])
        }
    } catch {
        console.log('Error cargando ordenes para cancelar.')
    }
};

const sellPosition = async (mercado, cantHoldeada, precisionAmount, precisionPrice) => {
    try {
        let orderBook = await exchange.fetchOrderBook(mercado);
        //console.log(orderBook);
        // limite volumen en mercado
        let volumenBTC = 0.005;
        let volumenMERC = volumenBTC / orderBook['bids'][0][0];
        let vol = 0;
        for (let itemSell = 0; itemSell < orderBook['asks'].length; itemSell++) {
            vol += orderBook['asks'][itemSell][1];
            if (vol > volumenMERC) {
                let price = orderBook['asks'][itemSell][0];
                price -= precisionPrice;
                if ((cantHoldeada * price) > 0.0001) {
                    try {
                        await exchange.createLimitSellOrder (mercado, cantHoldeada, price);
                        console.log(mercado, '  Orden colocada correctamente.')
                        break;
                    }
                    catch {
                        console.log(mercado, '  Error carga de orden de venta. REVISAR.');
                    }
                };
            };
        };
    }
    catch {
        console.log(mercado, '  Error carga de orderbook. REVISAR.');
        
    }
}

const seller = async (mercadosBTC) => {
    console.log('LISTA BALANCE:');
    try {
        let balance = await exchange.fetchBalance();
        balance = balance.total
        delete balance['BTC'];
        //let merc = 'DOGE';
        //console.log(balance['BTC']);
        for (const key in balance) {
            try {
                //console.log(key, '  ', balance[key]);
                let cantHoldeada = balance[key];
                if (cantHoldeada > 0) {
                    let minimun = mercadosBTC[(key + '/BTC')]['limits']['amount']['min'];
                    let precisionAmount = mercadosBTC[(key + '/BTC')]['precision']['amount'];
                    let precisionPrice = mercadosBTC[(key + '/BTC')]['precision']['price'];
                    if (cantHoldeada > minimun) {
                        try {
                            await sellPosition((key + '/BTC'), cantHoldeada, precisionAmount, precisionPrice)
                        }
                        catch {
                            console.log('Error. REVISAR.');
                        }
                    };
                };              
            }
            catch {
                console.log(key, '  Error carga de mercado. REVISAR BALANCE.');
            }
        }
    }
    catch {
        console.log('Error cargando balance. REVISAR.');
    }
}

const buyer = async (mercadosBTC) => {
    console.log('MERCADOS PARA COMPRA: ');
    try {
        let listaSpread = [];
        for (const mercado in mercadosBTC) {
            try {
                await sleep(2000);
                //console.log(mercado);
                let volumenBTC = 0.005;
                let volBid = 0;
                let volAsk = 0;
                let priceBid = 0;
                let priceAsk = 0;
                let orderBook = await exchange.fetchOrderBook(mercado);
                //console.log(orderBook);
                for (let item in orderBook['asks']) {
                    volAsk += orderBook['asks'][item][0] * orderBook['asks'][item][1];
                    if (volAsk > volumenBTC) {
                        priceAsk = orderBook['asks'][item][0];
                        break;
                    };
                };
                for (let item in orderBook['bids']) {
                    volBid += orderBook['bids'][item][0] * orderBook['bids'][item][1];
                    if (volBid > volumenBTC) {
                        priceBid = orderBook['bids'][item][0];
                        break;
                    };
                };
                let precisionPrice = mercadosBTC[mercado]['precision']['price']
                priceAsk -= precisionPrice;
                priceBid += precisionPrice;
                let spread = priceAsk / priceBid;
                if (spread > 1.05) {
                    console.log(mercado, '   ', priceAsk, '  ', priceBid, '  ', spread);
                    listaSpread.push([spread, mercado, priceAsk, priceBid]);
                };
            }
            catch {
                console.log(mercado, '  Error buscando mercado para venta.');
            }      
        };
        for (let item in listaSpread) {
            try {
                await sleep(500);
                let mercado = listaSpread[item];
                let amount = 0.0003 / mercado[3];
                //let precisionAmount = mercadosBTC[mercado]['precision']['amount'];
                //amount = (Math.round(amount / precisionAmount)) * precisionAmount;
                await exchange.createLimitBuyOrder (mercado[1], amount, mercado[3]);
                console.log(mercado[1], '  Orden de compra colocada correctamente.')

            }
            catch {
                console.log(mercado[1], '  Error carga de orden de compra. REVISAR.');
                continue;
            }
        };

    }
    catch {
        console.log('Error generando  busqueda de compras. REVISAR.')
    }
}


export {
    exchange,
    cancelOrders,
    seller,
    buyer
};