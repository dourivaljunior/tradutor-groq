// =====================================
// CHAVE API GROQ
// =====================================

const GROQ_API_KEY =
  "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";

// =====================================
// ELEMENTOS
// =====================================

const startBtn =
  document.getElementById("startBtn");

const stopBtn =
  document.getElementById("stopBtn");

const statusDiv =
  document.getElementById("status");

const originalText =
  document.getElementById("originalText");

const translatedText =
  document.getElementById("translatedText");

const vuBars =
  document.querySelectorAll(".vu-bar");

// =====================================
// CONTROLE
// =====================================

let recognition;

let listening = false;

let speaking = false;

// =====================================
// RECONHECIMENTO DE VOZ
// =====================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

recognition =
  new SpeechRecognition();

recognition.continuous = true;

recognition.interimResults = false;

// MELHOR PARA PT + EN

recognition.lang = "pt-BR";

// =====================================
// INICIAR CONVERSA
// =====================================

startBtn.addEventListener("click", () => {

  if (listening) return;

  listening = true;

  recognition.start();

  statusDiv.innerText =
    "🎤 Ouvindo conversa...";

});

// =====================================
// TERMINAR CONVERSA
// =====================================

stopBtn.addEventListener("click", () => {

  listening = false;

  recognition.stop();

  speechSynthesis.cancel();

  statusDiv.innerText =
    "⏹ Conversa encerrada";

  resetVu();

});

// =====================================
// RECEBER FALA
// =====================================

recognition.onresult =
  async (event) => {

    if (speaking) return;

    const transcript =
      event.results[
        event.results.length - 1
      ][0].transcript.trim();

    if (transcript.length < 2)
      return;

    originalText.innerText =
      transcript;

    statusDiv.innerText =
      "🌐 Traduzindo...";

    try {

      const translated =
        await translateText(
          transcript
        );

      translatedText.innerText =
        translated.text;

      speakText(
        translated.text,
        translated.lang
      );

    } catch (error) {

      console.error(error);

      statusDiv.innerText =
        "❌ Erro na tradução";

    }

};

// =====================================
// TRADUÇÃO GROQ
// =====================================

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

    text: translation,

    lang:
      isPortuguese
        ? "en-US"
        : "pt-BR"

  };

}

// =====================================
// FALAR TEXTO
// =====================================

function speakText(text, lang) {

  speaking = true;

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

    statusDiv.innerText =
      "🔊 Reproduzindo áudio...";

  };

  utterance.onend = () => {

    speaking = false;

    statusDiv.innerText =
      "🎤 Ouvindo conversa...";

  };

  speechSynthesis.speak(
    utterance
  );

}

// =====================================
// VU METER
// =====================================

function animateVu() {

  vuBars.forEach(bar => {

    const h =
      Math.floor(
        Math.random() * 100
      ) + 20;

    bar.style.height =
      `${h}px`;

  });

}

function resetVu() {

  vuBars.forEach(bar => {

    bar.style.height =
      "20px";

  });

}

// =====================================
// LOOP VU
// =====================================

setInterval(() => {

  if (
    listening &&
    !speaking
  ) {

    animateVu();

  } else {

    resetVu();

  }

}, 120);

// =====================================
// REINICIAR AUTOMÁTICO
// =====================================

recognition.onend = () => {

  if (
    listening &&
    !speaking
  ) {

    setTimeout(() => {

      recognition.start();

    }, 300);

  }

};

// =====================================
// ERROS
// =====================================

recognition.onerror =
  (event) => {

    console.error(event.error);

    statusDiv.innerText =
      `❌ ${event.error}`;

};
