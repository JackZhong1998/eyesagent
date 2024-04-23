document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('photoButton').addEventListener('click', takePhoto);
    document.getElementById('voiceButton').addEventListener('click', recordAudio);
    document.getElementById('textInputButton').addEventListener('click', typeQuery);
    document.getElementById('toTopButton').addEventListener('click', scrollToTop);
});

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

function takePhoto() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                setTimeout(() => {  // 给用户一些时间来准备
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    video.srcObject.getTracks().forEach(track => track.stop());  // 关闭视频流
                    sendPhoto(canvas.toDataURL('image/png'));
                }, 3000);  // 3秒后拍照
            }).catch(function(error) {
                displayError("拍照功能无法使用: " + error.message);
            });
    } else {
        displayError("您的浏览器不支持拍照功能");
    }
}

function sendPhoto(imageData) {
    fetch('/api/image-recognition', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayResult(data.description);  // 假设后端返回的数据中包含 'description' 字段
    })
    .catch(error => {
        displayError("发送照片失败: " + error.message);
    });
}

function recordAudio() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                const mediaRecorder = new MediaRecorder(stream);
                let chunks = [];

                mediaRecorder.onstart = function() {
                    chunks = [];
                };

                mediaRecorder.ondataavailable = function(e) {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = function() {
                    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    sendAudio(blob);
                };

                mediaRecorder.start();
                // 录音时间限制
                setTimeout(() => {
                    mediaRecorder.stop();
                }, 3000); // 录制3秒
            }).catch(function(error) {
                displayError("录音功能无法使用: " + error.message);
            });
    } else {
        displayError("您的浏览器不支持录音功能");
    }
}

function sendAudio(audioBlob) {
    fetch('/api/voice-to-text', {
        method: 'POST',
        body: audioBlob,
        headers: {
            'Content-Type': 'audio/ogg'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayResult(data.transcript);  // 假设后端返回的数据中包含 'transcript' 字段
    })
    .catch(error => {
        displayError("发送音频失败: " + error.message);
    });
}

function typeQuery() {
    const userInput = prompt("请输入您要查询的内容");
    if (userInput) {
        fetch('/api/text-query', {
            method: 'POST',
            body: JSON.stringify({ query: userInput }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            displayResult(data.response);  // 假设后端返回的数据中包含 'response' 字段
        })
        .catch(error => {
            displayError("发送查询失败: " + error.message);
        });
    }
}

function scrollToTop() {
    window.scrollTo(0, 0);
}

function displayResult(result) {
    const resultElement = document.getElementById('result');
    resultElement.textContent = result;
    resultElement.style.display = 'block';
}
