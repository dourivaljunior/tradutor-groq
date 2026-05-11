// =====================================
// COLOQUE SUA CHAVE API DA GROQ AQUI
// =====================================

const GROQ_API_KEY = "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";

// =====================================

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const originalText = document.getElementById("originalText");
const translatedText = document.getElementById("translatedText");
const statusDiv = document.getElementById("status");

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

let recognition;
let listening = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Seu navegador não suporta reconhecimento de voz.");
}

recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

// =====================================
// INICIAR
// =====================================

startBtn.addEventListener("click", () => {

  recognition.lang = sourceLanguage.value;

  recognition.start();
  listening = true;

  statusDiv.innerText = "🎤 Ouvindo...";

});

// =====================================
// PARAR
// =====================================

stopBtn.addEventListener("click", () => {

  recognition.stop();
  listening = false;

  statusDiv.innerText = "⏹ Tradução parada.";

});
};
