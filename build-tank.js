const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSBIM 数字孪生储罐监测系统</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:"Microsoft YaHei","Segoe UI",Arial,sans-serif;background:linear-gradient(135deg,#0a0e27 0%,#1a1f3a 50%,#0d1225 100%);color:#b8c5d6;min-height:100vh;overflow-x:hidden}
        #particles canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
        .dashboard{position:relative;z-index:1;max-width:1600px;margin:0 auto;padding:15px}
        .header{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:rgba(0,20,40,0.8);border:1px solid rgba(0,212,255,0.3);border-radius:10px;margin-bottom:15px}
        .header h1{font-size:22px;color:#00ffff;text-shadow:0 0 20px rgba(0,255,255,0.5);letter-spacing:3px}
        .header-info{display:flex;gap:25px;font-size:13px}
        .header-item{display:flex;align-items:center;gap:8px}
        .header-item .label{color:#5a9fc9}
        .header-item .value{color:#00ffff;font-family:Consolas}
        .status-online{color:#00ff88;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:15px}
        .stat-card{background:rgba(0,20,40,0.7);border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:15px;transition:all 0.3s}
        .stat-card:hover{border-color:#00ffff;box-shadow:0 0 20px rgba(0,255,255,0.2)}
        .stat-card .label{font-size:12px;color:#5a9fc9;margin-bottom:5px}
        .stat-card .value{font-size:28px;font-weight:bold;color:#00ffff;font-family:Consolas}
        .stat-card .unit{font-size:14px;color:#7fdbff}
        .stat-card.warning .value{color:#ffaa00}
        .stat-card.danger .value{color:#ff4444}
        .main-monitor{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px}
        .monitor-panel{background:rgba(0,15,35,0.85);border:1px solid rgba(0,212,255,0.25);border-radius:10px;overflow:hidden}
        .monitor-header{padding:10px 15px;background:rgba(0,40,60,0.6);border-bottom:1px solid rgba(0,212,255,0.2);display:flex;justify-content:space-between;align-items:center}
        .monitor-title{font-size:14px;color:#00ffff;font-weight:bold}
        .monitor-badge{background:rgba(0,255,136,0.2);color:#00ff88;padding:3px 10px;border-radius:12px;font-size:11px}
        .monitor-body{padding:10px;height:400px}
        .tank-monitor{height:400px;position:relative}
        .sensor-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
        .sensor-card{background:rgba(0,30,50,0.6);border:1px solid rgba(0,212,255,0.2);border-radius:6px;padding:8px;text-align:center;cursor:pointer;transition:all 0.3s}
        .sensor-card:hover{border-color:#00ffff;background:rgba(0,50,80,0.6)}
        .sensor-card .id{font-size:10px;color:#5a9fc9;font-family:Consolas}
        .sensor-card .value{font-size:18px;color:#00ffff;font-weight:bold;font-family:Consolas}
        .sensor-card .type{font-size:9px;color:#7fdbff}
        .sensor-card.warning{border-color:#ffaa00}
        .sensor-card.warning .value{color:#ffaa00}
        .sensor-card.danger{border-color:#ff4444;animation:alert-blink 1s infinite}
        @keyframes alert-blink{0%,100%{background:rgba(255,68,68,0.1)}50%{background:rgba(255,68,68,0.3)}}
        .charts-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}
        .chart-container{background:rgba(0,15,35,0.85);border:1px solid rgba(0,212,255,0.25);border-radius:10px;padding:12px}
        .chart-title{font-size:13px;color:#00ffff;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(0,212,255,0.2)}
        .chart-box{height:220px}
        .alert-list{max-height:150px;overflow-y:auto}
        .alert-item{display:flex;justify-content:space-between;padding:8px 10px;border-radius:5px;margin-bottom:5px;font-size:12px}
        .alert-item.warning{background:rgba(255,170,0,0.15);border-left:3px solid #ffaa00}
        .alert-item.danger{background:rgba(255,68,68,0.15);border-left:3px solid #ff4444}
        .alert-item .time{color:#5a9fc9;font-family:Consolas}
        .footer{text-align:center;padding:15px;color:#3a5a7a;font-size:11px;margin-top:20px}
        .tank-controls{position:absolute;top:10px;right:10px;z-index:10;display:flex;gap:5px}
        .tank-controls button{background:rgba(0,40,60,0.9);border:1px solid #00ffff;color:#00ffff;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:12px}
        .tank-controls button:hover{background:rgba(0,80,120,0.9)}
        .tank-info{position:absolute;bottom:10px;left:10px;z-index:10;background:rgba(0,20,40,0.85);padding:10px 15px;border-radius:8px;border:1px solid rgba(0,255,255,0.3)}
        .tank-info .name{color:#00ffff;font-size:16px;font-weight:bold}
        .tank-info .index{color:#5a9fc9;font-size:12px}
    </style>
</head>
<body>
    <div id="particles"></div>
    <div class="dashboard">
        <div class="header">
            <h1>🏭 RSBIM 数字孪生储罐监测系统</h1>
            <div class="header-info">
                <div class="header-item"><span class="status-online">●</span><span class="label">系统状态:</span><span class="value">运行中</span></div>
                <div class="header-item"><span class="label">数据更新:</span><span class="value" id="nextUpdate">10</span><span class="label">秒</span></div>
                <div class="header-item"><span class="label">监测点:</span><span class="value">48</span><span class="label">个</span></div>
                <div class="header-item"><span class="label" id="currentTime">--:--:--</span></div>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="label">平均应变</div><div class="value"><span id="avgStrain">--</span> <span class="unit">με</span></div></div>
            <div class="stat-card warning"><div class="label">最大位移</div><div class="value"><span id="maxDisplacement">--</span> <span class="unit">mm</span></div></div>
            <div class="stat-card"><div class="label">最大倾角</div><div class="value"><span id="tiltAngle">--</span> <span class="unit">°</span></div></div>
            <div class="stat-card"><div class="label">平均温度</div><div class="value"><span id="avgTemp">--</span> <span class="unit">°C</span></div></div>
            <div class="stat-card"><div class="label">沉降速率</div><div class="value"><span id="settlementRate">--</span> <span class="unit">mm/d</span></div></div>
            <div class="stat-card"><div class="label">数据缓存</div><div class="value" id="dataCache" style="font-size:16px">--</div></div>
        </div>
        <div class="main-monitor">
            <div class="monitor-panel">
                <div class="monitor-header"><span class="monitor-title">📡 储罐数字孪生监控</span><span class="monitor-badge" id="tankIndex">1/12</span></div>
                <div class="monitor-body">
                    <div class="tank-monitor" id="tankMonitor"></div>
                    <div class="tank-controls"><button onclick="switchTank(-1)">◀ 上一罐</button><button onclick="switchTank(1)">下一罐 ▶</button></div>
                    <div class="tank-info"><div class="name" id="currentTankName">1号储罐</div><div class="index">数字孪生 · 智能监测</div></div>
                </div>
            </div>
            <div class="monitor-panel">
                <div class="monitor-header"><span class="monitor-title">📊 传感器状态总览</span><span class="monitor-badge">实时</span></div>
                <div class="monitor-body"><div class="sensor-grid" id="sensorGrid"></div></div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="chart-container"><div class="chart-title">🎯 罐体应力雷达图</div><div class="chart-box" id="stressRadar"></div></div>
            <div class="chart-container"><div class="chart-title">📈 位移沉降趋势</div><div class="chart-box" id="displacementTrend"></div></div>
            <div class="chart-container"><div class="chart-title">🌡️ 罐区温度场分布</div><div class="chart-box" id="tempField"></div></div>
            <div class="chart-container"><div class="chart-title">📐 储罐倾角监测</div><div class="chart-box" id="tiltChart"></div></div>
            <div class="chart-container"><div class="chart-title">📉 应变时序曲线</div><div class="chart-box" id="strainTime"></div></div>
            <div class="chart-container"><div class="chart-title">🎲 传感器健康状态</div><div class="chart-box" id="sensorScatter"></div></div>
        </div>
        <div class="chart-container" style="margin-top:15px"><div class="chart-title">🚨 实时告警信息</div><div class="alert-list" id="alertList"></div></div>
        <div class="footer">RSBIM数字孪生储罐监测系统 v2.0 | 数据来源: RSBIM智能传感器网络 | 技术支持: 唐山市神州科贸有限公司</div>
    </div>
    <script>
        var chartInstances={};
        var sensorData=[];
        var currentTank=0;
        var countdown=10;
        function createParticles(){var canvas=document.createElement("canvas");document.getElementById("particles").appendChild(canvas);var ctx=canvas.getContext("2d");var particles=[];var w=canvas.width=window.innerWidth;var h=canvas.height=window.innerHeight;for(var i=0;i<80;i++){particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,size:Math.random()*2+0.5,alpha:Math.random()*0.5+0.2})}function animate(){ctx.clearRect(0,0,w,h);particles.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle="rgba(0, 212, 255, "+p.alpha+")";ctx.fill()});requestAnimationFrame(animate)}animate();window.addEventListener("resize",function(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight})}
        function initSensorData(){var types=["应变","位移","倾角","温度"];var units=["με","mm","°","°C"];for(var i=0;i<48;i++){var typeIdx=i%4;sensorData.push({id:"RSBIM-"+String(i+1).padStart(2,"0"),type:types[typeIdx],unit:units[typeIdx],value:typeIdx===0?Math.random()*60+10:typeIdx===1?Math.random()*5+0.5:typeIdx===2?Math.random()*1.5:Math.random()*30+15,status:"normal",history:[]})}}
        function generateRandomChange(val,maxChange,minChange){var change=(Math.random()-0.5)*2*maxChange;var newVal=val+change;if(newVal<val*0.8)newVal=val*0.8;if(newVal>val*1.2)newVal=val*1.2;return Math.max(minChange,newVal)}
        function generateAlerts(){var alerts=[];sensorData.forEach(function(s){if(s.status==="warning"){alerts.push({level:"warning",msg:s.id+" "+s.type+"超过阈值",time:new Date().toLocaleTimeString()})}else if(s.status==="danger"){alerts.push({level:"danger",msg:s.id+" "+s.type+"严重超限!",time:new Date().toLocaleTimeString()})}});if(alerts.length===0){alerts.push({level:"normal",msg:"系统运行正常，所有传感器数据正常",time:new Date().toLocaleTimeString()})}return alerts.slice(0,5)}
        function updateTime(){var now=new Date();document.getElementById("currentTime").textContent=now.toLocaleTimeString()}
        function updateData(){countdown=10;sensorData.forEach(function(s){if(s.type==="应变"){s.value=generateRandomChange(s.value,5,0.2)}else if(s.type==="位移"){s.value=generateRandomChange(s.value,0.5,0.1)}else if(s.type==="倾角"){s.value=generateRandomChange(s.value,0.1,0)}else{s.value=generateRandomChange(s.value,1,0.2)}s.status=s.value>60?"danger":s.value>45?"warning":"normal";s.history.push(s.value);if(s.history.length>100)s.history.shift()});var strainSensors=sensorData.filter(function(s){return s.type==="应变"});document.getElementById("avgStrain").textContent=(strainSensors.reduce(function(a,b){return a+b.value},0)/strainSensors.length).toFixed(1);var dispSensors=sensorData.filter(function(s){return s.type==="位移"});document.getElementById("maxDisplacement").textContent=Math.max.apply(null,dispSensors.map(function(s){return s.value})).toFixed(1);var tiltSensors=sensorData.filter(function(s){return s.type==="倾角"});document.getElementById("tiltAngle").textContent=Math.max.apply(null,tiltSensors.map(function(s){return s.value})).toFixed(2);var tempSensors=sensorData.filter(function(s){return s.type==="温度"});document.getElementById("avgTemp").textContent=(tempSensors.reduce(function(a,b){return a+b.value},0)/tempSensors.length).toFixed(1);document.getElementById("settlementRate").textContent=generateRandomChange(0.15,0.05,0.1).toFixed(2);updateAlertList(generateAlerts());updateSensorGrid();updateCharts()}
        function updateSensorGrid(){var units={"应变":"με","位移":"mm","倾角":"°","温度":"°C"};var html=sensorData.slice(0,12).map(function(s){return '<div class="sensor-card '+s.status+'"><div class="id">'+s.id+'</div><div class="value">'+s.value.toFixed(1)+'</div><div class="type">'+s.type+'传感器</div></div>'}).join("");document.getElementById("sensorGrid").innerHTML=html}
        function updateAlertList(alerts){var html=alerts.map(function(a){return '<div class="alert-item '+a.level+'"><div>'+a.msg+'</div><div class="time">'+a.time+'</div></div>'}).join("");document.getElementById("alertList").innerHTML=html}
        function updateCharts(){renderTank(currentTank);if(chartInstances.tempField){chartInstances.tempField.setOption({series:[{data:sensorData.filter(function(s){return s.type==="温度"}).map(function(s){return s.value})}]})};if(chartInstances.tiltChart){chartInstances.tiltChart.setOption({series:[{data:sensorData.filter(function(s){return s.type==="倾角"}).map(function(){return(Math.random()*0.8).toFixed(2)})},{data:sensorData.filter(function(s){return s.type==="倾角"}).map(function(){return(Math.random()*0.6).toFixed(2)})}]})}}
        function initTank3D(){var tankDom=document.getElementById("tankMonitor");if(!tankDom)return;chartInstances.tank3D=echarts.init(tankDom);renderTank(currentTank)}
        function renderTank(tankIdx){var tankNames=["1号储罐","2号储罐","3号储罐","4号储罐","5号储罐","6号储罐","7号储罐","8号储罐","9号储罐","10号储罐","11号储罐","12号储罐"];document.getElementById("currentTankName").textContent=tankNames[tankIdx];document.getElementById("tankIndex").textContent=(tankIdx+1)+"/12";var sensors=[];for(var i=0;i<8;i++){var sv=sensorData[tankIdx*4+(i%4)].value;sensors.push({id:sensorData[tankIdx*4+(i%4)].id,value:sv,color:sv<25?"#00ffff":sv<45?"#ffaa00":"#ff4444"})}var option={backgroundColor:"transparent",tooltip:{trigger:"item",backgroundColor:"rgba(0,10,30,0.95)",borderColor:"#00ffff",borderWidth:2,textStyle:{color:"#00ffff",fontFamily:"Consolas"}},grid:{left:"5%",right:"5%",top:"3%",bottom:"12%"},xAxis:{type:"value",min:0,max:100,show:false},yAxis:{type:"value",min:0,max:100,show:false},series:[
            {type:"scatter",data:[[50,8]],symbol:"rect",symbolSize:[90,8],itemStyle:{color:"rgba(0,40,70,0.9)",borderColor:"#00ffff",borderWidth:2},z:5},
            {type:"line",data:[[20,8],[20,3]],lineStyle:{color:"#0088aa",width:4},z:6},
            {type:"line",data:[[35,8],[35,3]],lineStyle:{color:"#0088aa",width:4},z:6},
            {type:"line",data:[[50,8],[50,3]],lineStyle:{color:"#0088aa",width:4},z:6},
            {type:"line",data:[[65,8],[65,3]],lineStyle:{color:"#0088aa",width:4},z:6},
            {type:"line",data:[[80,8],[80,3]],lineStyle:{color:"#0088aa",width:4},z:6},
            {type:"scatter",data:[[50,78]],symbol:"circle",symbolSize:[90,35],itemStyle:{color:"rgba(0,40,80,0.7)",borderColor:"#00ffff",borderWidth:3,shadowBlur:20,shadowColor:"#00ffff"},z:10},
            {type:"scatter",data:[[42,75]],symbol:"circle",symbolSize:[35,12],itemStyle:{color:"rgba(0,120,160,0.2)",borderColor:"transparent"},z:11},
            {type:"line",data:[[5,25],[5,78]],lineStyle:{color:"#00ffff",width:2.5,shadowBlur:12,shadowColor:"#00ffff"},z:14},
            {type:"line",data:[[95,25],[95,78]],lineStyle:{color:"rgba(0,255,255,0.4)",width:2},z:9},
            {type:"line",data:[[5,25],[95,25]],lineStyle:{color:"rgba(0,255,255,0.15)",width:1,type:"dashed"},z:7},
            {type:"line",data:[[5,51],[95,51]],lineStyle:{color:"rgba(0,255,255,0.1)",width:1,type:"dashed"},z:7},
            {type:"scatter",data:[[50,22]],symbol:"circle",symbolSize:[90,35],itemStyle:{color:"rgba(0,60,100,0.6)",borderColor:"#00ffff",borderWidth:3,shadowBlur:25,shadowColor:"#00ffff"},z:15},
            {type:"scatter",data:[[42,19]],symbol:"circle",symbolSize:[35,12],itemStyle:{color:"rgba(0,150,200,0.25)",borderColor:"transparent"},z:16},
            {type:"line",data:[[5,40],[5,25],[-5,25],[-5,60]],lineStyle:{color:"#00aaff",width:4,shadowBlur:10,shadowColor:"#00aaff"},z:17},
            {type:"scatter",data:[[-5,42.5]],symbol:"circle",symbolSize:12,itemStyle:{color:"#00aaff",borderColor:"#fff",borderWidth:2},z:20},
            {type:"line",data:[[95,50],[105,50],[105,70],[110,70]],lineStyle:{color:"#00ff88",width:4,shadowBlur:10,shadowColor:"#00ff88"},z:17},
            {type:"scatter",data:[[107,60]],symbol:"circle",symbolSize:12,itemStyle:{color:"#00ff88",borderColor:"#fff",borderWidth:2},z:20},
            {type:"line",data:[[50,78],[50,88],[40,88]],lineStyle:{color:"#ff6644",width:3},z:17},
            {type:"scatter",data:[[45,88]],symbol:"circle",symbolSize:10,itemStyle:{color:"#ff6644",borderColor:"#fff",borderWidth:2},z:20},
            {type:"scatter",data:[[25,22],[50,22],[75,22]],symbol:"circle",symbolSize:18,itemStyle:{color:"transparent",borderColor:"#00ffff",borderWidth:2,shadowBlur:15,shadowColor:"#00ffff"},label:{show:true,formatter:function(p){return sensors[p.dataIndex].id.slice(-2)},color:"#fff",fontSize:10,position:"top"},z:30},
            {type:"scatter",data:[[25,22],[50,22],[75,22]],symbol:"circle",symbolSize:9,itemStyle:{color:function(p){return sensors[p.dataIndex].color},borderColor:"#fff",borderWidth:1},z:31},
            {type:"scatter",data:[[25,51],[50,51],[75,51]],symbol:"circle",symbolSize:18,itemStyle:{color:"transparent",borderColor:"#00ffff",borderWidth:2,shadowBlur:15,shadowColor:"#00ffff"},label:{show:true,formatter:function(p){return sensors[p.dataIndex+3].id.slice(-2)},color:"#fff",fontSize:10,position:"top"},z:30},
            {type:"scatter",data:[[25,51],[50,51],[75,51]],symbol:"circle",symbolSize:9,itemStyle:{color:function(p){return sensors[p.dataIndex+3].color},borderColor:"#fff",borderWidth:1},z:31},
            {type:"scatter",data:[[30,78],[70,78]],symbol:"circle",symbolSize:18,itemStyle:{color:"transparent",borderColor:"#00ffff",borderWidth:2,shadowBlur:15,shadowColor:"#00ffff"},label:{show:true,formatter:function(p){return sensors[p.dataIndex+6].id.slice(-2)},color:"#fff",fontSize:10,position:"bottom"},z:30},
            {type:"scatter",data:[[30,78],[70,78]],symbol:"circle",symbolSize:9,itemStyle:{color:function(p){return sensors[p.dataIndex+6].color},borderColor:"#fff",borderWidth:1},z:31},
            {type:"text",data:[[50,95]],style:{text:"TANK-"+String(tankIdx+1).padStart(2,"0"),fill:"#00ffff",font:"bold 18px Consolas",textAlign:"center"},z:35},
            {type:"text",data:[[90,15]],style:{text:"● RUN",fill:"#00ff88",font:"bold 14px Consolas"},z:35},
            {type:"text",data:[[10,15]],style:{text:"IN",fill:"#00aaff",font:"bold 12px Consolas"},z:35},
            {type:"text",data:[[88,82]],style:{text:"OUT",fill:"#00ff88",font:"bold 10px Consolas"},z:35}
        ]};chartInstances.tank3D.setOption(option,true)}
        function switchTank(dir){currentTank=(currentTank+dir+12)%12;renderTank(currentTank)}
        function initCharts(){initTank3D();chartInstances.stressRadar=echarts.init(document.getElementById("stressRadar"));chartInstances.stressRadar.setOption({radar:{indicator:[{name:"径向",max:100},{name:"环向",max:100},{name:"剪应力",max:100},{name:"轴向",max:100},{name:"弯曲",max:100},{name:"扭转",max:100}],axisName:{color:"#00d4ff"},splitLine:{lineStyle:{color:"rgba(0,212,255,0.3)"}},splitArea:{areaStyle:{color:["rgba(0,212,255,0.05)","transparent"]}}},series:[{type:"radar",data:[{value:[78,65,42,55,38,22],name:"1号储罐",areaStyle:{color:"rgba(0,212,255,0.3)"},lineStyle:{color:"#00d4ff"}}]}]});chartInstances.displacementTrend=echarts.init(document.getElementById("displacementTrend"));var d=Array.from({length:30},function(_,i){return"Day "+(i+1)});var v=Array.from({length:30},function(){return(Math.random()*3+0.5).toFixed(2)});chartInstances.displacementTrend.setOption({tooltip:{trigger:"axis"},legend:{data:["实际值","趋势线","预测"],textStyle:{color:"#7fdbff"},top:0},grid:{left:"8%",right:"5%",top:"25%",bottom:"15%"},xAxis:{type:"category",data:d,axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"}},yAxis:{type:"value",name:"mm",axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"},splitLine:{lineStyle:{color:"rgba(0,212,255,0.2)"}}},series:[{name:"实际值",data:v,type:"line",smooth:true,lineStyle:{color:"#00d4ff",width:2},itemStyle:{color:"#00d4ff"}},{name:"趋势线",data:v.map(function(x,i){return(parseFloat(x)+Math.sin(i*0.5)*0.5).toFixed(2)}),type:"line",smooth:true,lineStyle:{color:"#00ff88",width:2,type:"dashed"},itemStyle:{color:"#00ff88"}},{name:"预测",data:[...Array(27).fill(null),...v.slice(-3).map(function(x,i){return(parseFloat(x)+0.3*(i+1)).toFixed(2)})],type:"line",smooth:true,lineStyle:{color:"#ffaa00",width:2,type:"dotted"},itemStyle:{color:"#ffaa00"}}]});chartInstances.tempField=echarts.init(document.getElementById("tempField"));chartInstances.tempField.setOption({tooltip:{trigger:"item"},grid:{left:"12%",right:"15%",top:"10%",bottom:"15%"},xAxis:{type:"category",data:["1#","2#","3#","4#","5#","6#","7#","8#","9#","10#","11#","12#"],axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"}},yAxis:{type:"value",name:"°C",axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"},splitLine:{lineStyle:{color:"rgba(0,212,255,0.2)"}}},series:[{data:sensorData.filter(function(s){return s.type==="温度"}).map(function(s){return s.value}),type:"bar",barWidth:"60%",itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"#ff6644"},{offset:0.5,color:"#ffaa00"},{offset:1,color:"#00d4ff"}]}},label:{show:true,position:"top",color:"#ffaa00",formatter:"{c}°C"}}]});chartInstances.tiltChart=echarts.init(document.getElementById("tiltChart"));chartInstances.tiltChart.setOption({tooltip:{trigger:"axis"},legend:{data:["X轴倾角","Y轴倾角"],textStyle:{color:"#7fdbff"},top:0},grid:{left:"15%",right:"5%",top:"25%",bottom:"15%"},xAxis:{type:"category",data:["1#","2#","3#","4#","5#","6#","7#","8#","9#","10#","11#","12#"],axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"}},yAxis:{type:"value",name:"°",axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"},splitLine:{lineStyle:{color:"rgba(0,212,255,0.2)"}}},series:[{name:"X轴倾角",data:sensorData.filter(function(s){return s.type==="倾角"}).map(function(){return(Math.random()*0.8).toFixed(2)}),type:"line",smooth:true,lineStyle:{color:"#ffaa00"},itemStyle:{color:"#ffaa00"}},{name:"Y轴倾角",data:sensorData.filter(function(s){return s.type==="倾角"}).map(function(){return(Math.random()*0.6).toFixed(2)}),type:"line",smooth:true,lineStyle:{color:"#aa66ff"},itemStyle:{color:"#aa66ff"}}]});chartInstances.strainTime=echarts.init(document.getElementById("strainTime"));var now=new Date();var times=Array.from({length:24},function(_,i){var t=new Date(now-i*3600000);return t.getHours()+":00"}).reverse();var vals=Array.from({length:24},function(){return(Math.random()*40+15).toFixed(1)});chartInstances.strainTime.setOption({tooltip:{trigger:"axis"},grid:{left:"12%",right:"5%",top:"10%",bottom:"20%"},xAxis:{type:"category",data:times,axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff",rotate:45}},yAxis:{type:"value",name:"με",axisLine:{lineStyle:{color:"#00d4ff"}},axisLabel:{color:"#7fdbff"},splitLine:{lineStyle:{color:"rgba(0,212,255,0.2)"}}},series:[{data:vals,type:"line",smooth:true,areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(255,68,68,0.4)"},{offset:1,color:"rgba(255,68,68,0.05)"}]}},lineStyle:{color:"#ff4444"},itemStyle:{color:"#ff4444"}},{data:vals.map(function(v,i){return(parseFloat(v)+i*0.3).toFixed(1)}),type:"line",smooth:true,lineStyle:{color:"#00ff88",type:"dashed"},itemStyle:{color:"#00ff88"}}]});chartInstances.sensorScatter=echarts.init(document.getElementById("sensorScatter"));var scatterData=[];for(var i=0;i<48;i++){scatterData.push([Math.random()*100,Math.random()*100,sensorData[i].value])}chartInstances.sensorScatter.setOption({tooltip:{formatter:"健康度:{a0}% 响应:{a1}%"},grid:{left:"10%",right:"10%",top:"10%",bottom:"15%"},xAxis:{name:"健康度",nameLocation:"center",nameGap:30,axisLine:{lineStyle:{color:"#00d