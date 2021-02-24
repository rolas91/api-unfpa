let token;
let userId;
const URL = "https://api-unfpa.herokuapp.com"
$(document).ready(function(){
    getData();

    $('#showp1').on('click', function() {
        $('#showp1').attr('src', function(index, attr) {
            return attr == '/static/img/eye.png' ? '/static/img/invisible.png' : '/static/img/eye.png';
        })
        $('#pass1').attr('type', function(index, attr) {
          return attr == 'text' ? 'password' : 'text';
        })
    });
    $('#showp2').on('click', function() {
        $('#showp2').attr('src', function(index, attr) {
            return attr == '/static/img/eye.png' ? '/static/img/invisible.png' : '/static/img/eye.png';
        })
        $('#pass2').attr('type', function(index, attr) {
          return attr == 'text' ? 'password' : 'text';
        })
    });

    $('#login').on('click', function(e){
        e.preventDefault()
        let url = `${URL}/api/v1/auth/login` 

        let email = $('#email').val();
        let password = $('#pass1').val();
        const data = {
            email:email,
            password:password,
            typeAuth:"email",
            typeUser:"admin"
        }

        fetch(url,{
            method:'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'              
            }
        })
        .then(response => {
           return {
               code:response.status,
               response:response.json()
           }
        })
        .then(async(data) => {                     
            if(data.code == 401){
                let message = Object.values(await data.response)                
                $('#message').html(message[0]);             
            }else{
                let token = Object.values(await data.response)                 
                localStorage.setItem('token', token[0]);
                location.href = '/dashboard';
            }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });

    $('#close').on('click', function(e){
        e.preventDefault();
        localStorage.removeItem('token')
        location.href = '/'
    });

    
    function getData(){
        let url = `${URL}/api/v1/create/report`
        // let url = `http://localhost:7000/api/v1/create/report`
        fetch(url,{
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
                'token':localStorage.getItem('token')            
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.response){
                $('#table_id').DataTable({
                    dom: 'Blfrtip', 
                    buttons: [
                        {
                            extend: 'pdfHtml5',
                            orientation: 'landscape',
                            pageSize: 'LEGAL',
                            title:'Reporte Appsistencia Materna'
                        },   
                        {
                            extend:'excelHtml5',
                            title:'Reporte Appsistencia Materna'
                        },                     
                        {
                            extend:'csvHtml5',
                            title:'Reporte Appsistencia Materna'
                        },                     
                        {
                            extend:'copyHtml5',
                            title:'Reporte Appsistencia Materna'
                        }                 

                    ],        
                    data:data.response,
                    columns:[
                        {data:'Código'},
                        {data:'FechaConsulta'},
                        {data:'HoraConsulta'},
                        {data:'Nombre'},
                        {data:'Apellido'},
                        {data:'NoCédula'},
                        {data:'Edad'},   
                        {data:'Antecedentespatológicos'},
                        {data:'TratamientosRecibidos'},
                        {data:'ObservacionesMédicas'},
                        {data:'SemanasGestación'},
                        {data:'ReporteMovimientoFetales'},
                        {data:'ArOBro'},
                        {data:'RazónPrincipaldelaConsulta'},
                        {data:'Diagnóstico'},
                        {data:'Planes'},
                        {data:'OtrosComentarios'},                     
                        {data:'Medico'},
                        {data:'NotasMédicas'},
                        {data:'CitaCancelada'}
                        
                    ],
                    language: {
                        "decimal": "",
                        "emptyTable": "No hay información",
                        "info": "Mostrando _START_ a _END_ de _TOTAL_ Documentos",
                        "infoEmpty": "Mostrando 0 to 0 of 0 Documentos",
                        "infoFiltered": "(Filtrado de _MAX_ total entradas)",
                        "infoPostFix": "",
                        "thousands": ",",
                        "lengthMenu": "Mostrar _MENU_ Documentos",
                        "loadingRecords": "Cargando...",
                        "processing": "Procesando...",
                        "search": "Buscar:",
                        "zeroRecords": "Sin resultados encontrados",
                        "paginate": {
                            "first": "Primero",
                            "last": "Ultimo",
                            "next": "Siguiente",
                            "previous": "Anterior"
                        }
                    },
                    "columnDefs": [
                        {
                            //render: $.fn.dataTable.render.moment( 'DD/MM/YYYY HH:mm' )
                            "render": function(data) {
                            return moment(data).format('DD/MM/YYYY');
                            },
                            "targets": 1
                        },
                        {
                            "render": function (data, type, row) {
                                return (data === 1) ? '<span style="color:#fff; background:red; padding:5px; border-radius:3px;">Cancelada</span>' : '<span style="color:#fff; background:green; padding:5px; border-radius:3px;">Realizado</span>';
                            },
                            "targets": 19
                        }
                    ]
                });
            }
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    
    }


});

