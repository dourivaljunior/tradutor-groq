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

let speaking = false;

// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

recognition =
  new SpeechRecognition();

recognition.continuous = true;

recognition.interimResults = false;

// =====================================================
// INICIAR CONVERSA
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
// FINALIZAR CONVERSA
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

      const translation =
        await translateText(transcript);

      translatedText.innerText =
        translation.text;

      statusText.innerText =
        `✅ ${translation.detected}`;

      speakText(
        translation.text,
        translation.lang
      );

    } catch (error) {

      console.error(error);

      statusText.innerText =
        "❌ Erro na tradução";

    }

};

// =====================================================
// TRADUÇÃO GROQ
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
Você é um tradutor automático.

REGRAS:
- Detecte SOMENTE português ou inglês.
- Se estiver em português:
traduzir para inglês.
- Se estiver em inglês:
traduzir para português.
- NÃO explique.

RESPONDA EXATAMENTE:

LANGUAGE: PT
TRANSLATION: Hello

OU

LANGUAGE: EN
TRANSLATION: Olá
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

  const content =
    data.choices[0]
      .message.content;

  let detected = "EN";

  let translated = content;

  if (
    content.includes(
      "LANGUAGE: PT"
    )
  ) {

    detected = "PT → EN";

  } else {

    detected = "EN → PT";

  }

  if (
    content.includes(
      "TRANSLATION:"
    )
  ) {

    translated =
      content
      .split("TRANSLATION:")[1]
      .trim();

  }

  let lang =
    detected === "PT → EN"
      ? "en-US"
      : "pt-BR";

  return {

    detected,
    text: translated,
    lang

  };

}

// =====================================================
// FALAR TEXTO
// =====================================================

function speakText(text, lang) {

  speaking = true;

  recognition.stop();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = lang;

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.onend = () => {

    speaking = false;

    if (listening) {

      setTimeout(() => {

        recognition.start();

        statusText.innerText =
          "🎤 Ouvindo conversa...";

      }, 400);

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

    const height =
      Math.floor(
        Math.random() * 160
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
    !speaking
  ) {

    animateBars();

  } else {

    resetBars();

  }

}, 120);

// =====================================================
// REINICIAR MICROFONE
// =====================================================

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

// =====================================================
// ERROS
// =====================================================

recognition.onerror =
  (event) => {

    console.error(event.error);

    statusText.innerText =
      "❌ Erro reconhecimento";

};
