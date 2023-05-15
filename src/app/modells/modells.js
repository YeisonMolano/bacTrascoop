const KeyGeneratorUno = require('../keygenerator');
const kg = new KeyGeneratorUno();

class NewUser{
    
    constructor(name, lastName, email, tellphone, username, password, auth){
        this.name = name;
        this.lastName = lastName;
        this.privateKey = kg.publicKey;
        this.publicKey = kg.privateKey;
        this.email = email;
        this.tellphone = tellphone;
        this.username = username;
        this.password = password;
        this.auth = auth;
    }
}

class CarnetIntermunicipal {

    constructor(nombre, apellido, tipoUsuario, tipoCarnet, fechaNacimiento, status, img1, img2, img3){
        this.username = nombre
        this.apellido = apellido
        this.tipoUsuario = tipoUsuario
        this.tipoCarnet = tipoCarnet
        this.fechaNacimiento = fechaNacimiento
        this.status = status
        this.img1 = img1
        this.img2 = img2
        this.img3 = img3
    }
}

class TaxiService {
    constructor(servicio, placeDeparture, destinationPlace, time, status){
        this.servicio = servicio
        this.placeDeparture = placeDeparture
        this.destinationPlace = destinationPlace
        this.time = time
        this.status = status
    }
}

class User{
    constructor(name, lastName, password, userType){
        this.name = name
        this.lastName = lastName
        this.password = password
        this.userType = userType
    }
}

module.exports.CarnetIntermunicipal = CarnetIntermunicipal;
module.exports.TaxiService = TaxiService;
module.exports.User = User;
module.exports.NewUser = NewUser;