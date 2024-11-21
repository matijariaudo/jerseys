sports=['Basketball','Soccer'];
categories=[
    {category:'National teams',link:'Soccer'},
    {category:'Italy',link:'Soccer'},
    {category:'France',link:'Soccer'},
    {category:'Germany',link:'Soccer'},
    {category:'England',link:'Soccer'},
    {category:'Spain',link:'Soccer'},
    {category:'America',link:'Soccer'},
];
teams=[
    {team:'Juventus',link:'Italy'},
    {team:'Inter',link:'Italy'},
    {team:'Milan',link:'Italy'},
    {team:'Boca',link:'America'},
    {team:'Argentina',link:'National teams'},
    {team:'Brazil',link:'National teams'},
    {team:'Colombia',link:'National teams'},
    {team:'Chile',link:'National teams'},
    {team:'Uruguay',link:'National teams'},
]

$(".club_menu").html("")
ajax('/api/categories',{},(e)=>{
    const {categories:categoriesObj,teams:teamsObj}=e.data;
    categories= Object.keys(categoriesObj);
    console.log(categories);
    teams=Object.keys(teamsObj);
    teams=teams.sort().map(a=>{return {team:a,link:teamsObj[a]};})
    $(".national_menu").html(`<li class="nav-item"><a href="/products/soccer/nationalteams"><img src="assets/images/logos/teams/otherteams.png" alt="" style="height: 25px;"> See all nations</a></li>`)
    qty=0;
    teams.filter(a=>a.link=='National Teams').forEach((e,i) => {

        $(".national_menu").append(`<li class="nav-item" style="border:1px solid #e8e8e8;border-width:1px 0px 0px 0px;padding-top:10px"><a href="/products/soccer/nationalteams/${e.team.toLowerCase().replaceAll(" ","")}"><img src="assets/images/logos/teams/${e.team.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 25px;"> ${e.team}</a></li>`)
        $("#menu_mobile_nation").append(`
            <div onclick="location.href='/products/soccer/nationalteams/${e.team.replaceAll(" ","")}'" style="cursor:pointer;width: 110px;height: 90px;float: left;margin-right: 10px;border-radius: 10px;border: 1px solid #f6f6f6;text-align: center;padding-top: 10px;">
                <img src="assets/images/logos/teams/${e.team.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 40px;">
                <p>${e.team}</p>
            </div>
            `);
        qty=i;
    });
    $("#menu_mobile_nation").css("width",`${(qty+1)*121}px`)
    html_menu_final="";html_mobile_final="";
    categories.filter(a=>a!=='National Teams').forEach((e,i) => {
        html_mobile=`
            <div onclick="location.href='/products/soccer/${e.toLowerCase().replaceAll(" ","")}'" style="cursor:pointer;width: 110px;height: 90px;float: left;margin-right: 10px;border-radius: 10px;border: 1px solid #f6f6f6;text-align: center;padding-top: 10px;">
                <img src="assets/images/logos/teams/${e.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 40px;">
                <p>${e}</p>
            </div>`
        html_menu=`<li class="nav-item" style="border:1px solid #e8e8e8;border-width:0px 0px 1px 0px;padding-bottom:10px"><a href="/products/soccer/${e.toLowerCase().replaceAll(" ","")}"><img src="assets/images/logos/teams/${e.toLowerCase().replaceAll(" ","")}.png" alt="" style="height: 25px;"> ${e}</a></li>`
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
    $(".club_menu").append(html_menu_final)
    $("#menu_mobile_club").append(html_mobile_final);
    $("#menu_mobile_club").css("width",`${(qty+1)*121}px`)
})




$(".nba_menu").parent().hide();
$("#select4").html("<option>AUD</option>");
$("#select4").hide();
$("#select5").hide();
$("[href='/contact']").parent().hide()