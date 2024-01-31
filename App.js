
let Fars_easyWords = [
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

const easyWords = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon', 'yellowfruit'];

let currentWordList = easyWords;

// Function to generate a list of 10 random words
function generateRandomWords(wordList, count) {
  let words = [];
  for (let i = 0; i < count; i++) {
    // Get a random index based on the length of the wordList
    const randomIndex = Math.floor(Math.random() * wordList.length);
    // Push the word at the random index into the words array
    words.push(wordList[randomIndex]);
  }
  return words;
}

// Function to update the word list display
function updateWordListDisplay(words) {
  const wordListContainer = document.querySelector('.word-list');
  // Clear current words
  wordListContainer.innerHTML = '';
  // Add new words to the word list container
  words.forEach((word, index) => {
const wordElement = document.createElement('div');
    wordElement.className = 'word';
    wordElement.textContent = `${index + 1}- ${word}`;
    wordListContainer.appendChild(wordElement);
  });
}

// Function to handle generate button click
function handleGenerateClick() {
  const randomWords = generateRandomWords(currentWordList, 10);
  updateWordListDisplay(randomWords);
}

// Function to handle reload button click
function handleReloadClick() {
  handleGenerateClick(); // Simply call the handleGenerateClick as it does the same job
}

// Function to handle select button click
function handleSelectClick() {
  const selectedWords = Array.from(document.querySelectorAll('.word')).map(wordDiv => wordDiv.textContent.split('- ')[1]);
  // Assuming you want to store these selected words somewhere
  window.selectedWordsList = selectedWords; // This will create a global variable `selectedWordsList`
  console.log('Selected words:', window.selectedWordsList); // This line is for demonstration, it logs the selected words to the console
}

// Add event listeners to buttons
document.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generate');
  const reloadButton = document.getElementById('reload');
  const selectButton = document.getElementById('select');
 const englishSelector = document.getElementById('eng'); 
  const farsiSelector = document.getElementById('farsi'); 

  generateButton.addEventListener('click', handleGenerateClick);
  reloadButton.addEventListener('click', handleReloadClick);
  selectButton.addEventListener('click', handleSelectClick);

  // Event listeners for language selection
  englishSelector.addEventListener('click', function() {
    currentWordList = easyWords;
    this.classList.add('active-language');
    farsiSelector.classList.remove('active-language');
    handleWordGeneration(); 
  });

  farsiSelector.addEventListener('click', function() {
    currentWordList = Fars_easyWords;
    // Optionally highlight the active language
    this.classList.add('active-language');
    englishSelector.classList.remove('active-language');
    handleWordGeneration(); // Generate words immediately upon language selection
  });
});

