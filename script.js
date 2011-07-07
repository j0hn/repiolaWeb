var intervalID, ctx, code, commands, index, registers, labels, pixels, debugEnable;
var speed = 1;

function get(divID){
    return document.getElementById(divID);
}

function debug(txt){
    if(debugEnable){
        d = get("debug");
        d.innerHTML +=  txt + "<br/>";
        d.scrollTop = d.scrollHeight;
    }

}

function start(){
    if(intervalID){
        stop();
    }
    
    get("debug").innerHTML = "";
    debugEnable = get("debugcheck").checked
    
    ctx = get("canvas").getContext("2d");
    code = get("code").value;
    r = [0, 0, 0, 0, 0, 0, 0, 0];
    index = 0;
    labels = [];
    commands = [];
    pixels = null;
    
    parse(code);
	//ctx.fillStyle = "#fff"; // cambiar a negro o lo que sea
	//ctx.fillRect(0, 0, 200, 200);
    //ctx.fillStyle = "#000";
    
    ctx.clearRect(0, 0, 300, 300);
    if(speed == 0){
        loops = 1;
        interval = 10;
    }else if(speed == 1){
        loops = 15;
        interval = 10;
    }else if(speed == 2){
        loops = 25;
        interval = 5;
    }else{
        loops = 1500;
        interval = 1;
    }
    
    intervalID = setInterval(
        function(){
            for(i=0; i<loops; i++){
                draw();
            }
        },interval
    );
}

function stop(){
    clearInterval(intervalID);
}

function setSpeed(value){
    speed = value;
    if(speed == 0){
        get("debugcheck").disabled  = false;
        get("debugcheck").checked = false;
    }
    else{
        get("debugcheck").disabled  = true;
        get("debugcheck").checked = false;
    }
}

function clear(){
    ctx.clearRect(0, 0, 300, 300);
}
function parse(code){
	// Se reemplaza cualquier espacio multiple por uno simple
	code = code.replace(/[^\S^\n]+/g, " ");
	// Se eliminan los comentarios
	code = code.replace(/#.*/g, "");
	// Se eliminan los espacios al final o al principio
	code = code.replace(/\s*\n/g, "\n");
	code = code.replace(/\n\s*/g, "\n");
	// Se divide en un array cada uno representa una linea
	code = code.split("\n");
    
    for(l in code){
        line = code[l];
        line = line.split(" ");
        
        if(line[0] == ":"){
            labels[line[1]] = l;
        }
        
        lineObj = { 
            cmd : line[0],
            param1 : line[1],
            param2 : line[2],
            param3 : line[3]
        }
        commands.push(lineObj);
    }
    
    return commands;
}

function draw(){
    cmd = commands[index];
    if(!cmd){ stop(); }
    switch(cmd.cmd){
        case "put":
            result = resolve(cmd.param1);
            result = C16ToRGB(result);
            debug("put (" + r[0] + " " + r[1] + ") " + result);
            ctx.fillStyle = result;
            ctx.fillRect(r[0], r[1], 1, 1);
        break;
        
        case "set":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] = result;
            debug("set r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "get":        
            image = ctx.getImageData(r[0], r[1], 1, 1);
            pixels = image.data;
            red = pixels[0];
            green = pixels[1];
            blue = pixels[2];
            color = RGBtoC16(red, green, blue);
            
            r[cmd.param1[1]] = color;
            debug("get r" + cmd.param1[1] + " = " + color);
        break;
        
        case "add":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] += result;
            debug("add r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "sub":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] -= result;
            debug("sub r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "mul":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] *= result;
            debug("mul r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "div":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] /= result;
            debug("div r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "mod":
            result = resolve(cmd.param2);
            r[cmd.param1[1]] %= result;
            debug("mod r" + cmd.param1[1] + " " + cmd.param2 + " = " + r[cmd.param1[1]]);
        break;
        
        case "eq":
            v1 = resolve(cmd.param1);
            v2 = resolve(cmd.param2);
            t = "false";
            if(v1 == v2){
                index = labels[cmd.param3];
                t = "true";
            }
            debug("eq " + v1 + " " + v2 + " = " + t);
        break;
        
        case "le":
            v1 = resolve(cmd.param1);
            v2 = resolve(cmd.param2);
            t = "false";
            if(v1 <= v2){
                index = labels[cmd.param3];
                t = "true";
            }
            debug("le " + v1 + " " + v2 + " = " + t);
        break;
        
        case "ge":
            v1 = resolve(cmd.param1);
            v2 = resolve(cmd.param2);
            t = "false";
            if(v1 >= v2){
                index = labels[cmd.param3];
                t = "true";
            }
            debug("ge " + v1 + " " + v2 + " = " + t);
        break;
        
        case "gt":
            v1 = resolve(cmd.param1);
            v2 = resolve(cmd.param2);
            t = "false";
            if(v1 > v2){
                index = labels[cmd.param3];
                t = "true";
            }
            debug("gt " + v1 + " " + v2 + " = " + t);
        break;
        
        case "lt":
            v1 = resolve(cmd.param1);
            v2 = resolve(cmd.param2);
            t = "false";
            if(v1 < v2){
                index = labels[cmd.param3];
                t = "true";
            }
            debug("lt " + v1 + " " + v2 + " = " + t);
        break;
        
        case "jmp":
            index = labels[cmd.param1];
            debug("jmp " + cmd.param1 + " (line " + labels[cmd.param1] + ")");
        break;
        
        case "rnd":
            r[cmd.param1[1]] = Math.round(Math.random() * 0xFFFF);
            debug("rnd " + cmd.param1 + " = " + r[cmd.param1[1]]);
        break;
    }
    
    index++;
}


function resolve(data){
    if(data[0] == "r"){
        return parseInt(r[data[1]]);
    }
    else{
        return parseInt(data);
    }
}

function C16ToRGB(color){
	var bits = (color % 0x7FFF).toString(2);
	
	while( bits.length < 15 ){
		bits = "0" + bits;
	}
	
	var r = parseInt(bits.substr(0, 5), 2)  << 3 | 7;
	var g = parseInt(bits.substr(5, 5), 2)  << 3 | 7;
	var b = parseInt(bits.substr(10, 5), 2) << 3 | 7;
	
	return "rgb(" +r+", "+g+", "+b+")";
}


function RGBtoC16(_r, g, b){
	
	_r = (r >> 3).toString(2);
	while( r.length < 5 ){
		_r = "0" + _r;
	}
	
	g = (g >> 3).toString(2);
	while( g.length < 5 ){
		g = "0" + g;
	}
	
	b = (b >> 3).toString(2);
	while( b.length < 5 ){
		b = "0" + b;
	}
	
	return parseInt(_r + g + b, 2);
}
