import fs from 'fs';
const filePath = './varios/allMarkets.json';

// leer todos los mercados y guardar en archivo
const guardarAllMarkets = async (data) => {
    let jsonData = {};
    try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    jsonData = JSON.parse(fileContent);
    } catch (error) {
    console.error('Error al leer el archivo JSON:', error.message);
    process.exit(1); // Salir del script en caso de error
    }

    // Modificar la variable en el objeto JSON
    jsonData = data;

    // Guardar el objeto JSON actualizado en el archivo
    try {
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('Variable actualizada y guardada con éxito en el archivo JSON.');
    } catch (error) {
    console.error('Error al escribir en el archivo JSON:', error.message);
    process.exit(1); // Salir del script en caso de error
    }
};

// leer allmarkets.json para guardarlo en una variable.
const allMarkets = () => {
    const fileContent= fs.readFileSync(filePath, 'utf-8');
    let jsonData = JSON.parse(fileContent);
    return jsonData;
};

// filtrar mercados base /BTC
const filtroBaseBTC = (todo) => {
    let diccionario = {};
    for (let mercado in todo) {
        if (todo[mercado]['quote'] == 'BTC') {
            diccionario[mercado] = todo[mercado];
        }
    }
    return diccionario;
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
};

export {
    guardarAllMarkets,
    allMarkets,
    filtroBaseBTC,
    sleep
}