// =====================================================
// CHAVE GROQ
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

let speaking = false;

// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (!SpeechRecognition) {

  alert(
    "Navegador não suporta reconhecimento de voz."
  );

}

recognition =
  new SpeechRecognition();

// MUITO IMPORTANTE

recognition.continuous = true;

recognition.interimResults = false;

// DETECÇÃO MISTA PT + EN

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

  recognition.stop();

  speechSynthesis.cancel();

  statusText.innerText =
    "⏹ Conversa finalizada";

  micLed.classList.remove("mic-active");

  liveBadge.classList.remove("live-active");

  resetBars();

});

// =====================================================
// DETECTAR FALA
// =====================================================

recognition.onresult =
  async (event) => {

    if (speaking) return;

    const transcript =
      event.results[
        event.results.length - 1
      ][0].transcript.trim();

    if (transcript.length < 2) return;

    originalText.innerText =
      transcript;

    statusText.innerText =
      "🌐 Traduzindo...";

    try {

      const translated =
        await translateText(transcript);

      translatedText.innerText =
        translated.text;

      statusText.innerText =
        translated.direction;

      speakText(
        translated.text,
        translated.voice
      );

    } catch (error) {

      console.error(error);

      statusText.innerText =
        "❌ Erro tradução";

    }

};

// =====================================================
// GROQ TRADUÇÃO
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
Você é um tradutor automático PT ↔ EN.

REGRAS:
- Detecte apenas português ou inglês.
- Se o usuário falar português:
traduzir para inglês.
- Se falar inglês:
traduzir para português.
- NÃO explique.
- NÃO converse.
- RESPONDA SOMENTE ASSIM:

LANG: PT
TEXT: Hello, how are you?

OU

LANG: EN
TEXT: Olá, tudo bem?
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

  const content =
    data.choices[0]
      .message.content;

  let detected =
    "EN";

  let translated =
    content;

  if (
    content.includes("LANG: PT")
  ) {

    detected =
      "PT → EN";

  } else {

    detected =
      "EN → PT";

  }

  if (
    content.includes("TEXT:")
  ) {

    translated =
      content
      .split("TEXT:")[1]
      .trim();

  }

  const voice =
    detected === "PT → EN"
      ? "en-US"
      : "pt-BR";

  return {

    direction: detected,
    text: translated,
    voice

  };

}

// =====================================================
// FALAR TEXTO
// =====================================================

function speakText(text, lang) {

  speaking = true;

  recognition.stop();

  speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = lang;

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;

  utterance.onend = () => {

    speaking = false;

    if (listening) {

      setTimeout(() => {

        recognition.start();

        statusText.innerText =
          "🎤 Ouvindo conversa...";

      }, 600);

    }

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

    const h =
      Math.floor(
        Math.random() * 150
      ) + 20;

    bar.style.height =
      `${h}px`;

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
    !speaking
  ) {

    animateBars();

  } else {

    resetBars();

  }

}, 120);

// =====================================================
// REINICIAR AUTOMÁTICO
// =====================================================

recognition.onend = () => {

  if (
    listening &&
    !speaking
  ) {

    setTimeout(() => {

      recognition.start();

    }, 400);

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

};
