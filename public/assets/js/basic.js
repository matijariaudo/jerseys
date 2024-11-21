function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    function ajax(url,json_dat,callback,error=function(e) {console.log("ERRROR",e)}){
            let token="Bearer"
            if(json_dat?.token){
                token=`Bearer ${json_dat.token}`
            }
            console.log(url,`Bearer ${json_dat.token}`)
            //console.log("token",token)
            $.ajax({url,type:"POST",headers: {"Content-Type": "application/json","Authorization": token},dataType : 'json',data: JSON.stringify(json_dat),success: function(data, textStatus, jqXHR){console.log(data),callback(data)},error: function( jqXHR, textStatus, errorThrown ) {console.log("!!!!!!!!!"),error(jqXHR.responseJSON);}});
    }
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function capa(i) {
        $(".capa").hide();
        $(".capa_"+i).show()
    }
    
    function seccion(name,i){
        $(`.${name}`).hide();
        $(`.${name}_${i}`).show();
    }
    
    $(window).on('load',()=>{
        
    
        const token=getParameterByName("token")
        console.log("TOKEN",token)
        if(token){
            var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: newUrl }, '', newUrl);
            checktoken(token)
        }else{
            user=JSON.parse(localStorage.getItem("user")|| "{}")
            if(user.token){
                checktoken(user.token)
            }else{
                localStorage.removeItem("user");
                checkPromo();
            }
        }
    });

    function checktoken(token){
        env={token};
        ajax("/api/users/check",env,(d)=>{
            const e=d.data;
            localStorage.setItem("user",JSON.stringify(e))
            user=JSON.parse(localStorage.getItem("user")|| "{}")
            $(".user").show();
            $(".no_user").hide()
            $(".user_name").html(user.user.name)
            $(".user_email").html(user.user.email)
        },(d)=>{
            $(".user").hide();
            $(".no_user").show()
            localStorage.removeItem("user");
            location.href=location.href;
            //analisis_error(d)
            return;
        })
    }

    $(".btn-close-session").on("click",function () { 
        localStorage.removeItem("user");
        $(".user").hide();
        $(".no_user").show();
        location.href=location.href;
    });

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function checkPromo(){
        const codePromotion=getParameterByName('code');
        if(codePromotion){
            localStorage.setItem("promotion",codePromotion)
            localStorage.setItem("promotion_n",0)   
        }
        promotionN=localStorage.getItem("promotion_n")
        if(!promotionN){return true;}
        if(promotionN==0){insert_modal();$('#myModal').modal('show');$(".code_show").html(localStorage.getItem("promotion"))}
        promotionN==3?promotionN=0:promotionN++;
        localStorage.setItem("promotion_n",promotionN); 
    }

    function insert_modal(){
        $("body").append(`
            <!-- Modal -->
            <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header" style="border:0px">
                    <h5 class="modal-title" id="myModalLabel">Congratulations</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="color:#FFF"></button>
                </div>
                <div class="modal-body">
                    You have received a gift of <b style='font-size:1.2em'>10 AUD</b> with the code "<b class="code_show"></b>", register now to get it.
                </div>
                <div class="modal-footer" style="border:0px">
                    <button type="button" onclick="location.href='/register'" class="btn btn-green" data-bs-dismiss="modal">Log In now</button>
                </div>
                </div>
            </div>
            </div>
        `);
    }

    const convertImgUrl=(url)=>{
        const partUrl=url.split("/");
        const tamano=partUrl.length;
        const fileName = partUrl[tamano-3]+"-"+partUrl[tamano-2]+"-"+partUrl[tamano-1];
        return fileName;
    }