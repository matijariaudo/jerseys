let teamData;
$(".club_menu").html("");$(".nba_menu").html("");


ajax('/api/categories',{},(e)=>{
    const {categories:categoriesObj,teams:teamsObj}=e.data;
    localStorage.setItem('categoriesObj',JSON.stringify(categoriesObj))
    localStorage.setItem('teamsObj',JSON.stringify(teamsObj))
    print_cat_teams(categoriesObj,teamsObj)
})

function cleanWomenRetro(){
    localStorage.removeItem("retro");
    localStorage.removeItem("women");
}


//$(".nba_menu").parent().hide();
$("#select4").html("<option>AUD</option>");
$("#select4").hide();
$("#select5").hide();
$("[href='/contact']").parent().hide()

printed=false;
function print_cat_teams(categoriesObj,teamsObj){
    if(printed){return false;}
    printed=true
    categories= Object.keys(categoriesObj);
    teams=Object.keys(teamsObj);
    teams=teams.sort().map(a=>{return {team:a,link:teamsObj[a],sport:categoriesObj[teamsObj[a]]}})
    teamData=teams;
    $("#seach-input").on("keyup",function(){
        $("#seach-div").html("")
        if($(this).val().length>2){
        teamData.forEach(e => {
            if(e.team.toLowerCase().indexOf($(this).val().toLowerCase())>-1){
                $("#seach-div").append(`<div  onclick="cleanWomenRetro();location.href='/products/${e.sport.toLowerCase().replaceAll(' ','')}/${e.link.toLowerCase().replaceAll(' ','')}/${e.team.toLowerCase().replaceAll(' ','')}'" class="list-group-item list-group-item-action" style="cursor:pointer"><p class="mb-0" style="font-size:.8em">${e.sport}/${e.link}</p><h6>${e.team}</h6></div>`)
            }
        });
        }
    })
    $(".national_menu").html(`<li class="nav-item"><input style="border:0px" placeholder="Busca aqui"></li>`)
    $(".national_menu").html(``)
    $(".national_menu").append(`<li class="nav-item" onclick="cleanWomenRetro();"><a href="/products/soccer/nationalteams"><img src="assets/images/logos/teams/otherteams.png" alt="" style="height: 25px;"> Ver todos</a></li>`)
    qty=0;
    teams.filter(a=>a.link=='National teams').forEach((e,i) => {
        $(".national_menu").append(`<li class="nav-item " style="border:1px solid #e8e8e8;border-width:1px 0px 0px 0px;padding-top:10px"  onclick="cleanWomenRetro();"><a href="/products/soccer/nationalteams/${e.team.toLowerCase().replaceAll(" ","")}" class="notranslate"><img src="assets/images/logos/teams/${e.team.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 25px;"> ${e.team}</a></li>`)
        $("#menu_mobile_nation").append(`
            <div onclick="cleanWomenRetro();location.href='/products/soccer/nationalteams/${e.team.replaceAll(" ","")}'" style="cursor:pointer;width: 110px;height: 90px;float: left;margin-right: 10px;border-radius: 10px;border: 1px solid #f6f6f6;text-align: center;padding-top: 10px;">
                <img src="assets/images/logos/teams/${e.team.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 40px;">
                <p class="notranslate">${e.team}</p>
            </div>
            `);
        qty=i;
    });
    $("#menu_mobile_nation").css("width",`${(qty+1)*121}px`)
    html_menu_final="";html_mobile_final="";
    categories.filter(a=>a!=='National Teams' && categoriesObj[a].toLowerCase()=='soccer').forEach((e,i) => {
        html_mobile=`
            <div onclick="cleanWomenRetro();location.href='/products/soccer/${e.toLowerCase().replaceAll(" ","")}'" style="cursor:pointer;width: 110px;height: 90px;float: left;margin-right: 10px;border-radius: 10px;border: 1px solid #f6f6f6;text-align: center;padding-top: 10px;">
                <img src="assets/images/logos/teams/${e.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 40px;">
                <p>${e}</p>
            </div>`
        html_menu=`<li class="nav-item" style="border:1px solid #e8e8e8;border-width:0px 0px 1px 0px;padding-bottom:10px"  onclick="cleanWomenRetro();"><a href="/products/soccer/${e.toLowerCase().replaceAll(" ","")}"><img src="assets/images/logos/teams/${e.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 25px;"> ${e}</a></li>`
        console.log(e)
        if(e.toLowerCase()=="national teams" || e.toLowerCase()=="other teams"){
            html_menu_final+=html_menu;
            html_mobile_final+=html_mobile;
        }else{
            $(".club_menu").append(html_menu)
            $("#menu_mobile_club").append(html_mobile);
        }
        qty=i;
    });
    teams.filter(a=>a.link=='Nba').forEach((e,i) => {
        $(".nba_menu").append(`<li class="nav-item notranslate" style="border:1px solid #e8e8e8;border-width:0px 0px 1px 0px;padding-top:10px" onclick="cleanWomenRetro();"><a href="/products/basketball/nba/${e.team.toLowerCase().replaceAll(" ","")}"><img src="assets/images/logos/teams/${e.team.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 25px;"> ${e.team}</a></li>`)
    })
    $(".club_menu").append(html_menu_final)
    $("#menu_mobile_club").append(html_mobile_final);
    $("#menu_mobile_club").css("width",`${(qty+1)*121}px`);
}


categoriesObjSaved=localStorage.getItem('categoriesObj')
teamsObjSaved=localStorage.getItem('teamsObj')
if(teamsObjSaved){
    print_cat_teams(JSON.parse(categoriesObjSaved),JSON.parse(teamsObjSaved))
}