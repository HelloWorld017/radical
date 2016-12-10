const fs = require('fs');
const path = require('path');

const RANKING_PATH = path.resolve(__dirname, '..', 'ranking.json');

let ranking = [];
if(fs.existsSync(RANKING_PATH)){
	ranking = JSON.parse(fs.readFileSync(RANKING_PATH, 'utf8'));
}

class RankingManager{
	static push(name, score){
		if(score > 500000) return false;
		ranking.push([name, score]);
		ranking = ranking.sort((a, b) => b[1] - a[1]);
		fs.writeFileSync(RANKING_PATH, JSON.stringify(ranking));
	}

	static get(){
		return JSON.stringify(ranking);
	}
}

module.export = RankingManager;
