const X = 1024;
const Y = 1024;
const MIN_SIZE = 464;
const MAX_SIZE = 480;
const MULTIPLIER = 1.4;

//const randomColorFactor = () => Math.floor(Math.random() * 255);
//const randomColor = () => `rgb(${randomColorFactor()}, ${randomColorFactor()}, ${randomColorFactor()})`;

const colors = [
	'#4fc3f7',
	'#01579b',
	'#1565c0',
	'#03a9f4',
	'#1976d2',
	'#2196f3'
];
const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

let svg = '';
[...Array(32)].map((v, k) => k).forEach((v) => {
	let sizeX = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE)) + MIN_SIZE;
	let sizeY = Math.round(sizeX * MULTIPLIER);
	let	color = randomColor();
	let angle = Math.floor(Math.random() * 360);
	svg += `<path d="M${X} ${Math.round(Y - sizeY)} a${sizeX} ${sizeY} 0 1 1 0 ${Math.round(2 * sizeY)} a${sizeX} ${sizeY} 0, 1, 1, 0, ${Math.round(-2 * sizeY)} z" fill="transparent" stroke-width="2px" stroke="${color}" transform="rotate(${angle} ${X} ${Y})"/>\n`;
});

console.log(svg);
