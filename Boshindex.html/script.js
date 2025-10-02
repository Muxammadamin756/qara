const words = [
    { arabic: "كِتَابٌ", translation: "kitob", audio: "audio/kitob.mp3", options: ["kitob", "olma", "uy"] },
    { arabic: "قَلَمٌ", translation: "ruchka", audio: "audio/ruchka.mp3", options: ["ruchka", "daraxt", "stol"] },
    { arabic: "مَاءٌ", translation: "suv", audio: "audio/suv.mp3", options: ["suv", "non", "sut"] },
    { arabic: "بَيْتٌ", translation: "uy", audio: "audio/uy.mp3", options: ["uy", "ko‘cha", "daraxt"] },
    { arabic: "وَلَدٌ", translation: "bola", audio: "audio/bola.mp3", options: ["bola", "qiz", "ota"] },
    // ... boshqa so‘zlarni ham shu tartibda qo‘shing ...
];

let current = 0;

// Variantlarni har safar aralashtirish uchun
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadWord(anim = true) {
    const w = words[current];
    const arabicEl = document.getElementById('arabicWord');
    const translationEl = document.getElementById('translation');
    const quizQ = document.getElementById('quizQuestion');
    const quizOpts = document.getElementById('quizOptions');
    const quizRes = document.getElementById('quizResult');

    arabicEl.textContent = w.arabic;
    arabicEl.style.opacity = 0;
    setTimeout(() => {
        arabicEl.style.animation = '';
        arabicEl.classList.remove('fade-in');
        arabicEl.style.opacity = 1;
    }, 10);

    translationEl.textContent = w.translation;
    quizQ.textContent = `"${w.arabic}" so‘zining tarjimasini tanlang:`;

    // Variantlarni har safar aralashtirish
    const shuffledOptions = shuffle([...w.options]);
    let opts = '';
    shuffledOptions.forEach(opt => {
        opts += `<label><input type="radio" name="quiz" value="${opt}">${opt}</label> `;
    });
    quizOpts.innerHTML = opts;
    quizRes.textContent = '';

    // Animatsiya
    if (anim) {
        arabicEl.classList.remove('fade-in');
        quizRes.classList.remove('fade-in');
        setTimeout(() => {
            arabicEl.classList.add('fade-in');
        }, 10);
    }
}

function playAudio() {
    const w = words[current];
    if (w.audio) {
        // Lokal audio fayl uchun
        const audio = new Audio(w.audio);
        audio.play();
    } else {
        // Google TTS serveri orqali audio olish (agar server.js ishlayotgan bo‘lsa)
        fetch('http://localhost:3000/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: w.arabic, languageCode: 'ar-XA' })
        })
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const blob = new Blob([buffer], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.play();
            })
            .catch(() => {
                alert("Audio ishlamadi. Server yoki internetni tekshiring.");
            });
    }
}

function checkAnswer() {
    const radios = document.getElementsByName('quiz');
    let selected = '';
    for (const r of radios) if (r.checked) selected = r.value;
    const result = document.getElementById('quizResult');
    const mainApp = document.getElementById('mainApp');

    if (selected === words[current].translation) {
        result.textContent = 'To‘g‘ri!';
        result.style.color = 'green';
        result.classList.remove('fade-in');
        setTimeout(() => {
            result.classList.add('fade-in');
        }, 10);

        // Fade out animatsiya va keyingi savolga o‘tish
        setTimeout(() => {
            mainApp.classList.add('fade-out');
            setTimeout(() => {
                mainApp.classList.remove('fade-out');
                nextWord();
            }, 400);
        }, 700);
    } else {
        result.textContent = 'Noto‘g‘ri, yana urinib ko‘ring.';
        result.style.color = 'red';
        result.classList.remove('fade-in');
        setTimeout(() => {
            result.classList.add('fade-in');
        }, 10);
    }
}

function nextWord() {
    current = (current + 1) % words.length;
    loadWord();
}

// Boshlash tugmasi uchun
window.onload = function () {
    document.getElementById('startBtn').onclick = function () {
        document.getElementById('welcome').style.display = "none";
        document.getElementById('mainApp').style.display = "flex";
        loadWord();
    };
};