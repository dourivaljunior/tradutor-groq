// =====================================================
// CHAVE API GROQ
// =====================================================

const GROQ_API_KEY =
  "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";

// =====================================================
// ELEMENTOS
// =====================================================

const startBtn =
  document.getElementById("startBtn");

const stopBtn =
  document.getElementById("stopBtn");

const originalText =
  document.getElementById("originalText");

const translatedText =
  document.getElementById("translatedText");

const statusText =
  document.getElementById("statusText");

const micLed =
  document.getElementById("micLed");

const liveBadge =
  document.getElementById("liveBadge");

const bars =
  document.querySelectorAll(".bar");

// =====================================================
// CONTROLE
// =====================================================

let recognition;

let listening = false;

let processing = false;

// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (!SpeechRecognition) {

  alert(
    "Seu navegador não suporta reconhecimento de voz."
  );

}

recognition =
  new SpeechRecognition();

recognition.continuous = true;

recognition.interimResults = false;

// MELHOR PARA PT + EN

recognition.lang = "pt-BR";

// =====================================================
// INICIAR
// =====================================================

startBtn.addEventListener("click", () => {

  if (listening) return;

  listening = true;

  recognition.start();

  statusText.innerText =
    "🎤 Ouvindo conversa...";

  micLed.classList.add("mic-active");

  liveBadge.classList.add("live-active");

});

// =====================================================
// FINALIZAR
// =====================================================

stopBtn.addEventListener("click", () => {

  listening = false;

  processing = false;

  recognition.stop();

  speechSynthesis.cancel();

  statusText.innerText =
    "⏹ Conversa finalizada";

  micLed.classList.remove("mic-active");

  liveBadge.classList.remove("live-active");

  resetBars();

});

// =====================================================
// RECEBER FALA
// =====================================================

recognition.onresult =
  async (event) => {

    if (processing) return;

    processing = true;

    const transcript =
      event.results[
        event.results.length - 1
      ][0].transcript.trim();

    if (transcript.length < 2) {

      processing = false;

      return;

    }

    originalText.innerText =
      transcript;

    statusText.innerText =
      "🌐 Traduzindo...";

    try {

      const result =
        await translateText(transcript);

      translatedText.innerText =
        result.translation;

      statusText.innerText =
        result.direction;

      speak(
        result.translation,
        result.voice
      );

    } catch (error) {

      console.error(error);

      statusText.innerText =
        "❌ Erro tradução";

      processing = false;

    }

};

// =====================================================
// TRADUÇÃO
// =====================================================

async function translateText(text) {

  const response =
    await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${GROQ_API_KEY}`

        },

        body: JSON.stringify({

          model:
            "llama-3.3-70b-versatile",

          messages: [

            {

              role: "system",

              content: `
Você é um tradutor.

Se o texto estiver em português:
traduzir para inglês.

Se estiver em inglês:
traduzir para português.

Responda SOMENTE a tradução.
`

            },

            {

              role: "user",

              content: text

            }

          ],

          temperature: 0.1

        })

      }

    );

  const data =
    await response.json();

  console.log(data);

  const translation =
    data.choices[0]
      .message.content.trim();

  // DETECÇÃO SIMPLES

  const isPortuguese =
    /[ãõçáéíóú]/i.test(text) ||
    text.includes("você") ||
    text.includes("olá") ||
    text.includes("qual");

  return {

    translation,

    direction:
      isPortuguese
        ? "PT → EN"
        : "EN → PT",

    voice:
      isPortuguese
        ? "en-US"
        : "pt-BR"

  };

}

// =====================================================
// FALAR ÁUDIO
// =====================================================

function speak(text, lang) {

  speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = lang;

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;

  utterance.onstart = () => {

    statusText.innerText =
      "🔊 Reproduzindo áudio...";

  };

  utterance.onend = () => {

    processing = false;

    statusText.innerText =
      "🎤 Ouvindo conversa...";

  };

  speechSynthesis.speak(
    utterance
  );

}

// =====================================================
// VU METER
// =====================================================

function animateBars() {

  bars.forEach(bar => {

    const height =
      Math.floor(
        Math.random() * 150
      ) + 20;

    bar.style.height =
      `${height}px`;

  });

}

function resetBars() {

  bars.forEach(bar => {

    bar.style.height =
      "20px";

  });

}

// =====================================================
// LOOP VISUAL
// =====================================================

setInterval(() => {

  if (
    listening &&
    !processing
  ) {

    animateBars();

  } else {

    resetBars();

  }

}, 120);

// =====================================================
// AUTO RESTART
// =====================================================

recognition.onend = () => {

  if (
    listening &&
    !processing
  ) {

    setTimeout(() => {

      recognition.start();

    }, 300);

  }

};

// =====================================================
// ERROS
// =====================================================

recognition.onerror =
  (event) => {

    console.error(event.error);

    statusText.innerText =
      `❌ ${event.error}`;

    processing = false;

};
