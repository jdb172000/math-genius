// ✅ Firebase config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "mathtutors-j.firebaseapp.com",
  projectId: "mathtutors-j",
  storageBucket: "mathtutors-j.appspot.com",
  messagingSenderId: "690324457653",
  appId: "1:690324457653:web:62459b893a8424834e16fc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ DOM elements
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat");
const languageSelect = document.getElementById("language-select");
const manualHelpBtn = document.getElementById("manual-help-btn");

let selectedLanguage = "english";

// ✅ Language selection
languageSelect.addEventListener("change", () => {
  selectedLanguage = languageSelect.value;
});

// ✅ Handle message submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  appendMessage("You", question);
  userInput.value = "";

  try {
    const answer = await getMathAnswer(question);
    const finalAnswer =
      selectedLanguage === "afrikaans"
        ? await translateToAfrikaans(answer)
        : answer;

    appendMessage("Math Genius", finalAnswer);
  } catch (error) {
    console.error("Error:", error);
    appendMessage("Math Genius", "There was an error getting the answer from Math Genius.");
  }
});

// ✅ Handle manual help button
manualHelpBtn.addEventListener("click", async () => {
  const lastQuestion = getLastUserQuestion();
  if (!lastQuestion) {
    alert("No question to send for help.");
    return;
  }

  try {
    await db.collection("manualRequests").add({
      question: lastQuestion,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Manual help requested!");
  } catch (error) {
    console.error("Manual request error:", error);
    alert("Failed to send manual help request.");
  }
});

// ✅ Append messages to chat
function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "You" ? "user" : "bot");
  messageDiv.innerText = `${sender}: ${message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Get last user message
function getLastUserQuestion() {
  const messages = chatBox.querySelectorAll(".message.user");
  return messages.length > 0
    ? messages[messages.length - 1].innerText.replace("You: ", "")
    : null;
}

// ✅ Get GPT answer (OpenAI)
async function getMathAnswer(question) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer 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", // ⬅️ KEEP Bearer
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `${question}. Explain step by step like a friendly tutor.`
        }
      ],
      temperature: 0.3
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No answer.";
}

// ✅ Translate to Afrikaans
async function translateToAfrikaans(text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer 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 ", // ⬅️ KEEP Bearer
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Translate this to clear Afrikaans (for a student): ${text}`
        }
      ],
      temperature: 0.2
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}
