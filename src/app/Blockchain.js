/*const SHA256 = require("crypto-js/sha256");
const Block = require("./Block");

class Blockchain {
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  async initializeChain() {
    if (this.height === -1) {
      const block = new Block({ data: "Genesis Block" });
      await this.addBlock(block);
    }
  }

  addBlock(block) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      block.height = self.chain.length;
      block.time = new Date().getTime().toString();

      if (self.chain.length > 0) {
        block.previousBlockHash = self.chain[self.chain.length - 1].hash;
      }

      let errors = await self.validateChain();
      if (errors.length > 0) {
        reject(new Error("The chain is not valid: ", errors));
      }

      block.hash = SHA256(JSON.stringify(block)).toString();
      self.chain.push(block);
      resolve(block);
    });
  }

  validateChain() {
    let self = this;
    const errors = [];

    return new Promise(async (resolve, reject) => {
      self.chain.map(async (block) => {
        try {
          let isValid = await block.validate();
          if (!isValid) {
            errors.push(new Error(`The block ${block.height} is not valid`));
          }
        } catch (err) {
          errors.push(err);
        }
      });

      resolve(errors);
    });
  }

  print() {
    let self = this;
    for (let block of self.chain) {
      console.log(block.toString());
    }
  }
}

module.exports = Blockchain;*/

//Utilizamos la libreria crypto-js para realizar el calculo del HASH de los parametros que indiquemos en el constructor del block.
const SHA256 = require('crypto-js/sha256');
const { NewUser } = require('./modells/modells');
//**Nueva libreria para obtener--->la llave publica y privada de nuestra wallet en JavaScript. 
//Enlace del repositorio-> https://github.com/indutny/elliptic */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//**Que son las transacciones?
//Añadimos una nueva clase para añadir transacciones en lugar del data.
class Transaction{
    constructor(fromAddress, toAddress, amount, data){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.data = data;
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    //**Añadimos la función para firmar las transacciones. */
    signTransaction(signingKey){
        //Condición de que no se puede firmar una transaccion con otra wallet.
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('No se puede firmar transacciones con otra wallet')
        }
        //Firma de transacciones
        //Calculo del hash de la transaccion.
        const hashTx = this.calculateHash();
        //Firma de la transaccion.
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
    //**Función para comprobar la validez de una transacción.**//
    isValid(){
        if(this.fromAddress ===null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error('No hay firma en esta transaccion.')
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

//Primero de todo creamos nuestro bloque
class Block{
    //Hacemos un constructor con las variables que comportan el bloque.
    //**Cambiamos data por transactions */
    constructor(timestamp, transactions, previousHash=''){
        //Tiempo de la transacción
        this.timestamp = timestamp;
        //Datos del bloque como pueden ser dirección de las wallets, cantidad de crypto...
        this.transactions = transactions;
        //El Hash del anterior bloque.
        this.previousHash = previousHash;
        //Hash del actual bloque
        this.hash = this.calculateHash();
        //Añadimos Nonce a nuestro constructor **
        this.nonce = 0;
    }
    //Función para calcular el Hash del bloque
    //Un hash es el resultado de una función hash, la cual es una operación criptográfica que genera identificadores únicos 
    //e irrepetibles a partir de una información dada. Los hashes son una pieza clave en la tecnología blockchain 
    //y tiene una amplia utilidad.
    //Añadimos el nonce al calculo del hash
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions)+ this.nonce).toString();
    }

    //Que es proof of work?
    //El protocolo de Prueba de Trabajo o Proof of Work, es el más conocido 
    //y antiguo protocolo de consenso que consiste en que las partes de una red realicen con éxito un trabajo computacionalmente costoso para acceder a los recursos de dicha red. 
    //Como es la minera....

    //Que es difficulty?
    //La configuración de la dificultad de minería depende de los protocolos de programación y operación de cada cadena de bloques y criptomoneda. 
    //Como ya hemos explicado, la dificultad de minado en Bitcoin debería permitir a los mineros resolver y generar un nuevo bloque aproximadamente cada 10 minutos. 
    //Y cuando no se cumple esta condición, se ajusta el grado de dificultad.

    //Que es nonce?
    //El 'número que solo se puede usar una vez', (número que solo se puede usar una vez) también conocido como nonce , es un número arbitrario que se usa en criptografía 
    //dentro de los llamados protocolos de autenticación.
    //En una red blockchain basada en Prueba de trabajo(proof of work) , el nonce funciona en combinación con el hash como elemento de control para evitar 
    //la manipulación de la información del bloque .
    //Este número aleatorio garantiza que los hashes antiguos no se puedan reutilizar en lo que se denominan ataques de repetición.

    //Implementación proof of work con la función de minado del bloque.
    mineBlock(difficulty){
        //Mientas no se cumpla la dificultad (en función de la dificultad indicada) estará realizando el calculo del hash.
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: "+ this.hash);
    }
    //**Añadimos en el bloque para la comprobación de si la transaccion es valida y cumple con los requisitos. */
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

//Creamos nuestra blockchain
class Blockchain{

    constructor(){
        this.chain = [this.createGenesisBlock()];
        //***Añadimos la variable de dificultad de minado del bloque en nuestro constructor.
        this.difficulty = 4;
        //Añadimos a nuestro constructor un array de transacciones pendientes.
        this.pendingTransactions = [];
        //Tambien añadimos un recompensa por el minado del bloque.
        this.miningReward = 100;
    }

    //Función para crear nuestro Bloque Genesis. Se llama bloque genesis al primer bloque de cada blockchain.
    createGenesisBlock(){
        return new Block(0, "01/01/2022","Genesis Block","0");
    }

    //Función para obtener el anterior bloque
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //Funcion que me trae todos los servicios que estan en estado pendiente
    findAllServiceStatusPending(){
        let transactions = []
        let count = 0
        this.chain.forEach(block => {
                for (let i = 0; i < block.transactions.length; i++) {
                    if(block.transactions[i].data != undefined){
                        if(block.transactions[i].data.newService != undefined){
                            if(block.transactions[i].data.newService.status == 'PENDIENTE'){
                                transactions.push(block.transactions[i].data)
                            }
                        }
                    }
                }
            count++
        })
        return transactions
    }

    //Trae todos los carnets que estan pendientes
    findAllCarnetsPending(){
        let transactions = []
        let count = 0
        this.chain.forEach(block => {
                for (let i = 0; i < block.transactions.length; i++) {
                    if(block.transactions[i].data != undefined){
                        if(block.transactions[i].data.newCarnte != undefined){
                            if(block.transactions[i].data.newCarnet.status == 'PENDIENTE'){
                                transactions.push(block.transactions[i].data)
                            }
                        }
                    }
                }
            count++
        })
        return transactions
    }

    //Trae todas las transacciones que ha hecho un usuario
    findTransactionsByKeyPublic(key){
        let transactions = []
        let count = 0
        this.chain.forEach(block => {
            console.log('Bloque' + count + '\n\n\n');
                for (let i = 0; i < 2; i++) {
                    if(block.transactions[i].fromAddress === key){
                        transactions.push(block.transactions[i].data)
                    }
                }
            count++
        })
        return transactions
    }

    //Traer todos los servicios que tiene pendiente un usuario
    findTransactionsByService(key){
        let taxiservices = []
        let transactions = this.findTransactionsByKeyPublic(key)
        transactions.forEach(transaction => {
            console.log('\n\n\nTransaccion');
            console.log(transaction.newService);
            if(transaction.newService != undefined && transaction.newService != null){
                    taxiservices.push(transaction)
            }
        })
        return taxiservices
    }

    //Traer servicios en estado pendiente
    findServiceByKey(key){
        let taxiservices = []
        let transactions = this.findTransactionsByKeyPublic(key)
        transactions.forEach(transaction => {
            console.log('\n\n\nTransaccion');
            console.log(transaction.newService);
            if(transaction.newService != undefined && transaction.newService != null){
                    taxiservices.push(transaction)
            }
        })
        return taxiservices
    }

    findTransactionsByState(){

    }

    //Quitamos el AddBlock y lo cambiamos por la funcion de minado de transacciones pendientes, que la llamamos...miningPendingTransactions.
    minedPendingTransactions(miningRewardAddress){
        console.log('Comenzando el proceso de minado');
        //**Cambiamos y creamos de nuevo la transaccion de la recompensa del minado. */
        const rewardTx= new Transaction(null, miningRewardAddress,this.miningReward, 'Usted ha ganado esta parte por minar el bloque');
        this.pendingTransactions.push(rewardTx);

        //Definimos la creacion de un nuevo bloque.
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        //Le pasamos la dificultad al minado del bloque.
        block.mineBlock(this.difficulty);
        
        //Añadimos el bloque a la cadena
        console.log('Bloque se ha minado correctamente');
        this.chain.push(block);

        //**Cambio del array de las transacciones pendientes. */
        this.pendingTransactions = [];
        console.log('Minado terminado');
    }

    //Función para crear una transacción.
    addTransaction(transaction, myWalletAddres){
        //**Añadimos condicionales a la función de añadir transacciones. */
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Las transacciones tienen que tener ambas direcciones.')
        }
        if(!transaction.isValid()){
            throw new Error('No se puede añadir una transaccion no valida a la blockchain.')
        }
        this.pendingTransactions.push(transaction);
        if(this.pendingTransactions.length == 2){
            this.minedPendingTransactions(myWalletAddres)
        }
    }

    //Función para obtener el balance de una dirección.
    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance-= trans.amount;
                }
                if(trans.toAddress === address){
                    balance+=trans.amount;
                }
            }
        }
        return balance;
    }

    //Función para comprobar si nuestra blockchain es valida.
    isChainValid(){
        for(let i = 1; i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            //**Añadimos la condicion de si las transacciones son validas. */
            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }

    //Función que busca el correo electronico y la constraseña de cada usuario
    login(email, password){
        let count = 0
        let user 
        this.chain.forEach(block => {
            console.log('Bloque' + count + '\n\n\n');
                for (let i = 0; i < block.transactions.length; i++) {
                    if(block.transactions[i].data != undefined && block.transactions[i].data != null){
                        if(block.transactions[i].data.newUser != undefined){
                            if(block.transactions[i].data.newUser.username == email && block.transactions[i].data.newUser.password == password){
                                user = block.transactions[i].data.newUser;
                            }
                        }
                    }
                }
            count++
        })
        return user;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;