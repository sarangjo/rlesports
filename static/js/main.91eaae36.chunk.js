(this.webpackJsonpundefined=this.webpackJsonpundefined||[]).push([[0],{127:function(e,t,n){e.exports=n(134)},132:function(e,t,n){},134:function(e,t,n){"use strict";n.r(t);var a,r,c=n(1),o=n.n(c),i=n(68),u=n.n(i),l=(n(132),n(6)),s=n(0),m=n(69),f=n(70),d=n(3),b=n(8),O=n(5),E=n.n(O),y=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.join("-")},j=(b.d().x((function(e){return e[0]})).y((function(e){return e[1]})).curve(b.a),function(e){return Object(s.reduce)(e,(function(e,t,n){return Object(s.concat)(e,Object(s.reduce)(t.teams,(function(e,t,a){return Object(s.concat)(e,Object(s.reduce)(t.players,(function(e,t,r){return Object(s.concat)(e,{tournamentIndex:n,teamIndex:a,playerIndex:r,id:y(n,a,r),x:0,y:p({tournamentIndex:n,teamIndex:a,playerIndex:r,id:y(n,a,r)})})}),[]))}),[]))}),[])}),h=function(e,t){return e[t.tournamentIndex].teams[t.teamIndex].players[t.playerIndex]},p=function(e){return g(e.teamIndex,e.playerIndex)},g=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:4;return 10*a+e*n*20+20*t},v=function(e){return e.replaceAll(/[^A-Z0-9/]/g,"").replaceAll("/"," ")};!function(e){e.SANKEY="sankey",e.TEAM_MAP="team-map",e.FORCE_GRAPH="force-graph",e.SIMPLE="simple",e.TABLE="table",e.TEXT="text",e.TIMELINE="timeline"}(r||(r={}));var x=(a={},Object(d.a)(a,r.SANKEY,"Sankey"),Object(d.a)(a,r.TEAM_MAP,"Team Map"),Object(d.a)(a,r.FORCE_GRAPH,"Force Graph"),Object(d.a)(a,r.SIMPLE,"Simple"),Object(d.a)(a,r.TABLE,"Table"),Object(d.a)(a,r.TEXT,"Text"),Object(d.a)(a,r.TIMELINE,"Timeline"),a),I=function(e){return E()(e,"YYYY-MM-DD").toDate()},k=function(e,t){return e in t?t[e]:"#232323"},A=function(){function e(t,n){var a=this;Object(m.a)(this,e),this.dateDiffs=void 0,this.totalDiff=0,this.domain=void 0,this.range=void 0,this.dateDiffs=Object(s.map)(t,(function(e){var t=E()(e[1]).diff(E()(e[0]),"days");return a.totalDiff+=t,t})),this.domain=t,this.range=n}return Object(f.a)(e,[{key:"convert",value:function(e){var t=this,n=this.range[0];return Object(s.some)(this.domain,(function(a,r){var c=t.dateDiffs[r]/t.totalDiff*(t.range[1]-t.range[0]);if(a[0]<=e&&e<=a[1]){var o=E()(e).diff(E()(a[0]),"days");return n+=o/t.dateDiffs[r]*c,!0}n+=c})),n}}]),e}(),T=function(e,t){var n=Object(s.find)(e,(function(e){return e.name.toLowerCase()===t.toLowerCase()}));return n||(n=Object(s.find)(e,(function(e){return!!Object(s.find)(e.alternateIDs,(function(e){return e.toLowerCase()===t.toLowerCase()}))})))?n:(console.log("Uh, didn't find a player... weird.",t),null)};function N(e,t){return Object(s.reduce)(e,(function(e,n){var a=Object(s.reduce)(n.sections,(function(e,n){return Object(s.concat)(e,Object(s.map)(n.tournaments,(function(e){return t(e)})))}),[]);return Object(s.concat)(e,a)}),[])}function w(e){var t=function(e){return 4===(e=e||"#fff").length?{r:parseInt(e[1]+e[1],16),g:parseInt(e[2]+e[2],16),b:parseInt(e[3]+e[3],16)}:5===e.length?{r:parseInt(e[1]+e[1],16),g:parseInt(e[2]+e[2],16),b:parseInt(e[3]+e[3],16),a:parseInt(e[4]+e[4],16)}:7===e.length?{r:parseInt(e[1]+e[2],16),g:parseInt(e[3]+e[4],16),b:parseInt(e[5]+e[6],16)}:{r:0,g:0,b:0}}(e);return.299*t.r+.587*t.g+.114*t.b>186?"#000":"#fff"}var R=n(32),M=n(10),C=function(e){var t=function(e){return Object(s.map)(e,(function(t,n){if(0===n)return t;var a=e[n-1],r=Object(s.size)(a.teams),c=Object(s.map)(t.teams,(function(e,t){var n=Object(s.reduce)(a.teams,(function(t,n,a){return t+(a+1)*Object(s.size)(Object(s.intersection)(n.players,e.players))}),0)/Object(s.size)(e.players);return 0===n&&(n=r++),{originalIndex:t,newIndex:n}})),o=Object(s.sortBy)(c,["newIndex"]),i=[];return Object(s.forEach)(o,(function(e){i.push(Object(R.a)(Object(R.a)({},t.teams[e.originalIndex]),{},{metadata:JSON.stringify(e)}))})),t.teams=i,t}))}(e),n=j(e),a={};return Object(s.forEach)(t,(function(e,t){Object(s.forEach)(e.teams,(function(e,n){Object(s.forEach)(e.players,(function(e,r){e in a||(a[e]=[]),a[e].push({playerIndex:r,teamIndex:n,tournamentIndex:t,id:y(t,n,r)})}))}))})),{nodes:n,links:Object(s.reduce)(a,(function(e,t){for(var n=[],a=0;a<t.length-1;a++)n.push({source:t[a],target:t[a+1]});return Object(s.concat)(e,n)}),[])}};function L(e){var t=N(e.seasons,(function(e){return e})),n=Object(M.a)().domain([0,t.length]).range([160,1590]),a=function(e){var t=n(e.source.tournamentIndex),a=p(e.source),r=n(e.target.tournamentIndex),c=p(e.target),o=t+.5*(r-t),i=a+.5*(c-a);return"M ".concat(t," ").concat(a," C ").concat(o," ").concat(a,", ").concat(o," ").concat(a,", ").concat(o," ").concat(i," S ").concat(o," ").concat(c,", ").concat(r," ").concat(c)},r=C(t);return o.a.createElement("svg",{width:1600,height:1050},o.a.createElement("g",{id:"nodes"},Object(s.map)(r.nodes,(function(e){return o.a.createElement("g",{key:e.id},o.a.createElement("circle",{cx:n(e.tournamentIndex),cy:p(e),r:10}),o.a.createElement("text",{textAnchor:"end",x:n(e.tournamentIndex)-10-5,y:p(e)+5},h(t,e)))}))),o.a.createElement("g",{id:"links"},Object(s.map)(r.links,(function(e){return o.a.createElement("path",{key:"".concat(e.source.id,"-").concat(e.target.id),d:a(e),fill:"transparent",stroke:"black"})}))),o.a.createElement("g",{id:"tournament-titles"},Object(s.map)(t,(function(e,t){return o.a.createElement("text",{x:n(t),y:"1em",textAnchor:"middle",key:t},v(e.name))}))))}var P,S,D,Y=[{memberships:[{join:"2021-01-01",team:"Team 1"}],name:"Player 1"},{memberships:[{join:"2021-01-01",team:"Team 1"}],name:"Player 2"},{memberships:[{join:"2021-01-01",leave:"2021-02-15",team:"Team 1"},{join:"2021-02-16",team:"Team 2"}],name:"Player 3"},{memberships:[{join:"2021-01-01",leave:"2021-02-17",team:"Team 2"},{join:"2021-02-20",team:"Team 1"}],name:"Player 4"},{memberships:[{join:"2021-01-05",team:"Team 2"}],name:"Player 5"},{memberships:[{join:"2021-01-06",team:"Team 2"}],name:"Player 6"}];!function(e){e[e.NONE=0]="NONE",e[e.WORLD=1]="WORLD",e[e.NORTH_AMERICA=2]="NORTH_AMERICA",e[e.EUROPE=3]="EUROPE",e[e.OCEANIA=4]="OCEANIA",e[e.SOUTH_AMERICA=5]="SOUTH_AMERICA"}(P||(P={})),function(e){e.JOIN="join",e.LEAVE="leave"}(S||(S={}));var _=(D={},Object(d.a)(D,S.JOIN,4),Object(d.a)(D,S.LEAVE,6),D);function z(e){var t=e.seasons,n=e.players,a=e.teamColors;if(0===Object(s.size)(t))return o.a.createElement("div",null,"Loading...");var r=function(e){var t=0;return Object(s.reduce)(e,(function(e,n){var a={},r=t++;return n.name.toLowerCase()in e&&console.warn("ERROR ERROR DUPLICATE PLAYER!",n,"BUT WE PRIMARY SO WE BETTER!"),a[n.name.toLowerCase()]=r,Object(s.forEach)(n.alternateIDs,(function(t){t.toLowerCase()in e?console.error("ERROR ERROR DUPLICATE PLAYER!",n,"LEAVING IT IN!"):a[t.toLowerCase()]=r})),Object(s.assign)(e,a)}),{})}(n),c=function(e){return 100+2*e*10},i=function(e,t,n){return e.toLowerCase()in r?c(r[e.toLowerCase()]):null};console.log(Y);var u=null===n||void 0===n?void 0:n.reduce((function(e,t){var n,a;return!e||(null===(n=t.memberships[0])||void 0===n?void 0:n.join)<e?null===(a=t.memberships[0])||void 0===a?void 0:a.join:e}),""),l=null===n||void 0===n?void 0:n.reduce((function(e,t){var n,a=(null===(n=t.memberships)||void 0===n?void 0:n.length)>0&&t.memberships[t.memberships.length-1].leave||E()().format("YYYY-MM-DD");return!e||a>e?a:e}),"");if(console.log("start",u,"end",l),!u||!l)return o.a.createElement("b",null,"Somethin's wrong! start ",JSON.stringify(u)," or end ",JSON.stringify(l)," are undefined");var m=Object(M.b)().domain([I(u),I(l)]).range([75,1175]),f=function(e){var t=e.now;return o.a.createElement("text",{x:m(t.toDate()),y:10,transform:"rotate(90,".concat(m(t.toDate()),",").concat(10,")")},t.format("YYYY-MM-DD"))};function d(e){var t=e.tournament,a=m(I(t.start)),u=m(I(t.end))-m(I(t.start));return o.a.createElement("g",{key:t.name},o.a.createElement("rect",{x:a,y:0,width:u,height:c(Object(s.size)(r)),opacity:.2}),o.a.createElement("text",{x:a+u/2,y:100,transform:"rotate(90,".concat(a+u/2,",").concat(100,")")},v(t.name)),Object(s.reduce)(t.teams,(function(e,r){return Object(s.concat)(e,Object(s.map)(r.players,(function(e){var c=i(e);if(!Object(s.isNull)(c)){var l=T(n,e);if(l)Object(s.find)(l.memberships,(function(e){return e.join<=t.end&&(!e.leave||e.leave>=t.start)}))||console.error("couldn't find membership for",e,"for tournament",t.name,"and team",r.name);else console.error("couldn't find player, but found Y... weird",e);return o.a.createElement("rect",{key:e,x:a,y:c-5-1.5,width:u,height:13,opacity:.3,fill:"maroon"},o.a.createElement("title",null,e," * ",r.name))}console.error("couldn't find player",e)})))}),[]))}function b(e){var t=e.player,n=Object(s.reduce)(t.memberships,(function(e,n,r){var c=k(n.team,a),u=m(I(n.join)),s=i(t.name,0,S.JOIN),f=o.a.createElement("circle",{key:"".concat(t.name,"-join-").concat(r),id:"".concat(t.name,"-join-").concat(n.team),"data-date":n.join,cx:u,cy:s,r:_[S.JOIN],stroke:c,fill:c});if(e.push(0===r?o.a.createElement("g",{key:"playername"},f,o.a.createElement("text",{textAnchor:"end",x:u-10,y:s+5},t.name)):f),0!==r){var d=m(I(t.memberships[r-1].leave)),b=i(t.name,0,S.LEAVE);e.push(o.a.createElement("line",{key:"".concat(t.name,"-teamless-").concat(r),id:"".concat(t.name,"-teamless-").concat(r),x1:d,y1:b,x2:u,y2:s,stroke:"#bbbbbb"}))}var O=m(I(n.leave||l)),E=i(t.name,0,S.LEAVE);return n.leave&&e.push(o.a.createElement("circle",{key:"".concat(t.name,"-leave-").concat(r),id:"".concat(t.name,"-leave-").concat(n.team),"data-date":n.leave,cx:O,cy:E,r:_[S.LEAVE],stroke:c,fill:"transparent"})),e.push(o.a.createElement("line",{key:"".concat(t.name,"-team-").concat(r),id:"".concat(t.name,"-team-").concat(n.team),x1:u,y1:s,x2:O,y2:E,stroke:c,strokeWidth:3},o.a.createElement("title",null,t.name," | ",n.team))),e}),[]);return o.a.createElement(o.a.Fragment,null,n)}return o.a.createElement("svg",{width:1200,height:c(Object(s.size)(r))},o.a.createElement("g",{id:"tournaments"},N(t,(function(e){return o.a.createElement(d,{tournament:e})}))),o.a.createElement("g",{id:"timeline"},Object(s.map)(Object(s.range)(0,E()(l).diff(u,"d"),50),(function(e,t){return o.a.createElement(f,{key:t,now:E()(u).add(e,"d")})})),N(t,(function(e){return o.a.createElement(o.a.Fragment,{key:e.name},o.a.createElement(f,{now:E()(e.start)}),o.a.createElement(f,{now:E()(e.end)}))}))),o.a.createElement("g",{id:"events"},Object(s.map)(n,(function(e){return o.a.createElement(b,{key:e.name,player:e})}))))}function W(e){var t=e.seasons,n=Object(c.useMemo)((function(){return N(t,(function(e){return e}))}),[t]),a=function(e){var t={};return Object(s.map)(e,(function(e){var n={};return Object(s.forEach)(e.teams,(function(e){Object(s.forEach)(e.players,(function(e){e in t?t[e]++:t[e]=1,n[e]=t[e]}))})),{tournament:e,seasonCounts:n}}))}(n);return o.a.createElement("table",null,o.a.createElement("tbody",null,o.a.createElement("tr",null,o.a.createElement("th",null),Object(s.map)(n,(function(e,t){return o.a.createElement("th",{key:t},v(e.name))}))),o.a.createElement("tr",{style:{textAlign:"center"}},o.a.createElement("td",null,"Percentage of rookies"),Object(s.map)(a,(function(e){var t=e.seasonCounts;return o.a.createElement("td",null,Math.round(100*function(e){var t=Object(s.reduce)(e,(function(e,t){return e[1===t?0:1]++,e}),[0,0]),n=Object(l.a)(t,2),a=n[0];return 100*a/(a+n[1])}(t))/100)}))),o.a.createElement("tr",{style:{textAlign:"center"}},o.a.createElement("td",null,"Average age"),Object(s.map)(a,(function(e){var t=e.seasonCounts;return o.a.createElement("td",null,function(e){var t=e%10,n=e%100;return 1===t&&11!==n?e+"st":2===t&&12!==n?e+"nd":3===t&&13!==n?e+"rd":e+"th"}(Math.round(100*function(e){return Object(s.sum)(Object(s.values)(e))/Object(s.size)(e)}(t))/100))}))),o.a.createElement("tr",null,o.a.createElement("td",null,"Details"),Object(s.map)(a,(function(e){var t=e.tournament,a=e.seasonCounts;return o.a.createElement("td",null,o.a.createElement("ul",null,Object(s.map)(t.teams,(function(e){return o.a.createElement(o.a.Fragment,null,o.a.createElement("li",null,e.name),o.a.createElement("ul",null,Object(s.map)(e.players,(function(e){return o.a.createElement("li",{style:{backgroundColor:Object(b.c)(a[e]/Object(s.size)(n))}},e,": ",o.a.createElement("b",null,a[e],"th season"))}))))}))))})))))}var H=n(33),B=function(e,t){return Object(s.get)(Object(s.find)(e.teams,(function(e){return Object(s.find)(e.players,(function(e){return e===t}))})),"name","NONE")},J=function(e){return"".concat(e.name,"-").concat(e.tournamentIndex)},U=Object(H.a)().size([1600,1050]).nodeId(J).nodeWidth(20).nodePadding(10).nodeAlign((function(e){return Object(s.get)(e,"tournamentIndex")})).nodeSort((function(e,t){return e.name.startsWith("NONE")?1:t.name.startsWith("NONE")?-1:0})).linkSort((function(e,t){return Object(s.get)(e,"player")-Object(s.get)(t,"player")}));function F(e){var t=e.seasons,n=function(e){var t=[],n=[],a=new Set,r="",c="";return Object(s.forEach)(e,(function(e,n){Object(s.forEach)(e.teams,(function(r){t.push({name:r.name,tournamentIndex:n,date:e.start}),Object(s.map)(r.players,(function(e){return a.add(e)}))})),t.push({name:"NONE",tournamentIndex:n,date:e.start}),(!r||e.start<r)&&(r=e.start),(!c||e.start>c)&&(c=e.start)})),Object(s.forEach)(e.slice(0,e.length-1),(function(t,r){var c=new Set(a);Object(s.forEach)(t.teams,(function(t){Object(s.forEach)(t.players,(function(a){n.push({source:J({name:t.name,tournamentIndex:r}),target:J({name:B(e[r+1],a),tournamentIndex:r+1}),value:1,player:a}),c.delete(a)}))})),c.forEach((function(t){return n.push({source:J({name:"NONE",tournamentIndex:r}),target:J({name:B(e[r+1],t),tournamentIndex:r+1}),value:1,player:t})}))})),{nodes:t,links:n,minDate:r,maxDate:c}}(Object(c.useMemo)((function(){return N(t,(function(e){return e}))}),[t]));return n.nodes.length>0&&n.links.length>0&&U(n),o.a.createElement("svg",{width:1600,height:1050},o.a.createElement("g",{id:"links",className:"links"},Object(s.map)(n.links,(function(e){return o.a.createElement("g",null,o.a.createElement("path",{className:"link",d:Object(H.b)()(e)||"",fill:"none",stroke:"#606060",strokeWidth:e.width,strokeOpacity:.5},o.a.createElement("title",null,e.player)),o.a.createElement("text",{x:Object(s.get)(e,"source.x1")+5,y:e.y0},e.player),o.a.createElement("text",{x:Object(s.get)(e,"target.x0")-5,y:e.y1,textAnchor:"end"},e.player))}))),o.a.createElement("g",{id:"nodes"},Object(s.map)(n.nodes,(function(e){var t={x:(e.x0||0)+10,y:e.y1||0};return o.a.createElement("g",null,o.a.createElement("rect",{className:"node",x:e.x0,y:e.y0,width:(e.x1||0)-(e.x0||0),height:(e.y1||0)-(e.y0||0),fill:e.name.startsWith("NONE")?"crimson":"skyblue",opacity:.8}),o.a.createElement("text",{fontSize:10,x:t.x,y:t.y,transform:"rotate(-90,".concat(t.x,",").concat(t.y,")"),textLength:(e.y1||0)-(e.y0||0),lengthAdjust:"spacing"},e.name))}))))}function V(e){var t=e.seasons,n=e.players,a=e.teamColors,r=function(e,t){return Object(s.map)(e,(function(e){var n={};return Object(s.forEach)(e.sections,(function(e){Object(s.forEach)(e.tournaments,(function(e){var a={};Object(s.forEach)(e.teams,(function(r){Object(s.forEach)(r.players,(function(c){var o=T(t,c);if(o){var i=o.name;Object(s.forEach)(o.memberships,(function(t){if(!a[i]&&t.join<=e.end&&(!t.leave||t.leave>=e.start)){Object(s.has)(n,i)||(n[i]={region:r.region,blocks:[]});var c=n[i].blocks,o=Object(s.max)([e.start,t.join]),u=t.join<=e.start,l=t.leave?Object(s.min)([e.end,t.leave]):e.end,m=!t.leave||t.leave>=e.end;Object(s.size)(c)>0&&Object(s.last)(c).fullEnd&&u&&Object(s.last)(c).team===t.team?Object(s.assign)(Object(s.last)(c),{end:l,fullEnd:m}):c.push({team:t.team,start:o,end:l,fullStart:u,fullEnd:m}),a[i]=r.name===t.team}}))}}))}))}))})),n}))}(t,n);console.log(r);var c=Array.from(Object(s.reduce)(r,(function(e,t){return Object(s.forEach)(Object(s.keys)(t),(function(t){return e.add(t)})),e}),new Set));return o.a.createElement("svg",{height:3e3,width:600*Object(s.size)(r)+150},o.a.createElement("g",{id:"seasons"},Object(s.map)(t,(function(e,t){return o.a.createElement(o.a.Fragment,null,o.a.createElement("g",{id:"season-title-".concat(e.season)},o.a.createElement("rect",{x:150+600*t,y:0,width:600,height:50,fill:"skyblue"}),o.a.createElement("text",{x:150+600*t+4,y:44},"Season ",e.season)),o.a.createElement("g",{id:"season-lines-".concat(e.season)},[t,t+1].map((function(e){return o.a.createElement("line",{stroke:"black",x1:150+600*e,y1:0,x2:150+600*e,y2:3e3})}))))}))),o.a.createElement("g",{id:"player-names"},Object(s.map)(c,(function(e,t){return o.a.createElement("g",{id:"player-name-".concat(e)},o.a.createElement("rect",{x:0,y:50+25*t,width:150,height:25,fill:"transparent",stroke:"black",strokeWidth:1}),o.a.createElement("text",{x:4,y:50+25*(t+1)-6},e))}))),o.a.createElement("g",{transform:"translate(".concat(150,",").concat(50,")"),id:"block-space"},Object(s.map)(r,(function(e,n){var r,i=t[n],u=(r=i.season,600*(isNaN(parseInt(r,10))?9:parseInt(r,10)-1));return o.a.createElement("g",{id:"block-space-season-".concat(i.season)},Object(s.map)(e,(function(e,r){var l=e.region,m=[];Object(s.forEach)(i.sections,(function(e){var t=Object(s.find)(e.tournaments,(function(e){return e.region===l}))||Object(s.find)(e.tournaments,(function(e){return e.region===P.WORLD}));t?m.push([t.start,t.end]):console.error("No tourney found for this region. Rip.")}));var f=new A(m,[0,600]);return o.a.createElement("g",{id:"block-space-season-".concat(t[n].season,"-player-").concat(r)},Object(s.map)(e.blocks,(function(e){var t=25*Object(s.indexOf)(c,r),n=f.convert(e.start),i=f.convert(e.end),l=k(e.team,a);return o.a.createElement("g",null,o.a.createElement("rect",{x:u+n+2,y:t+2,width:i-n-4,height:21,fill:l,opacity:.7}),o.a.createElement("text",{x:u+n+4,y:t+25-6,fill:w(l)},e.team))})))})))}))))}var G=n(11),X=n(138);function K(e){var t=e.seasons,n=Object(X.a)(),a=Object(c.useMemo)((function(){return N(t,(function(e){return e}))}),[t]),r=Object(c.useState)(null),i=Object(l.a)(r,2),u=i[0],m=i[1],f=Object(c.useState)({x:0,y:0}),d=Object(l.a)(f,2),b=d[0],O=d[1],E=Object(c.useState)({x:0,y:0}),p=Object(l.a)(E,2),g=p[0],v=p[1],x=Object(c.useMemo)((function(){return j(a)}),[a]),I=Object(c.useMemo)((function(){return function(e){var t={};return Object(s.forEach)(e,(function(e,n){Object(s.forEach)(e.teams,(function(e,a){Object(s.forEach)(e.players,(function(e,r){e in t||(t[e]=[]),t[e].push({playerIndex:r,teamIndex:a,tournamentIndex:n,id:y(n,a,r)})}))}))})),Object(s.reduce)(t,(function(e,t){for(var n=[],a=0;a<t.length-1;a++)n.push({source:y(t[a].tournamentIndex,t[a].teamIndex,t[a].playerIndex),target:y(t[a+1].tournamentIndex,t[a+1].teamIndex,t[a+1].playerIndex)});return Object(s.concat)(e,n)}),[])}(a)}),[a]),k=Object(M.a)().domain([0,a.length]).range([160,1590]),A=Object(c.useMemo)((function(){return G.d(x).force("link",G.b().distance(1600/6).id((function(e){return y(e.tournamentIndex,e.teamIndex,e.playerIndex)})).links(I)).force("charge",G.c().strength(-65)).force("y",G.e(525).strength(.01)).force("collide",G.a(12)).force("sameTeam",function(){var e,t=1;function n(e,n,a){return(e-(n.y||0))*("function"===typeof t?t(n):t)*a}function a(t){Object(s.forEach)(e,(function(a){var r=Object(s.partition)(Object(s.sortBy)(Object(s.filter)(e,(function(e){return e.tournamentIndex===a.tournamentIndex&&e.teamIndex===a.teamIndex&&e.playerIndex!==a.playerIndex})),["y"]),(function(e){return(e.y||0)<=(a.y||0)})),c=Object(s.map)(r[0],(function(e,r,c){return n((e.fy||e.y||0)+20*(c.length-r),a,t)})),o=Object(s.map)(r[1],(function(e,r){return n((e.fy||e.y||0)-20*(r+1),a,t)})),i=Object(s.reduce)(Object(s.concat)(o,c),(function(e,t){return e+t}),0);a.vy=a.vy?a.vy+i:i}))}return a.initialize=function(t){e=t},a.strength=function(e){return arguments.length?(t="function"===typeof e?e:+e,a):t},a}().strength(.8)).force("diffTeam",function(){var e,t=1;function n(n){Object(s.forEach)(e,(function(a){var r=Object(s.filter)(e,(function(e){return e.tournamentIndex===a.tournamentIndex&&e.teamIndex!==a.teamIndex})),c=Object(s.reduce)(r,(function(e,r){var c=(a.y||0)-(r.fy||r.y||0);return e+(0===c?0:("function"===typeof t?t(a):t)*n/c)}),0);a.vy=a.vy?a.vy+c:c}))}return n.initialize=function(t){e=t},n.strength=function(e){return arguments.length?(t="function"===typeof e?e:+e,n):t},n}().strength(15)).on("tick",n)}),[x,I,n]),T=function(e,t){A.alphaTarget(.3).restart(),m(e),O({x:t.clientX,y:t.clientY}),v({x:e.x||0,y:e.y||0}),e.fx=e.x,e.fy=e.y};return o.a.createElement("svg",{width:1600,height:1050,onMouseMove:function(e){u&&(u.fx=g.x+e.clientX-b.x,u.fy=g.y+e.clientY-b.y)},onMouseUp:function(){u&&(A.alphaTarget(0),u.fx=null,u.fy=null),m(null)}},o.a.createElement("g",{id:"nodes"},Object(s.map)(x,(function(e){return o.a.createElement("g",{key:e.id,transform:"translate(".concat(k(e.tournamentIndex),",").concat(Object(s.clamp)(e.y||0,0,1050),")"),onMouseDown:T.bind(null,e)},o.a.createElement("circle",{r:10}),o.a.createElement("text",{x:11,y:3},h(a,e)))}))),o.a.createElement("g",{id:"links"},Object(s.map)(I,(function(e){return o.a.createElement("line",{stroke:"black",key:"".concat(e.source.id,"-").concat(e.target.id),x1:k(e.source.tournamentIndex),y1:Object(s.clamp)(Object(s.get)(e,"source.y"),0,1050),x2:k(e.target.tournamentIndex),y2:Object(s.clamp)(Object(s.get)(e,"target.y"),0,1050)})}))))}var Z=[{season:"1",sections:[{name:"Section 0",tournaments:[{region:P.NORTH_AMERICA,name:"Season 1 Section 0 Tournament 0",start:"2021-02-01",end:"2021-02-10",teams:[{name:"Team 1",players:["Player 1","Player 2","Player 3"],region:P.NORTH_AMERICA},{name:"Team 1",players:["Player 4","Player 5","Player 6"],region:P.NORTH_AMERICA}]}]},{name:"Section 1",tournaments:[{region:P.NORTH_AMERICA,name:"Season 1 Section 1 Tournament 0",start:"2021-03-01",end:"2021-03-10",teams:[{name:"Team 1",players:["Player 1","Player 2","Player 4"],region:P.NORTH_AMERICA},{name:"Team 2",players:["Player 3","Player 5","Player 6"],region:P.NORTH_AMERICA}]}]}]}],$={"Team 1":"#802b26"};var q=function(){var e=Object(c.useState)(r.TIMELINE),t=Object(l.a)(e,2),n=t[0],a=t[1];return o.a.createElement("div",null,o.a.createElement("div",{style:{textAlign:"center"}},o.a.createElement("select",{value:n,onChange:function(e){console.log(e.target.value),a(e.target.value)}},Object(s.map)(r,(function(e){return o.a.createElement("option",{value:e,key:e},x[e])})))),o.a.createElement("div",{style:{width:"100%",height:"calc(100vh - 90px)",overflow:"scroll"}},n===r.SIMPLE?o.a.createElement(L,{seasons:Z}):n===r.TIMELINE?o.a.createElement(z,{seasons:Z,players:Y,teamColors:$}):n===r.TABLE?o.a.createElement(V,{seasons:Z,players:Y,teamColors:$}):n===r.FORCE_GRAPH?o.a.createElement(K,{seasons:Z}):n===r.TEXT?o.a.createElement(W,{seasons:Z}):n===r.SANKEY?o.a.createElement(F,{seasons:Z}):""))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));u.a.render(o.a.createElement(o.a.StrictMode,null,o.a.createElement(q,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[127,1,2]]]);
//# sourceMappingURL=main.91eaae36.chunk.js.map