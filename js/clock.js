document.addEventListener('DOMContentLoaded', function() {
    var countdownNumbers = document.querySelectorAll('.countdown-number');
    var countdownSound = new Audio("./asset/mixkit-classic-alarm-995.wav");
    var lastSelectedTime;
    var countdownInterval;

    countdownNumbers.forEach(function(number) {
        number.addEventListener('click', function() {
            // Highlight active preset
            countdownNumbers.forEach(n => n.classList.remove('active-preset'));
            this.classList.add('active-preset');

            lastSelectedTime = parseInt(this.getAttribute('data-time'), 10);
            startCountdown(lastSelectedTime);
        });
    });

    document.getElementById('reset-button').addEventListener('click', function() {
        if (lastSelectedTime > 0) {
            startCountdown(lastSelectedTime);
            countdownSound.pause();
            countdownSound.currentTime = 0;
        }
    });

    function startCountdown(seconds) {
        var countdown = document.getElementById('countdown-display');
        var countdownTime = seconds;
        clearInterval(countdownInterval);

        // Show initial value immediately
        countdown.innerText = countdownTime;

        countdownInterval = setInterval(function() {
            countdownTime--;
            countdown.innerText = countdownTime >= 0 ? countdownTime : '00';

            if (countdownTime < 0) {
                clearInterval(countdownInterval);
                countdown.innerText = '00';
                countdown.classList.add('timer-done');
                countdownSound.play();
                setTimeout(() => countdown.classList.remove('timer-done'), 2000);
            }
        }, 1000);
    }
});
