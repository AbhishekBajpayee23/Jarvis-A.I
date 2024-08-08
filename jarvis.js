const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// Initialize Speech Synthesis
function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1; // Valid range is 0 to 1
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
}

// Greet based on time of day
function wishMe() {
    const day = new Date();
    const hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Boss...");
    } else {
        speak("Good Evening Boss...");
    }
}

// Load face-api.js models and start video stream
async function setupFaceDetection() {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    const video = document.getElementById('videoInput');
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks().withFaceDescriptors();

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            if (detections.length > 0) {
                speak("Face biometric complete. Welcome Boss");
                document.querySelector('.content').textContent = "Face biometric complete. Welcome Boss";
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        }, 1000); // Check every second
    });

    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error(err));
}

// Initialize everything on page load
window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
    setupFaceDetection(); // Set up face detection
});

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

// Process commands based on voice input
function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Boss, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("OK Boss Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("OK Boss Opening YouTube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("OK Boss Opening Facebook...");
    } else if (message.includes("open instagram")) {
        window.open("https://www.instagram.com", "_blank");
        speak("OK Boss Opening Instagram...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
        const finalText = "This is what I found on the internet regarding " + message;
        speak(finalText);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(message.replace("wikipedia", "").trim())}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        const finalText = "OK Boss The current time is " + time;
        speak(finalText);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        const finalText = "OK Boss Today's date is " + date;
        speak(finalText);
    } else if (message.includes('calculator')) {
        speak("I can't open the calculator directly. Please use your system's calculator.");
    } else {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
        const finalText = "I found some information for " + message + " on Google";
        speak(finalText);
    }
}
