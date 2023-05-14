const express = require('express')
const multer = require('multer')
const app = express()

class Images{
    constructor(){

    }

    storage = multer.diskStorage({
        filename: function(res, file, cb){
            const ext = file.originalname.split('.').pop()
            const fileName = Date.now()
            console.log('hola');
            cb(null, `${fileName}.${ext}`)
        },
        destination: function(res, file, cb){
            cb(null, `src/files/images`)
        }
    })

    //Update Image
    updateImage = multer.diskStorage({
        filename: function(res, file, cb){
            cb(null, file.originalname)
        },
        destination: function(res, file, cb){
            cb(null, `src/files/images`)
        }
    })
}

module.exports = Images