document.addEventListener('DOMContentLoaded', function() {
    // Select all the countdown numbers
    var countdownNumbers = document.querySelectorAll('.countdown-number');
    var countdownSound = new Audio("./asset/mixkit-classic-alarm-995.wav")
    var lastSelectedTime  // Variable to store the last selected time
    var countdownInterval; // Variable to store the interval ID

  countdownNumbers.forEach(function(number) {
        number.addEventListener('click', function() {
            lastSelectedTime = parseInt(this.getAttribute('data-time'), 10) ; // Store the last selected time
            console.log(lastSelectedTime);
            startCountdown(lastSelectedTime);
        });
    });

    // Reset button functionality
    document.getElementById('reset-button').addEventListener('click', function() {
        if (lastSelectedTime > 0) {
            startCountdown(lastSelectedTime); // Restart the countdown
             countdownSound.pause();
        }
    });

    function startCountdown(seconds) {
        var countdown = document.getElementById('countdown-display');
        var countdownTime = seconds;
                // Clear any existing countdown intervals
        clearInterval(countdownInterval);

        // Update the countdown every second
       countdownInterval = setInterval(function() {
   
            var seconds = countdownTime % 60;
            countdown.innerText =  seconds;
            countdownTime--;

            if (countdownTime < 0) {
                clearInterval(countdownInterval);
                countdown.innerText = '00';
                countdownSound.play();
            }
        }, 1000);
    }
});
