// document.getElementById('start-button').addEventListener('click', function() {
//     const userName = document.getElementById('name').value;
//     const numOfPlayers = document.getElementById('numOfPlayers').value;

//     // Validate input
//     if (!userName || !numOfPlayers) {
//         alert('Please enter your name and number of players.');
//         return;
//     }

//     // Send data to server and handle response
//     sendDataToServer(userName, numOfPlayers).then(sessionId => {
//         // Generate QR code with session ID
//         generateQRCode(sessionId);
//     }).catch(error => {
//         console.error('Error:', error);
//     });
// });

// function sendDataToServer(userName, numOfPlayers) {
//     return new Promise((resolve, reject) => {
//         // Example of sending data to server
//         // Replace with your server URL and implementation
//         fetch('your-server-url', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ userName, numOfPlayers }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             resolve(data.sessionId); // Assuming server responds with a session ID
//         })
//         .catch(error => {
//             reject(error);
//         });
//     });
// }

function generateQRCode(sessionId) {
    // You can use a library like QRCode.js or an API to generate QR codes
    // Example using QRCode.js
    const qrCodeContainer = document.querySelector('.image-QrCode');
    qrCodeContainer.style.visibility = 'visible';
    new QRCode(qrCodeContainer, {
        text: 'your-word-generation-page-url?sessionId=' + sessionId,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}
function generateQrCode(){
    let ISname = document.getElementById("name");
    let IsNumPlyr = document.getElementById("numOfPlayers");
    if (!ISname.value){
        alert("Please Enter Your name")
        return
    }
    if(!IsNumPlyr.value){
        alert("Please Enter the number of player")
        return
    }
    let generateQrCode = document.getElementById("imageQrCode");
		generateQrCode.style.display = "block";
}