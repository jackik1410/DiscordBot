
const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

function Betrag(zahl){
	if(zahl < 0){
		zahl *= -1;
	}
	return zahl;
}

function checkAllMoves(checkboard[rangeX][rangeY], content, player, posX, posY, moveX, moveY) {
		// target position on board is already checked! No invalid (off board) coordinates passed.
	if(posX==moveX && posY==moveY) return false;//check for no move
	if(owner(posX, posY)!=player) {//shouldn't happen
		Color(0,4);//KRED
		printf("\nnot your piece!\n");
		Color(0,15);//nocolor
		ErrorMsg(__COUNTER__, "unknown error");//probably artificial input, such as an error in checkBoard()
		return false;
	}
	if(owner(moveX, moveY)==player) return false;//check if slaying own piece
	if (content == 0) {//shouldn't happen
		Color(0,4);//KRED
		printf("\nempty square\n");
		Color(0,15);//nocolor
		return false;
	}

	//check if move leads to check for current play, then deny move

	var deltaX = moveX-posX;//for checking moves
	var deltaY = moveY-posY;

	switch (content%6) { //checking moves for all pieces, ignoring player
					//remember checking for path for other pieces and collisions!!!
		case 0://pawn 6 12
			if (deltaX == 0) {
				if( ((player == 0)&&(deltaY==-1)) || ((player == 1)&&(deltaY==1))){
					if (checkboard[moveX][moveY]==0) {//checking for collision on normal move
						return true;//normal move forward
					}
					return false;//collision
				} else {
					if((player == 0 && posY==6 && deltaY==-2) || (player==1 && posY==1 && deltaY==2)){//double move if not moved
						if (checkboard[moveX][moveY]==0) {//checking for collision on normal move
							return true;//double move forward
						}
						return false;//collision
					}
				return false;
				}
			}
			if (Betrag(deltaX) == 1 && ((player==0 && deltaY==1) || (player==1 && deltaY==-1)) ) {//check for enemy piece taking
				if (checkboard[moveX][moveY] != 0 && owner(moveX, moveY) != player) return true; //slay piece if move valid, piece there and not your piece
			}
			return false;
			break;
		case 5://king 5 11
			if((-1<=deltaX && deltaX<=1) && (-1<=deltaY && deltaY<=1)){
				return true;
			}
			return false;
			break;
		case 4://queen 4 10, check rook and bishop for movment
				if (1==checkAllMoves( checkboard, 1+6*player, player, posX, posY, moveX, moveY) || 1==checkAllMoves( checkboard, 3+6*player, player, posX, posY, moveX, moveY)) return true;//check details for rook and bishop movement
				return false;
			break;
		case 1://rook 1 7
			if((deltaX==0 && deltaY!=0) || (deltaY==0 && deltaX!=0)) {//check if movement is only along 1 axis
				var delta=Betrag(deltaX+deltaY);//equals movement, as one of them is 0
				//printf("\nBetrag = %d", delta);
				for (int n = 1; n < delta; n++) {//check for path but not final position
					if(checkboard[deltaX/delta * n + posX][deltaY/delta * n + posY]!=0) return false;
					//printf("  n = %d, x= %d, y= %d\n", n, deltaX/delta * n + posX, deltaY/delta * n + posY);
				}
				if(owner(moveX, moveY)==player) return false; //can't move if own piece, only if empty or enemy
				return true;
			}
			return false;
			break;
		case 2://knight = Springer  2 8
			if( (Betrag(deltaX)==1 && Betrag(deltaY)==2) || (Betrag(deltaX)==2 && Betrag(deltaY)==1) ){
				if(checkboard[moveX][moveY]==0) { //check collision
					return true;
				}else{
					return false;
				}
			} else return false;
			break;
		case 3://bishop 3 9
			if(Betrag(deltaX)==Betrag(deltaY) && deltaX!=0){//check basic validity
				var dx = deltaX / Betrag(deltaX); //needed for iterative square check
				var dy = deltaY / Betrag(deltaY);
				var distance = Betrag(deltaX);
				for (int n = 1; n < distance; n++) {
					if (checkboard[dx*n + posX][dy*n + posY] != 0) return false; //cancel on finding obstacle (not include final position)
				}
				if (owner(moveX, moveY) != player) return true;//only slay pieces if final location not own piece!
			}
			return false;//invalid move
			break;
		default:
			Color(0,4);//KRED
			printf("\n error checking move! (piece not found)\n");
			printf("piece num = %d\n", content);
			ErrorMsg(__COUNTER__, "unknown error");
			Color(0,15);//nocolor
			return false;
	}
	ErrorMsg(__COUNTER__,"error checking move!");
	return false;

}
