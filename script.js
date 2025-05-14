document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Clock Mode
    const timeDisplay = document.getElementById('time');
    const dateDisplay = document.getElementById('date');
    const themeToggle = document.getElementById('theme-toggle');
    const alarmToggle = document.getElementById('alarm-toggle');
    const alarmPopup = document.getElementById('alarm-popup');
    const alarmHour = document.getElementById('alarm-hour');
    const alarmMinute = document.getElementById('alarm-minute');
    const setAlarmBtn = document.getElementById('set-alarm');
    const cancelAlarmBtn = document.getElementById('cancel-alarm');
    const alarmStatus = document.getElementById('alarm-status');
    
    // DOM Elements - Navigation
    const navbarToggle = document.getElementById('navbar-toggle');
    const mainNav = document.getElementById('main-nav');
    const navItems = document.querySelectorAll('#main-nav li');
    const modeContainers = document.querySelectorAll('.mode-container');
    
    // DOM Elements - Timer Mode
    const timerMinute = document.getElementById('timer-minute');
    const timerSecond = document.getElementById('timer-second');
    const timerDisplay = document.getElementById('timer-time');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerProgress = document.querySelector('.timer-progress');
    
    // DOM Elements - Settings Mode
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const alarmSoundRadios = document.querySelectorAll('input[name="alarm-sound"]');
    const previewButtons = document.querySelectorAll('.preview-sound');
    
    // Audio Elements
    const alarmSounds = {
        alarm1: document.getElementById('alarm-sound-1'),
        alarm2: document.getElementById('alarm-sound-2'),
        alarm3: document.getElementById('alarm-sound-3')
    };
    
    // Variables
    let alarmTime = null;
    let isDarkTheme = true;
    let currentAlarmSound = 'alarm1';
    let timerInterval = null;
    let timerTotalSeconds = 0;
    let timerRemainingSeconds = 0;
    let timerIsRunning = false;
    
    // Initialize
    updateClock();
    setInterval(updateClock, 1000);
    loadSavedSettings();
    
    // Mode Switching
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // Update navigation UI
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Switch mode container
            modeContainers.forEach(container => container.classList.remove('active'));
            document.getElementById(`${mode}-mode`).classList.add('active');
        });
    });
    
    // Functions to update the clock
    function updateClock() {
        const now = new Date();
        
        // Update time
        const hours = padZero(now.getHours());
        const minutes = padZero(now.getMinutes());
        const seconds = padZero(now.getSeconds());
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Update date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('id-ID', options);
        
        // Check alarm
        checkAlarm(hours, minutes);
    }
    
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }
    
    // Theme toggle
    themeToggle.addEventListener('click', function() {
        toggleTheme();
    });
    
    function toggleTheme() {
        const body = document.body;
        isDarkTheme = !isDarkTheme;
        
        if (isDarkTheme) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            document.querySelector('input[name="theme"][value="dark"]').checked = true;
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            document.querySelector('input[name="theme"][value="light"]').checked = true;
        }
        
        // Save theme preference
        localStorage.setItem('clockTheme', isDarkTheme ? 'dark' : 'light');
    }
    
    // Settings listeners
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'dark' && !isDarkTheme) {
                toggleTheme();
            } else if (this.value === 'light' && isDarkTheme) {
                toggleTheme();
            }
        });
    });
    
    alarmSoundRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentAlarmSound = this.value;
            localStorage.setItem('clockAlarmSound', currentAlarmSound);
        });
    });
    
    previewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sound = this.getAttribute('data-sound');
            previewAlarmSound(sound);
        });
    });
    
    function previewAlarmSound(sound) {
        // Stop any playing sounds first
        Object.values(alarmSounds).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // Play the selected sound
        alarmSounds[sound].play();
        
        // Stop after 3 seconds (preview only)
        setTimeout(() => {
            alarmSounds[sound].pause();
            alarmSounds[sound].currentTime = 0;
        }, 3000);
    }
    
    // Load saved settings
    function loadSavedSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('clockTheme');
        if (savedTheme) {
            isDarkTheme = savedTheme === 'dark';
            const body = document.body;
            
            if (isDarkTheme) {
                body.classList.add('dark-theme');
                body.classList.remove('light-theme');
                document.querySelector('input[name="theme"][value="dark"]').checked = true;
            } else {
                body.classList.add('light-theme');
                body.classList.remove('dark-theme');
                document.querySelector('input[name="theme"][value="light"]').checked = true;
            }
        }
        
        // Load alarm sound preference
        const savedAlarmSound = localStorage.getItem('clockAlarmSound');
        if (savedAlarmSound) {
            currentAlarmSound = savedAlarmSound;
            document.querySelector(`input[name="alarm-sound"][value="${currentAlarmSound}"]`).checked = true;
        }
        
        // Load alarm
        const savedAlarm = localStorage.getItem('clockAlarm');
        if (savedAlarm) {
            alarmTime = JSON.parse(savedAlarm);
            alarmHour.value = parseInt(alarmTime.hour);
            alarmMinute.value = parseInt(alarmTime.minute);
            alarmStatus.textContent = `Alarm set for ${alarmTime.hour}:${alarmTime.minute}`;
        }
    }
    
    // Alarm functionality
    alarmToggle.addEventListener('click', function() {
        alarmPopup.style.display = alarmPopup.style.display === 'block' ? 'none' : 'block';
    });
    
    setAlarmBtn.addEventListener('click', function() {
        const hour = parseInt(alarmHour.value);
        const minute = parseInt(alarmMinute.value);
        
        if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
            alarmStatus.textContent = 'Please enter valid time';
            return;
        }
        
        alarmTime = {
            hour: padZero(hour),
            minute: padZero(minute)
        };
        
        alarmStatus.textContent = `Alarm set for ${alarmTime.hour}:${alarmTime.minute}`;
        alarmPopup.style.display = 'none';
        
        // Save alarm
        localStorage.setItem('clockAlarm', JSON.stringify(alarmTime));
    });
    
    cancelAlarmBtn.addEventListener('click', function() {
        alarmTime = null;
        alarmStatus.textContent = '';
        alarmHour.value = '';
        alarmMinute.value = '';
        alarmPopup.style.display = 'none';
        
        // Remove saved alarm
        localStorage.removeItem('clockAlarm');
    });
    
    // Check if alarm should trigger
    function checkAlarm(hours, minutes) {
        if (alarmTime && hours === alarmTime.hour && minutes === alarmTime.minute && new Date().getSeconds() === 0) {
            triggerAlarm();
        }
    }
    
    function triggerAlarm() {
        // Play the current alarm sound
        alarmSounds[currentAlarmSound].play();
        
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#ff5252';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'space-between';
        notification.style.gap = '15px';
        
        notification.innerHTML = `
            <span>Alarm! It's ${alarmTime.hour}:${alarmTime.minute}</span>
            <button id="stop-alarm" style="background: white; color: #ff5252; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Stop</button>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('stop-alarm').addEventListener('click', function() {
            alarmSounds[currentAlarmSound].pause();
            alarmSounds[currentAlarmSound].currentTime = 0;
            document.body.removeChild(notification);
        });
        
        // Auto dismiss after 1 minute
        setTimeout(() => {
            if (document.body.contains(notification)) {
                alarmSounds[currentAlarmSound].pause();
                alarmSounds[currentAlarmSound].currentTime = 0;
                document.body.removeChild(notification);
            }
        }, 60000);
    }
    
    // Timer functionality
    startTimerBtn.addEventListener('click', function() {
        if (timerIsRunning) return;
        
        if (!timerRemainingSeconds) {
            // Get time from inputs
            const minutes = parseInt(timerMinute.value) || 0;
            const seconds = parseInt(timerSecond.value) || 0;
            
            if (minutes === 0 && seconds === 0) {
                alert('Please enter a valid time for the timer');
                return;
            }
            
            timerTotalSeconds = minutes * 60 + seconds;
            timerRemainingSeconds = timerTotalSeconds;
        }
        
        startTimer();
    });
    
    pauseTimerBtn.addEventListener('click', function() {
        if (!timerIsRunning) return;
        pauseTimer();
    });
    
    resetTimerBtn.addEventListener('click', function() {
        resetTimer();
    });
    
    function startTimer() {
        timerIsRunning = true;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            timerRemainingSeconds--;
            updateTimerDisplay();
            
            if (timerRemainingSeconds <= 0) {
                timerComplete();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        timerIsRunning = false;
        clearInterval(timerInterval);
    }
    
    function resetTimer() {
        pauseTimer();
        timerRemainingSeconds = 0;
        timerTotalSeconds = 0;
        timerMinute.value = '';
        timerSecond.value = '';
        updateTimerDisplay();
    }
    
    function updateTimerDisplay() {
        // Update digital display
        const minutes = Math.floor(timerRemainingSeconds / 60);
        const seconds = timerRemainingSeconds % 60;
        timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
        
        // Update circle progress
        const circumference = 2 * Math.PI * 45; // Circle radius is 45
        let offset = circumference;
        
        if (timerTotalSeconds > 0) {
            const progress = timerRemainingSeconds / timerTotalSeconds;
            offset = circumference - (progress * circumference);
        }
        
        timerProgress.style.strokeDashoffset = offset;
        timerProgress.style.strokeDasharray = circumference;
    }
    
    function timerComplete() {
        pauseTimer();
        
        // Play the current alarm sound
        alarmSounds[currentAlarmSound].play();
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'timer-notification';
        notification.innerHTML = `
            <h3>Timer Complete!</h3>
            <button id="stop-timer-alarm">OK</button>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('stop-timer-alarm').addEventListener('click', function() {
            alarmSounds[currentAlarmSound].pause();
            alarmSounds[currentAlarmSound].currentTime = 0;
            document.body.removeChild(notification);
            resetTimer();
        });
        
        // Auto dismiss after 1 minute
        setTimeout(() => {
            if (document.body.contains(notification)) {
                alarmSounds[currentAlarmSound].pause();
                alarmSounds[currentAlarmSound].currentTime = 0;
                document.body.removeChild(notification);
                resetTimer();
            }
        }, 60000);
    }
    
    // Close popup when clicking outside
    document.addEventListener('click', function(event) {
        if (!alarmPopup.contains(event.target) && event.target !== alarmToggle) {
            if (alarmPopup.style.display === 'block') {
                alarmPopup.style.display = 'none';
            }
        }
    });
    
    // Make it fullscreen
    document.addEventListener('dblclick', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Mobile navbar toggle
    navbarToggle.addEventListener('click', function() {
        mainNav.style.display = mainNav.style.display === 'none' ? 'block' : 'none';
    });
});