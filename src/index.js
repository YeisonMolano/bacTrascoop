const express = require('express')
const cors = require('cors')
const multer = require('multer')
const app = express()
const { CarnetIntermunicipal, TaxiService, User, NewUser } = require('./app/modells/modells')
const {Blockchain, Transaction} = require('./app/Blockchain')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//Traigo mi llave publica y mi llave privada
var myKey = ec.keyFromPrivate('c770ee187d35af614a7ef43fe1a10c5a3046ad1342b5c1c57797f88b66be4012');
var myWalletAddress = myKey.getPublic('hex');

//Creacion de la carpeta de almacenamiento donde se van a guardar nuestras imagenes
app.use(cors())
app.use(express.static('src/files/images'))
app.use(express.json())

//Levantamiento del servidor
const port = 8080
app.listen(port, ()=>{
    console.log('Se ha levantado el servidor en el puerto ' + port);
})

//Carga de imagenes mediante Multer
const storage = multer.diskStorage({
    filename: function(res, file, cb){
        const ext = file.originalname.split('.').pop()
        const fileName = Date.now()
        cb(null, `${fileName}.${ext}`)
    },
    destination: function(res, file, cb){
        cb(null, `src/files/images`)
    }
})

const updateImage = multer.diskStorage({
    filename: function(res, file, cb){
        cb(null, file.originalname)
    },
    destination: function(res, file, cb){
        cb(null, `src/files/images`)
    }
})


//Cargue inicial de las imagenes
const upload = multer({storage})
app.post('/upload', upload.array('myFile[]', 2), (req, res) =>{
    res.send({data: 'OK', url: req.files})
})

//Actualizacion de imagenes
const update = multer({updateImage})
app.put('/:filename', update.single('image'), (req, res) => {
    res.send({data: 'OK', message: 'Se ha modificado la imagen'})
})

//Transacción de pedido de un carnet Intermunicipal




//Definimos el nombre de nuestra Blockchain
let JJACoin = new Blockchain();

//Pedir un carnet Intermunicipal
app.post('/pedir-carnet', (req, res) => {
    let newCanet = new CarnetIntermunicipal(req.body.nombre, req.body.apellido, req.body.tipoUsuario, req.body.fechaNacimiento, req.body.img1, req.body.img2, req.body.img3);
    const myKey = ec.keyFromPrivate(req.body.privateKey);
    console.log(myKey.getPublic('hex'));
    const myWalletAddress = myKey.getPublic('hex');
    const newTransaction = new Transaction(myWalletAddress,'myWalletAddress', 10, {newCanet});
    newTransaction.signTransaction(myKey);
    JJACoin.addTransaction(newTransaction, myWalletAddress);
    res.json('Se ha cargado una nueva transacción');
})

//Regisrar una persona y al mismo tiempo creando la llave public y privada para poder interactura con la blockchain
app.post('/registrar-usuario', (req, res) => {
    let newUser = new NewUser(req.body.name, req.body.lastName, req.body.email, req.body.tellphone, req.body.username, req.body.password, req.body.auth);
    const myKey1 = ec.keyFromPrivate(newUser.privateKey);
    const myWalletAddress1 = myKey1.getPublic('hex');
    const newTransaction = new Transaction(myWalletAddress1,'myWalletAddress', 10, {newUser});
    newTransaction.signTransaction(myKey1);
    JJACoin.addTransaction(newTransaction, myWalletAddress1);
    JJACoin.minedPendingTransactions();
    console.log(newUser);
    res.json(newUser)
})

//Realizar el login dentro de la aplicación
app.get('/login/:email/:password', (req, res) => {
    console.log(req.params.email + '  ' + req.params.password);
    if(JJACoin.login(req.params.email, req.params.password) != null){
        res.json(JJACoin.login(req.params.email, req.params.password))
    }else{
        res.json('No se encuentra a este usuario')
    }
})

//Crear una nueva solicitud para un servicio nuevo
app.post('/new-service/:privateKey', (req, res) => {
    let newService = new TaxiService(req.body.servicio, req.body.placeDeparture, req.body.destinationPlace, req.body.time, req.body.status);
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    const newTransaction = new Transaction(myWalletAddress,'myWalletAddress', 10, {newService});
    newTransaction.signTransaction(myKey);
    JJACoin.addTransaction(newTransaction, myWalletAddress);
    res.json(newService);
})

//Crear una nueva solicitud de carnet Intermunicipal
app.post('/carnet-inter/:privateKey', (req, res) => {
    let newCarnet = new CarnetIntermunicipal(req.body.nombre, req.body.apellido, req.body.tipoUsuario, req.body.tipoCarnet, req.body.fechaNacimiento, req.body.img1, req.body.img2, req.body.img3);
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    const newTransaction = new Transaction(myWalletAddress,'myWalletAddress', 10, {newCarnet});
    newTransaction.signTransaction(myKey);
    JJACoin.addTransaction(newTransaction, myWalletAddress);
    res.json(newCarnet)
})

//Crear una nueva solicitu de carnet urbano
app.post('/carnet-urbano/:privateKey', (req, res) => {
    console.log(req.body.nombre, req.body.apellido, req.body.tipoUsuario, req.body.tipoCarnet, req.body.fechaNacimiento, req.body.status, req.body.email, req.body.img1);
    let newCarnet = new CarnetIntermunicipal(req.body.nombre, req.body.apellido, req.body.tipoUsuario, req.body.tipoCarnet, req.body.fechaNacimiento, req.body.status, req.body.email, req.body.img1);
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    const newTransaction = new Transaction(myWalletAddress,'myWalletAddress', 10, {newCarnet});
    newTransaction.signTransaction(myKey);
    JJACoin.addTransaction(newTransaction, myWalletAddress);
    res.json(newCarnet)
})

//Obtener trasacciones por publicKey
app.get('/get-transactions/:privateKey', (req, res) => {
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    res.json(JJACoin.findTransactionsByKeyPublic(myWalletAddress))
})

//Obtener servicios que ha pedido el usuario
app.get('/get-all-services/:privateKey', (req, res) => {
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    res.json(JJACoin.findTransactionsByService(myWalletAddress))
})

//Obtener servicios que estan pendientes
app.get('/get-all-users/:privateKey', (req, res) => {
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    res.json(JJACoin.findServiceByKey(myWalletAddress))
})

//Obtener los servicios pendientes que tiene el usuario
app.get('/get-all-services', (req, res) => {
    res.json(JJACoin.findAllServiceStatusPending())
})

//Obtener mi wallet a partir de la llave privada
app.get('/get-wallet/:privateKey', (req, res) => {
    const myKey = ec.keyFromPrivate(req.params.privateKey);
    const myWalletAddress = myKey.getPublic('hex');
    res.json(myWalletAddress)
})

//Obtiene los carnets que esta pendientes por aprobar
app.get('/get-carnets-pending', (req, res) =>{
    res.json(JJACoin.findAllCarnetsPending())
})