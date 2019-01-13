var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var { getUserProfile } = require('./services/userProfile');

var app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// configurar el puerto y el mensaje en caso de exito
app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook'));

// Ruta de la pagina index
app.get("/", function (req, res) {
    res.send("Se ha desplegado de manera exitosa ");
});

// Facebook Webhook

// Usados para la verificacion
app.get("/webhook", function (req, res) {
    // Verificar la coincidendia del token
    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        // Mensaje de exito y envio del token requerido
        console.log("webhook verificado!");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        // Mensaje de fallo
        console.error("La verificacion ha fallado, porque los tokens no coinciden");
        res.sendStatus(403);
    }
});

// Todos eventos de mesenger sera apturados por esta ruta
app.post("/webhook", function (req, res) {
    // Verificar si el vento proviene del pagina asociada
    if (req.body.object == "page") {
        // Si existe multiples entradas entraas
        req.body.entry.forEach(function (entry) {
            // Iterara todos lo eventos capturados
            entry.messaging.forEach(function (event) {
                if (event.message) {
                    process_event(event);
                }
            });
        });
        res.sendStatus(200);
    }
});


// Funcion donde se procesara el evento
async function process_event(event) {
    // Capturamos los datos del que genera el evento y el mensaje 
    var senderID = event.sender.id;
    var message = event.message;
    console.log(event);
    console.log(JSON.stringify(event.message.nlp.entities, null, 2));
    // Si en el evento existe un mensaje de tipo texto
    if (message.text) {
        // Crear un payload para un simple mensaje de texto
        let userQuery = await getUserProfile(senderID);
        let { first_name: name } = userQuery;
        var response = {
            "text": `Hola ${name}`
        }
        // var response = {
        //     "text": "¿En que puedo ayudarte?",
        //     "quick_replies": [
        //         {
        //             "content_type": "text",
        //             "title": "Buscar Precio",
        //             "payload": "PRECIO",
        //         },
        //         {
        //             "content_type": "text",
        //             "title": "Conocer Disponiblidad",
        //             "payload": "DISP",
        //         },
        //         {
        //             "content_type": "text",
        //             "title": "Agendar",
        //             "payload": "AGENDAR",
        //         },
        //     ]
        // }
    }

    // Enviamos el mensaje mediante SendAPI
    enviar_texto(senderID, response);
}

// Funcion donde el chat respondera usando SendAPI
function enviar_texto(senderID, response) {
    // Construcicon del cuerpo del mensaje
    requestAPI({
        "recipient": {
            "id": senderID
        },
        "sender_action": "typing_on"
    });
    setTimeout(()=>{
        requestAPI({
            "recipient": {
                "id": senderID
            },
            "message": response,
            "persona_id": "304755253486673"
        });
    },1000);
}



function requestAPI(request_body){
    // Enviar el requisito HTTP a la plataforma de messenger
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Mensaje enviado!')
        } else {
            console.error("No se puedo enviar el mensaje:" + err);
        }
    });
}