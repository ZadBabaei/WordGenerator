let easyWords = [
	"شناسنامه",
	"دنده  ",
	"ناف بند ",
	" پاسپورت",
	"لگو  ",
	"  بالش پر",
	" سگدست",
	" کرسی ",
	" ضارب",
	" شراب ",
	"شیاف  ",
	" ناله ",
	" نادم",
	"کفیل ",
	" کنیز",
	" استجاب ",
	"مبادله  ",
	" ضلمت ",
	"سوسمار ",
	" ساقی ",
	" مبادرت ",
	" لواط ",
	" سماور ",
];

let hardWords = [
	"belahat",
	"beraat",
	" belaghat",
	"serafat",
	"sedaghat",
	"rohiat",
	"salsabil",
	"sharlatan",
	"mobaien",
	"nezakat",
];

let pickedWords = [];
let numberOfWords = 0;
let levelOfDifficulty = 0;
let numberOfPlayers = 0;
let maxNumOfWords = 0;
let load = true;

let generateFN = () => {
	numberOfPlayers = document.getElementById("numberOfPlayers").value;
	if (!numberOfPlayers) {
		alert(" number of players can not be empty ");
		load = false;
		return;
	}else{
        load=true;
    }

	numberOfWords = document.getElementById("numWords").value;
	if (!numberOfWords) {
		alert(" Number of Words can not be empty ");
		load = false;
		return;
	} else {
		load = true;
	}
	if (numberOfWords > 20) {
		alert("please chose a number between 1 and 20");
		load = false;
		return;
	} else {
		load = true;
	}
	let printWords = document.getElementById("words-to-print");
	levelOfDifficulty = document.getElementById("diffLevel").value;
	if (!levelOfDifficulty) {
		alert("Level of difficulty can not be empty ");
		load = false;
		return;
	}
    // this block is temporary. it should be removed once we have the database up and running.
    if (levelOfDifficulty>hardWords.length) {
		alert(`Level of difficulty must be less than ${ hardWords.length} `);
		load = false;
		return;
	} else {
		load=true}

	maxNumOfWords = 2 * (numberOfPlayers * numberOfWords);
	let generateWords = document.getElementById("rightCard");
	if (load) {
		generateWords.style.display = "block";
	}

	console.log("level of diff", levelOfDifficulty);
	console.log("numberOfWords", numberOfWords);
	// if (levelOfDifficulty > numberOfWords) {
	// 	alert(" The level of difficulty should be less than or equal to the number of words");
	//     generateWords.style.display = "none";
	// 	return;
	// }
	pickWords();
	for (i = 0; i < numberOfWords; i++) {
		printWords.innerHTML += `<li> ${pickedWords[i]}  </li>`;
	}
};


let pickWords = () => {
	for (let i = 0; pickedWords.length < levelOfDifficulty; i++) {
		rand = Math.random() * hardWords.length;
		let randomWord = hardWords[Math.floor(rand)];
		if (!pickedWords.includes(randomWord)) {
			pickedWords.push(randomWord);
		}
		console.log("in first loop", pickedWords);
	}
	for (let i = pickedWords.length; pickedWords.length < numberOfWords; i++) {
		rand = Math.random() * easyWords.length;
		let randomWord = easyWords[Math.floor(rand)];
		if (!pickedWords.includes(randomWord)) {
			pickedWords.push(randomWord);
		}
	}
};
