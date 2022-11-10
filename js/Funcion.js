var PersonaDB; //base de datos "Persona"

$(document).ready((event) => {
    // recupero la peticion de apertura de la base de datos
    AbrirPersona().onsuccess = function (event) {

        PersonaDB = event.target.result;

        // funcion para cargar los datos del almacen "Persona"
        CargarPersona();

        // pido los almacenes en modo de escritura y lectura
        let TipoDocumento = PersonaDB.transaction("TipoDocumento", "readwrite").objectStore("TipoDocumento");

        // pido todos los datos que tiene elalmacen "TipoDocumento"
        TipoDocumento.getAll().onsuccess = function (event) {

            let html = "";

            // Recorro el resultado y lo añado a un <select>
            event.target.result.forEach((e, i) => {
                html += "<option value='" + e.iTipoDocumento + "'>" + e.sDescrip + "</option>";
            });

            $("#iTipoDocumento").html(html);

        }
    }
});

$("#nueva-persona").click((event) => {
    LimpiarModal("Modal-Persona");
    $("#Modal-Persona").modal("show");
});

$("#btn-Aceptar").click((event) => {

    if (!$("#frm-Persona").valid()) return;

    // armo un objeto con la informacion del formulario
    let dato = { sNombre: $("#sNombre").val(), iTipoDocumento: parseInt($("#iTipoDocumento").val()), sDocumento: $("#sDocumento").val(), dFechaN: $("#dFechaN").val() };

    let Persona = PersonaDB.transaction("Persona", "readwrite").objectStore("Persona");

    // si tiene iPersona modifica si no crea
    if ($("#iPersona").val() != "") {

        Persona.get(parseInt($("#iPersona").val())).onsuccess = function (event) {

            dato.iPersona = event.target.result.iPersona;

            Persona.put(dato).onsuccess = function (event) {
                CargarPersona();

                toastr.success("Exito", "Modificacion Exitosa");

            };

        };

    } else {

        Persona.add(dato).onsuccess = function (event) {
            CargarPersona();

            toastr.success("Exito", "Registro Correcto");
        };

    }

    $("#Modal-Persona").modal("hide");
    LimpiarModal("Modal-Persona");

});

function LimpiarModal(idModal) {
    $("#" + idModal + " input, #" + idModal + " select").val("");
}

// funcion para cargar los datos del almacen "Persona"
function CargarPersona() {
    let TipoDocumento = PersonaDB.transaction("TipoDocumento", "readonly").objectStore("TipoDocumento");

    // obtengo la tabla donde pondre los datos
    let tabla = $("#tb_Persona");

    // vacio la tabla
    tabla.html("");

    // obtengo todos los "TipoDocumento" antes de consultar las "Persona" 
    TipoDocumento.getAll().onsuccess = function (event) {
        let TipoDoc = event.target.result; //guardo en una variable los "TipoDocumento" para buscar en la variable en ves del almacen

        let Persona = PersonaDB.transaction("Persona", "readonly").objectStore("Persona");

        // consulto las Personas
        Persona.openCursor().onsuccess = function (event) {
            let cursor = event.target.result

            if (cursor) {

                // busco en el array de "TipoDocumento" para que coincidan los valores con los que estan guardados en "Persona"
                let html = `
                    <tr>
                        <td>${TipoDoc.find((value) => { return value.iTipoDocumento == cursor.value.iTipoDocumento }).sDiminutivo}</td>
                        <td>${cursor.value.sDocumento}</td>
                        <td>${cursor.value.sNombre}</td>
                        <td>${moment(cursor.value.dFechaN).format("DD/MM/YYYY")}</td>
                        <td><button class="btn btn-warning btn-block" onclick="DatosModificar(${cursor.value.iPersona})"><i class="fas fa-user-edit"></i></button></td>
                        <td><button class="btn btn-danger btn-block" onclick="Eliminar(${cursor.value.iPersona})"><i class="fas fa-trash-alt"></i></button><td>
                    </tr>
                `;

                // añado a la tabla
                tabla.append(html);

                cursor.continue();

            }
        }

    };

}

// funcion para obtener los datos del registro que se va a modificar
function DatosModificar(iPersona) {

    let Persona = PersonaDB.transaction("Persona", "readonly").objectStore("Persona");

    Persona.get(iPersona).onsuccess = function (event) {

        let datos = event.target.result;

        $("#iPersona").val(datos.iPersona);
        $("#iTipoDocumento").val(datos.iTipoDocumento);
        $("#sDocumento").val(datos.sDocumento);
        $("#sNombre").val(datos.sNombre);
        $("#dFechaN").val(datos.dFechaN);

        $("#Modal-Persona").modal("show");

    };

}

// funcion para eliminar un registro
function Eliminar(iPersona) {
    if (!confirm("Esta seguro de eliminar este registro")) return;

    let Persona = PersonaDB.transaction("Persona", "readwrite").objectStore("Persona");

    Persona.delete(iPersona).onsuccess = function (event) {

        CargarPersona();

        toastr.success("Exito", "Registro eliminado");

    }
}