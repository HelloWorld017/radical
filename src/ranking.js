const fs = require('fs');
const path = require('path');

const RANKING_PATH = path.resolve(__dirname, '..', 'ranking.json');
const REGEX = /^\d{3} [a-zA-Zㄱ-ㅎ가-힣0-9]{1,5}$/;

let ranking = [];
if(fs.existsSync(RANKING_PATH)){
	ranking = JSON.parse(fs.readFileSync(RANKING_PATH, 'utf8'));
}

class RankingManager{
	static push(name, score){
		if(score > 500000) return false;
		if(name.length >= 15) return false;
		if(!REGEX.test(name)) return false;
		ranking.push([name, score]);
		ranking = ranking.sort((a, b) => b[1] - a[1]);
		fs.writeFileSync(RANKING_PATH, JSON.stringify(ranking));
	}

	static get(){
		return JSON.stringify(ranking);
	}
}

module.exports = RankingManager;
