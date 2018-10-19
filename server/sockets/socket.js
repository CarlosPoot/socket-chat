const { io } = require('../server');
const { Usuarios } = require('../clases/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');


const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on( 'entrarChat' , (usuario, callback ) =>{
        console.log(usuario);
        if( !usuario.nombre  || !usuario.sala ){
            return callback({
                error: true,
                mensaje : "El nombre y la sala son necesarios"
            });
        }

        client.join(usuario.sala);
        usuarios.agregarPersona( client.id , usuario.nombre , usuario.sala );
        client.broadcast.to(usuario.sala).emit( 'listaPersonas' , usuarios.getPersonasPorSala( usuario.sala ));
        callback( usuarios.getPersonasPorSala( usuario.sala  ));// porque el usuario que emite el mensaje oviamente no recibe la lista emitida arriba
    });

    client.on('disconnect' , ()=>{

        let personaBorrada = usuarios.borrarPersona( client.id );
        client.broadcast.to(personaBorrada.sala).emit( 'crearMensaje' ,crearMensaje('Administrador', `${ personaBorrada.nombre }  abandono el chat`) );
        client.broadcast.to(personaBorrada.sala).emit( 'listaPersonas' , usuarios.getPersonasPorSala(  personaBorrada.sala ));

    });


    client.on('crearMensaje', ( data )=>{
        let usuario = usuarios.getPersona(  client.id );
        let mensaje = crearMensaje( usuario.nombre , data.mensaje );
        client.broadcast.to(usuario.sala).emit( 'crearMensaje' , mensaje );
    })


    client.on('mensajePrivado' , data =>{
        let persona = usuarios.getPersona( client.id );
        client.broadcast.to( persona.sala ).emit( 'mensajePrivado',  crearMensaje(persona.nombre , data.mensaje) );

    });

});