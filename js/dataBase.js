// Constantes para el manejo de la base de datos
const DATA_BASE = "Persona";
const DATA_BASE_VERSION = 1;

function AbrirPersona() {
    // abriendo o creando la base de datos

    if (!window.indexedDB) {
        alert("navegador no compatible con indexedDB");
    }

    var PersonaDB = indexedDB.open(DATA_BASE, DATA_BASE_VERSION);

    PersonaDB.onupgradeneeded = function (event) {
        let db = event.target.result;

        // estructura del alamacen Persona

        // iPersona: int Primary key autoIncrement
        // sDocumento: string index unique
        // iTipoDocumento: int index not unique
        // sNombre: string index not unique
        // dFechaN: date

        // creo el almacen "Persona" con clave primaria y autoincrementable "iPersona"
        let Persona = db.createObjectStore("Persona", { keyPath: "iPersona", autoIncrement: true });

        // creo un index unique en la propiedad "sDocumento"
        Persona.createIndex("sDocumento", "sDocumento", { unique: true });

        // creo un index not unique en la propiedad "iTipoDocumento"
        Persona.createIndex("iTipoDocumento", "iTipoDocumento", { unique: false });

        // creo un index not unique en la propiedad "sNombre"
        Persona.createIndex("sNombre", "sNombre", { unique: false });



        // estructura del almacen TipoDocumento

        // iTipoDocumento: int primary key autoIncrement
        // sDescrip: string index not unique
        // sDiminutivo: string

        // creo el almacen "TipoDocumento" con clave primaria y autoincrementable "TipoDocumento"
        let TipoDocumento = db.createObjectStore("TipoDocumento", { keyPath: "iTipoDocumento", autoIncrement: true });

        // creo un index not unique en la propiedad "sDescrip"
        TipoDocumento.createIndex("sDescrip", "sDescrip", { unique: false });

        // cuando se cree el almacen le añado unos datos base si el almacen esta vacio
        TipoDocumento.transaction.oncomplete = function (event) {
            let TipoDocumento = db.transaction("TipoDocumento", "readwrite").objectStore("TipoDocumento");

            let datos = [
                { sDescrip: "Cédula de Ciudadanía", sDiminutivo: "CC" },
                { sDescrip: "Cédula de Extranjería", sDiminutivo: "CE" },
                { sDescrip: "Tarjeta de Identidad", sDiminutivo: "TI" },
                { sDescrip: "Registro Civil", sDiminutivo: "RC" }
            ];

            TipoDocumento.getAll().onsuccess = function (event) {

                if (event.target.result.length == 0) {
                    datos.forEach((e, i) => {
                        TipoDocumento.add(e);
                    });
                }

            }

        }

    }

    return PersonaDB;
}
