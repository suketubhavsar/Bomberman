var canvas;
var context ;
var blockSize;
var gameMatrix=[];
var img=[];
var imgBomb;
var imgEnemyRight;
var imgEnemyLeft;
var imgExplosion=[];
var imgPlayer=[];
var imgGate;
var rowCount=13;
var colCount=23;
var gate = {pos:{x:1,y:1}, isOpen:0};
var bombPos = {x:1,y:1};
var bombTicking=-1;
var bombExplosionLength=1;
//direction 0=East, 1=West
const player = {pos:{x:1, y:1}, direction:0, isAlive:1, life:2};
var playerSpeed=1;
var enemySpeed=1;
var enemies=[];
var explosionMatrix=[]
var GameWon=0;

function Enemy(X, Y, D){
	return {
		pos:{x:X,y:Y},
		direction:D,
		step:1,
		isAlive:1,
		blink:Math.floor(1*Math.random())
	};
}

window.onload = function () {
	canvas=document.getElementById('canvas');
	context = canvas.getContext('2d');
	blockSize=canvas.height/15;

	loadImages();
	loadNewGame();
	
	document.addEventListener('keydown', event => {
		context.drawImage(img[2], blockSize*player.pos.y,blockSize*(player.pos.x+2), blockSize,blockSize);
		if (event.keyCode === 37) {
			//Left arrow
			//move player 1 step left
			playerMove(-playerSpeed, "W");
		} else if (event.keyCode === 38) {
			//Up arrow
			//move player 1 step up
			playerMove(-playerSpeed, "N");
		} else if (event.keyCode === 39) {
			//Right arrow
			//move player 1 step right
			playerMove(playerSpeed, "E");
		} else if (event.keyCode === 40) {
			//Down arrow
			//move player 1 step down
			playerMove(playerSpeed, "S");
		} else if (event.keyCode === 32) {
			//space
			//place bomb
			if(bombTicking==-1){
				bombPos.x=player.pos.x;
				bombPos.y=player.pos.y;
				bombTicking=0;
				drawBomb();
			}
		}
		drawPlayer();
	});
	
	setInterval(function(){
		if(GameWon==1){
			alert("Congratulations, You have escaped!");
			loadNewGame();
		}else {
			if(player.isAlive==1 || bombTicking > -1){
				//console.log("beeting...");
				if(isWithinExplosion(player.pos.x,player.pos.y)){
					player.isAlive=0;
				}
				enemyMove();
				drawEverything();
				if(bombTicking > -1){
					bombTicking++;
					drawBomb();
				}
			}else {
				player.life-=1;
				player.isAlive=1;
				if(player.life<=0){
					alert("Game over!");
					loadNewGame();
				}
			}
		}
	}, 400);
	
}

function loadNewGame(){
	bombTicking=-1;
	player.pos.x=1;
	player.pos.y=1;
	player.direction=0;
	player.isAlive=1;
	player.life=2;
	GameWon=0;
	gate.isOpen=0;
	createGame();
	createEnemies();
	drawEverything();
}

function drawEverything(){
	drawGame();
	drawScoreBoard();
	drawGate();
	drawPlayer();
	drawEnemies();
}


function loadImages(){
	img[0]=document.getElementById("TileBorder");
	img[1]=document.getElementById("TileSolid");
	img[2]=document.getElementById("TileGreen");
	img[3]=document.getElementById("TileBrick");
	img[4]=document.getElementById("TileBrickBurning1");
	img[5]=document.getElementById("TileBrickBurning2");
	
	
	imgBomb=document.getElementById("bomb");

	imgExplosion[0]=document.getElementById("bombExplosionCenter");
	imgExplosion[1]=document.getElementById("bombExplosionHorizontal");
	imgExplosion[2]=document.getElementById("bombExplosionHorizontalEndLeft");
	imgExplosion[3]=document.getElementById("bombExplosionHorizontalEndRight");
	imgExplosion[4]=document.getElementById("bombExplosionVertical");
	imgExplosion[5]=document.getElementById("bombExplosionVerticalEndTop");
	imgExplosion[6]=document.getElementById("bombExplosionVerticalEndBottom");
	
	imgPlayer[0]=document.getElementById("PlayerEast");
	imgPlayer[1]=document.getElementById("PlayerWest");
	
	imgEnemyRight=document.getElementById("EnemyRight");
	imgEnemyLeft=document.getElementById("EnemyLeft");
	
	imgGate=document.getElementById("Gate");
}

function createGame(){
	gameMatrix=new Array(rowCount);
	for(i=0;i<rowCount;i++){
		gameMatrix[i]=new Array(colCount);
	}
	
	//border
	for(i=0;i<rowCount;i++){
		gameMatrix[i][0]=0;
		gameMatrix[i][colCount-1]=0;
	}
	for(j=0;j<colCount;j++){
		gameMatrix[0][j]=0;
		gameMatrix[rowCount-1][j]=0;
	}

	//background
	for(i=1;i<rowCount-1;i++){
		for(j=1;j<colCount-1;j++){
			gameMatrix[i][j]=2;
		}
	}

	//solid blocks
	for(i=1;i<rowCount-2;i++){
		i++;
		for(j=1;j<colCount-2;j++){
			j++;
			//console.log("i: "+i+"; j:"+j);
			gameMatrix[i][j]=1;
		}
	}

	//bricks
	var gCount=15;
	for(i=1;i<rowCount-1;i++){
		for(j=1;j<colCount-1;j++){
			if(i%2 !=0 || j%2!=0){
				if(!((i==1 && j==1) || (i==1 && j==2) || (i==2 && j==1))){
					if(Math.floor(5 * Math.random() | 0)==1 ){
						gameMatrix[i][j]=3;
						gCount-=1;
						if(gCount==0){
							gate.pos.x=i;
							gate.pos.y=j;
						}
					}	
				}
			}
		}
	}
	
}


function createEnemies(){
	var newenemies=[];
	var enemycount=Math.floor(Math.random() * 15) +1;
	var rand = [];
	while(rand.length<enemycount) {
		var r=Math.floor(Math.random() * ((rowCount-2)*(colCount-2))) +3;
		if(rand.indexOf(r)<0){
			rand.push(r);
		}
	}
	rand.sort();
	var r=0;
	for(x=1;x<rowCount-1;x++){
		for(y=1;y<colCount-1;y++){
			r++;
			if(!((x==1 && y==1) || (x==1 && y==2) || (x==2 && y==1))){
				if(rand.indexOf(r)>=0){
					if(gameMatrix[x][y]==2){
						newenemies.push(new Enemy(x,y, (Math.floor(Math.random() * 3))));
					}
				}
			}
		}
	}
	enemies=newenemies;
}

function playerMove(step, direction){
	if(player.isAlive==1){
		if(direction=="N" || direction=="S"){
			player.pos.x+=step;
			if(player.pos.x<1 || player.pos.x>rowCount-1 || gameMatrix[player.pos.x][player.pos.y]!=2 || isBomb(player.pos.x,player.pos.y)){
				player.pos.x-=step;
			}
		}else if(direction=="E" || direction=="W"){
			player.pos.y+=step;
			if(player.pos.y<1 || player.pos.y>colCount-1 || gameMatrix[player.pos.x][player.pos.y]!=2 || isBomb(player.pos.x,player.pos.y)){
				player.pos.y-=step;
			}
			player.direction=(direction=="E"? 0:1);
		}
		if(isWithinExplosion(player.pos.x,player.pos.y) || isPlayerColidedWithEnemy()){
			player.isAlive=0;
		}
		if(gate.isOpen==1 && gate.pos.x==player.pos.x && gate.pos.y==player.pos.y){
			GameWon=1;
		}
	}
}

function isPlayerColidedWithEnemy(){
	for(idx=0;idx<enemies.length;idx++){
		if(enemies[idx].isAlive==1 && player.pos.x==enemies[idx].pos.x && player.pos.y==enemies[idx].pos.y){
			return true;
		}
	}
	return false;
}


function isBomb(x,y){
	return (bombTicking>=0 && bombPos.x==x && bombPos.y==y);
}
function isWithinExplosion(x,y){
	if(bombTicking>10 && 16>bombTicking){
		for(idx=0;idx<explosionMatrix.length;idx++){
			if(explosionMatrix[idx].x==x && explosionMatrix[idx].y==y){
				return true;
			}
		}
	}
	return false;
}
function isInGameMatrix(x,y){
	return (x>1 && x<colCount-1 && y>1 && y<rowCount-1);
}
function enemyMove(){
	for(i=0;i<enemies.length;i++){
		if(enemies[i].isAlive==1){
			if(enemies[i].direction==0){
				enemies[i].pos.y--;
				if(enemies[i].pos.y<1 || enemies[i].pos.y>colCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y]!=2 || isBomb(enemies[i].pos.x,enemies[i].pos.y)){
					enemies[i].pos.y++;
					if(enemies[i].pos.y+1<1 || enemies[i].pos.y+1>colCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y+1]!=2){
						enemies[i].direction=2;
					}else{				
						enemies[i].direction=1;
					}
				}else  {
					enemies[i].step=5;
				}
			}else if(enemies[i].direction==1){
				enemies[i].pos.y++;
				if(enemies[i].pos.y<1 || enemies[i].pos.y>colCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y]!=2 || isBomb(enemies[i].pos.x,enemies[i].pos.y)){
					enemies[i].pos.y--;
					if(enemies[i].pos.y-1<1 || enemies[i].pos.y-1>colCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y-1]!=2){
						enemies[i].direction=2;
					}else{
						enemies[i].direction=0;
					}
				}else  {
					enemies[i].step=5;
				}
			}else if(enemies[i].direction==2){
				enemies[i].pos.x--;
				if(enemies[i].pos.x<1 || enemies[i].pos.x>rowCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y]!=2 || isBomb(enemies[i].pos.x,enemies[i].pos.y)){
					enemies[i].pos.x++;
					if(enemies[i].pos.x+1<1 || enemies[i].pos.x+1>rowCount-1 || gameMatrix[enemies[i].pos.x+1][enemies[i].pos.y]!=2){
						enemies[i].direction=0;
					}else {
						enemies[i].direction=3;
					}
				}else  {
					enemies[i].step=5;
				}
			}else if(enemies[i].direction==3){
				enemies[i].pos.x++;
				if(enemies[i].pos.x<1 || enemies[i].pos.x>rowCount-1 || gameMatrix[enemies[i].pos.x][enemies[i].pos.y]!=2 || isBomb(enemies[i].pos.x,enemies[i].pos.y)){
					enemies[i].pos.x--;
					if(enemies[i].pos.x-1<1 || enemies[i].pos.x-1>rowCount-1 || gameMatrix[enemies[i].pos.x-1][enemies[i].pos.y]!=2){
						enemies[i].direction=0;
					}else {
						enemies[i].direction=2;
					}
				}else  {
					enemies[i].step=5;
				}
			}
			if(isWithinExplosion(enemies[i].pos.x, enemies[i].pos.y)){
				//console.log(enemies);
				//console.log(i);
				enemies[i].isAlive=0;
			}
		}
	}
	if(isPlayerColidedWithEnemy()){
		player.isAlive=0;
	}
}

function drawScoreBoard(){
	context.globalAlpha=1;
	for(i=0;i<2;i++){
		for(j=0;j<colCount;j++){
			context.drawImage(img[0], blockSize*j,blockSize*i, blockSize,blockSize);
		}
	}
	//Draw player life
	context.drawImage(imgPlayer[0], blockSize+(blockSize*.15),blockSize+(blockSize*.15), blockSize*.70,blockSize*.70);
	//drawText(player.life, (blockSize*2)+(blockSize*.5),blockSize+(blockSize*.5))
	drawText(player.life, blockSize*2,blockSize,blockSize,blockSize);
	//draw enemy count
	context.drawImage(imgEnemyRight, (blockSize*6)+(blockSize*.15),blockSize+(blockSize*.15), blockSize*.70,blockSize*.70);
	var eCnt=0
	for(idx=0; idx<enemies.length;idx++){
		eCnt+=enemies[idx].isAlive;
	}
	drawText(eCnt, (blockSize*7),blockSize,blockSize,blockSize);
}

function drawText(txt, x,y, w, h){
	context.fillStyle='black';
	context.fillRect(x,y,w,h);
	context.fillStyle='red';
	context.font="16px Sans-Serif";
	context.textAlign="center";
	context.textBaseline = 'middle';
	var pad="00"+txt;
	context.fillText(pad.substring(pad.length-2,pad.length) ,x+(w/2),y+(h/2));

}

function drawGame(){
	context.globalAlpha=1;
	for(i=0;i<rowCount;i++){
		for(j=0;j<colCount;j++){
			context.drawImage(img[gameMatrix[i][j]], blockSize*j,blockSize*(i+2), blockSize,blockSize);
		}
	}
}

function drawGate(){
	if(gate.isOpen==1){
		context.drawImage(imgGate, blockSize*gate.pos.y,blockSize*(gate.pos.x+2), blockSize,blockSize);
	}
}

function drawPlayer(){
	if(player.isAlive==1 || (bombTicking > -1 && bombTicking <14)){
		context.drawImage(imgPlayer[player.direction], blockSize*player.pos.y,blockSize*(player.pos.x+2), blockSize,blockSize);
	}
}

function drawEnemies(){
	for(i=0;i<enemies.length;i++){
		if(enemies[i].isAlive==1){
			context.drawImage(img[gameMatrix[enemies[i].pos.x][enemies[i].pos.y]], blockSize*enemies[i].pos.y,blockSize*(enemies[i].pos.x+2), blockSize,blockSize);
			var x=0;
			var y=0;
			var w=0;
			var h=0;
			if(enemies[i].blink==0){
				y=blockSize*enemies[i].pos.y+(blockSize*0.15);//-(enemies[i].direction<=1? blockSize-(blockSize/enemies[i].step):0);
				if(enemies[i].step>1)enemies[i].step--;
				x=blockSize*(enemies[i].pos.x+2);
				w=blockSize/1.30;
				h=blockSize;
				enemies[i].blink=1;
			} else {
				y=blockSize*enemies[i].pos.y;
				x=blockSize*(enemies[i].pos.x+2)+(blockSize*0.15);//-(enemies[i].direction>1? blockSize-(blockSize/enemies[i].step):0);;
				if(enemies[i].step>1)enemies[i].step--;
				w=blockSize;
				h=blockSize/1.30;
				enemies[i].blink=0;
			}
			if(enemies[i].direction==2 || enemies[i].direction==0){
				context.drawImage(imgEnemyLeft, y,x, w,h);
			}else {
				context.drawImage(imgEnemyRight, y,x, w,h);
			}
		}else if(bombTicking>10 && 14>bombTicking) {
			context.globalAlpha=1/(bombTicking-10);
			context.drawImage(imgEnemyRight, blockSize*(enemies[i].pos.x+2), blockSize*enemies[i].pos.y, blockSize,blockSize);
			context.globalAlpha=1;
		}else if(bombTicking>14){
			enemies.splice(i,1);
		}
	}
}

/*
function getImageBrighness(img, contrast){
		var can = document.createElement("canvas");
		can.width=blockSize;
		can.height=blockSize;
		var ctx=can.getContext('2d');
		ctx.drawImage(img, 0,0, blockSize,blockSize);
		var idata=ctx.createImageData(blockSize,blockSize);
		var data=idata.data;
		for (var i = 0; i < data.length; i += 4) {
		 //var contrast = 10;
		 var average = Math.round( ( data[i] + data[i+1] + data[i+2] ) / 3 );
		  if (average > 127){
			data[i] += ( data[i]/average ) * contrast;
			data[i+1] += ( data[i+1]/average ) * contrast;
			data[i+2] += ( data[i+2]/average ) * contrast;
		  }else{
			data[i] -= ( data[i]/average ) * contrast;
			data[i+1] -= ( data[i+1]/average ) * contrast;
			data[i+2] -= ( data[i+2]/average ) * contrast;
		  }
		}
		return idata;	
}
*/

function drawBomb(){
	try{
	if(bombPos.x>0 && rowCount>bombPos.x && bombPos.y>0 && colCount>bombPos.y ){
		if(bombTicking>10 && 16>bombTicking){
			if(bombTicking==11)fillExplosionMatrix();
			drawExplodeBomb();
		}
		else if(bombTicking<11){
			context.drawImage(img[2], blockSize*bombPos.y,blockSize*(bombPos.x+2), blockSize,blockSize);
			if(bombTicking%2==0){
				context.drawImage(imgBomb, (blockSize*bombPos.y) + (blockSize/6),(blockSize*(bombPos.x+2))+ (blockSize/6), blockSize/1.25,blockSize/1.25);
			}else{
				context.drawImage(imgBomb, blockSize*bombPos.y,blockSize*(bombPos.x+2), blockSize,blockSize);
			}
			//console.log("bomb drawn...");

		}
		if(bombTicking>16){
			bombTicking=-1;
		}
	}
		}catch(err){console.log(err.message);}
}

function fillExplosionMatrix(){
	var newMatrix=[];
	newMatrix.push({x:bombPos.x,y:bombPos.y});
	for(i=bombExplosionLength;i>0;i--){
		if(bombPos.x-i>0 && gameMatrix[bombPos.x-i][bombPos.y]>1 ){
			newMatrix.push({x:bombPos.x-i,y:bombPos.y});
		}
		if(bombPos.x+i<rowCount && gameMatrix[bombPos.x+i][bombPos.y]>1 ){
			newMatrix.push({x:bombPos.x+i,y:bombPos.y});
		}
		if(bombPos.y-i>0 && gameMatrix[bombPos.x][bombPos.y-i]>1 ){
			newMatrix.push({x:bombPos.x,y:bombPos.y-i});
		}
		if(bombPos.y+i<colCount && gameMatrix[bombPos.x][bombPos.y+i]>1 ){
			newMatrix.push({x:bombPos.x,y:bombPos.y+i});
		}
	}	
	explosionMatrix=newMatrix;
}

function drawExplodeBomb(){
	try{
	if(bombPos.x>0 && rowCount>bombPos.x && bombPos.y>0 && colCount>bombPos.y ){
		//Center explosion
		context.globalAlpha=1;
		context.drawImage(img[2], blockSize*bombPos.y,blockSize*(bombPos.x+2), blockSize,blockSize);
		context.globalAlpha=1/(bombTicking-10);
		context.drawImage(imgExplosion[0], blockSize*bombPos.y,blockSize*(bombPos.x+2), blockSize,blockSize);
		
		//Top explosion
		context.globalAlpha=(bombTicking-10)/5;
		for(i=bombExplosionLength;i>0;i--){
			if(bombPos.x-i>0 && gameMatrix[bombPos.x-i][bombPos.y]>1 ){
				imgTemp=(gameMatrix[bombPos.x-i][bombPos.y]==3? img[(bombTicking<14?4 :5)] : img[2]);
				context.globalAlpha=(bombTicking-10)/5;
				context.drawImage(imgTemp,blockSize*(bombPos.y),blockSize*(bombPos.x+2-i), blockSize,blockSize);
				context.globalAlpha=1/(bombTicking-10);
				context.drawImage(imgExplosion[(i==bombExplosionLength?5 :4)],blockSize*(bombPos.y),blockSize*(bombPos.x+2-i), blockSize,blockSize);
				if(bombTicking>=15)gameMatrix[bombPos.x-i][bombPos.y]=openGate(bombPos.x-i,bombPos.y);
			}
			if(bombPos.x+i<rowCount && gameMatrix[bombPos.x+i][bombPos.y]>1 ){
				context.globalAlpha=(bombTicking-10)/5;
				imgTemp=(gameMatrix[bombPos.x+i][bombPos.y]==3? img[(bombTicking<14?4 :5)] : img[2]);
				context.drawImage(imgTemp,blockSize*(bombPos.y),blockSize*(bombPos.x+2+i), blockSize,blockSize);
				context.globalAlpha=1/(bombTicking-10);
				context.drawImage(imgExplosion[(i==bombExplosionLength?6 :4)],blockSize*(bombPos.y),blockSize*(bombPos.x+2+i), blockSize,blockSize);
				if(bombTicking>=15)gameMatrix[bombPos.x+i][bombPos.y]=openGate(bombPos.x+i,bombPos.y);
			}
			if(bombPos.y-i>0 && gameMatrix[bombPos.x][bombPos.y-i]>1 ){
				context.globalAlpha=(bombTicking-10)/5;
				imgTemp=(gameMatrix[bombPos.x][bombPos.y-i]==3? img[(bombTicking<14?4 :5)] : img[2]);
				context.drawImage(imgTemp,blockSize*(bombPos.y-i),blockSize*(bombPos.x+2), blockSize,blockSize);
				context.globalAlpha=1/(bombTicking-10);
				context.drawImage(imgExplosion[(i==bombExplosionLength?2 :1)],blockSize*(bombPos.y-i),blockSize*(bombPos.x+2), blockSize,blockSize);
				if(bombTicking>=15)gameMatrix[bombPos.x][bombPos.y-i]=openGate(bombPos.x,bombPos.y-i);
			}
			if(bombPos.y+i<colCount && gameMatrix[bombPos.x][bombPos.y+i]>1 ){
				context.globalAlpha=(bombTicking-10)/5;
				imgTemp=(gameMatrix[bombPos.x][bombPos.y+i]==3? img[(bombTicking<14?4 :5)] : img[2]);
				context.drawImage(imgTemp,blockSize*(bombPos.y+i),blockSize*(bombPos.x+2), blockSize,blockSize);
				context.globalAlpha=1/(bombTicking-10);
				context.drawImage(imgExplosion[(i==bombExplosionLength?3 :1)],blockSize*(bombPos.y+i),blockSize*(bombPos.x+2), blockSize,blockSize);
				if(bombTicking>=15)gameMatrix[bombPos.x][bombPos.y+i]=openGate(bombPos.x,bombPos.y+i);
			}
		}
		context.globalAlpha=1;
	}
		}catch(err){console.log(err.message);}

}

function openGate(x,y){
	if(gate.pos.x==x && gate.pos.y==y)gate.isOpen=1;
	return 2;
}

function canvas_onclick(c, event) {
}


/*
function drawBox(topX, leftY, boxWidth, boxHeight, topColor, rightColor, bottomColor, leftColor, topBorder, rightBorder, bottomBorder, leftBorder) {
	var linesize=boxWidth;
	
	context.fillStyle=topColor;
	for(var i=0;i<topBorder;i++) {
		context.fillRect(topX+i, leftY+i, linesize,1);
		linesize -=2;
	}

	linesize=boxHeight;
	context.fillStyle=rightColor;
	for(var i=0;i<rightBorder;i++) {
		context.fillRect(topX+boxWidth-i, leftY+i, 1, linesize);
		linesize -=2;
	}

	linesize=boxWidth;
	context.fillStyle=bottomColor;
	for(var i=0;i<bottomBorder;i++) {
		context.fillRect(topX+i+1, leftY+boxHeight-i, linesize,1);
		linesize -=2;
	}

	linesize=boxHeight;
	context.fillStyle=leftColor;
	for(var i=0;i<leftBorder;i++) {
		context.fillRect(topX+i, leftY+i, 1, linesize+1);
		linesize -=2;
	}
}
*/
