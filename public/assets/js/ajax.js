function ajax(url,json_dat,callback,error=function(e) {console.log("ERRROR",e)}){
    let token="Bearer"
    if(json_dat?.token){
        token=`Bearer ${json_dat.token}`
    }
    console.log(url,`Bearer ${json_dat.token}`)
    //console.log("token",token)
    $.ajax({url,type:"POST",headers: {"Content-Type": "application/json","Authorization": token},dataType : 'json',data: JSON.stringify(json_dat),success: function(data, textStatus, jqXHR){console.log(data),callback(data)},error: function( jqXHR, textStatus, errorThrown ) {console.log("!!!!!!!!!"),error(jqXHR.responseJSON);}});
}

const convertImgUrl=(url)=>{
    const partUrl=url.split("/");
    const tamano=partUrl.length;
    const fileName = partUrl[tamano-3]+"-"+partUrl[tamano-2]+"-"+partUrl[tamano-1];
    return fileName;
}

function errorImg(e,url){
    if(e.attr("src").indexOf("assets")>-1){
        console.log(url)
        e.attr("src",`/api/products/image?url=${url}`)
    }
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', ''); // Remueve la coma entre fecha y hora
}

function capa(i) {
    $(".capa").hide();
    $(".capa_"+i).show();
    $(".menu").css("border-color","#424242");
    $(".menu_"+i).css("border-color","#B9FF00");
    $(".menu").css("color","#FFF");
    $(".menu_"+i).css("color","#B9FF00");
    $(".menu2").css("color","#FFF");
    $(".menu2_"+i).css("color","#B9FF00");
    //$('html, body').animate({ scrollTop: 0 }, 'slow');
}

function seccion(name,i){
    $(`.${name}`).hide();
    $(`.${name}_${i}`).show();
}

function convertImgUrl1(url){
    const partUrl=url.split("/");
    const tamano=partUrl.length;
    const fileName = partUrl[tamano-3]+"-"+partUrl[tamano-2]+"-"+partUrl[tamano-1];
    return fileName;
}

function errorImg(e,url){
    if(e.attr("src").indexOf("assets")>-1){
        console.log(url)
        e.attr("src",`/api/products/image?url=${url}`)
    }
}

function getRandomInt(max) {
return Math.floor(Math.random() * max);
}
