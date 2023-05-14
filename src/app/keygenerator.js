//Creamos nuestas Key(llaves) publica y privada para el testeo de nuestra blockchain propia.

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class KeyGeneratorUno{
    constructor(){
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
    }
}

module.exports = KeyGeneratorUno;