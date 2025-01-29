import { GoogleGenerativeAI } from "@google/generative-ai";

// script.js
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const chatArea = document.getElementById('chat-area');
const targetLanguageSelect = document.getElementById('target-language');
const faceRecButton = document.getElementById('face-rec-button');
const faceRecResults = document.getElementById('face-rec-results');

// Mobile Navigation Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// // Translation Function
// async function translateText(text, targetLanguage) {
//     try {
//         const response = await fetch('/api/translate', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ text: text, target_language: targetLanguage })
//         });
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(`Translation failed: ${response.status} - ${errorData.error || response.statusText}`);
//         }
//         const data = await response.json();
//         return data.translated_text;
//     } catch (error) {
//         console.error("Translation error:", error);
//         return "Translation failed.";
//     }
// }

// // Chatbot Functionality
// if (sendButton && messageInput && chatArea && targetLanguageSelect) { // Check if elements exist
//     sendButton.addEventListener('click', async () => {
//         const message = messageInput.value.trim();
//         if (message !== "") {
//             chatArea.innerHTML += `<div class="message">You: ${message}</div>`;
//             messageInput.value = '';
//             chatArea.scrollTop = chatArea.scrollHeight;

//             try {
//                 const translatedMessage = await translateText(message, targetLanguageSelect.value);
//                 chatArea.innerHTML += `<div class="message translated">Translated: ${translatedMessage}</div>`;
//             } catch (error) {
//                 console.error("Translation error:", error);
//                 chatArea.innerHTML += `<div class="error">Translation failed.</div>`;
//             }
//         }
//     });
// }


// Chatbot Script

const systemInstruction = `

Here is your role:
You are a conversational agent embedded in an app designed to help patients report their experiences more easily and assist clinicians in summarising reports for use in treatment and diagnostic decision-making.
Your primary role is to engage with patients, check in on their well-being, and collect qualitative reports about their experiences and emotions.
While you are not an expert psychologist, you possess extensive information and knowledge about mental health care and common mental health disorders, including mood disorders (e.g., major depressive disorder, bipolar disorder), anxiety disorders, PTSD/stress-related disorders, and neurodevelopmental disorders (e.g., ASD, ADHD).

Here is the format of your answers:
Patients will communicate with you via video, speaking directly to the camera.
Your responses will be text-based, mimicking a conversational style similar to texting or chatting in an audio format.
Your tone should always be warm, encouraging, kind, respectful, and empathetic, reflecting the best practices of mental health care professionals.
Remember you are not a licensed psychologist, so you should not offer diagnoses.
Your responses must remain non-directive (avoid leading questions), non-judgmental (avoid evaluative or critical comments), and non-advisory (do not offer advice that may be subjective or biased). Instead, allow patients to express themselves freely and naturally.

Here is yours tasks:
- Checking in with patients: Asking about their day, notable events in their lives (especially those that may have been stressful, uplifting, or emotionally significant).
- Engaging in human-like conversations: Providing a safe, supportive space for patients to share their thoughts and feelings, even when their psychologist or psychiatrist is unavailable.
- Collecting rich qualitative information: Asking structured, thoughtful questions to gather detailed and consistent data across patients. This information will assist mental health practitioners in treatment and diagnosis.

Here is how you should interact
You should interact with gently prompt patients to elaborate if their responses are brief. Examples: “Can you tell me more about that?”, “How did that make you feel?”, “What was going through your mind at the time?”

Here is your goals:
Patient Engagement: Create a natural, human-like interaction that encourages patients to share their experiences openly and in detail.
Data Collection: Gather meaningful, structured qualitative data that clinicians can easily summarise and use in their work.

`;

const API_KEY = "AIzaSyBJhXlKWxnD6nHRss9Kw4kiWEHdU4ZQo4k";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: systemInstruction
});

let messages = {
    history: [],
}

async function sendMessage() {

    console.log(messages);
    const userMessage = document.querySelector("#chatbot-feature #message-input").value;
    
    if (userMessage.length) {

        try {
            document.querySelector("#chatbot-feature textarea").value = "";
            document.querySelector("#chat-area").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p><b>User:</b> ${userMessage}</p>
                </div>
            `);

            document.querySelector("#chat-area").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);

            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector("#chat-area").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p><b>Chatbot:</b> </p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              modelMessages = document.querySelectorAll("#chat-area div.model");
              modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend",`
                ${chunkText}
            `);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector("#chat-area").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector("#chat-area .loader").remove();
        
    }
}

document.querySelector("#chatbot-feature .input-area #send-button")
.addEventListener("click", ()=>sendMessage());

// document.querySelector(".chat-button")
// .addEventListener("click", ()=>{
//     document.querySelector("body").classList.add("chat-open");
// });

// document.querySelector(".chat-window button.close")
// .addEventListener("click", ()=>{
//     document.querySelector("body").classList.remove("chat-open");
// });








// Face Recognition Functionality (Placeholder)
if (faceRecButton && faceRecResults) { // Check if elements exist
    faceRecButton.addEventListener('click', async () => {
        faceRecResults.textContent = "Analyzing face... (This is a placeholder)";
        try {
            // In a real app, capture image and send it here
            const response = await fetch('/api/analyze_face', {
                method: 'POST',
                // Include image data in the request (FormData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Face analysis failed: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            faceRecResults.textContent = JSON.stringify(data); // Display backend response
        } catch (error) {
            console.error("Face Analysis Error:", error);
            faceRecResults.textContent = `Face analysis failed: ${error.message}`;
        }
    });
}


// Function to handle smooth scrolling to sections (if needed later)
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add event listeners for navigation if you want smooth scrolling
// Example:
// document.querySelector('a[href="#features"]').addEventListener('click', function(e) {
//     e.preventDefault();
//     scrollToSection('features');
// });



// Face Recognition
// const faceRecButton = document.getElementById('face-rec-button');
// const faceRecResults = document.getElementById('face-rec-results');

faceRecButton.addEventListener('click', async () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*'; // Accept only images

    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];
            faceRecResults.textContent = "Analyzing face...";
            try {
              const response = await fetch('/api/analyze_face', {
                  method: 'POST',
                  body: new URLSearchParams({ 'image': base64String})
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              faceRecResults.textContent = JSON.stringify(data);
            } catch (error) {
              console.error("Face Analysis Error:", error);
              faceRecResults.textContent = `Face analysis failed: ${error.message}`;
            }
          };
          reader.readAsDataURL(file);
        }
    });

    imageInput.click(); // Programmatically open file selection dialog
});

// Speech Recognition
const speechRecognition = new webkitSpeechRecognition() || new SpeechRecognition();
speechRecognition.continuous = false;
speechRecognition.lang = 'en-US';

const speechButton = document.createElement('button');
speechButton.textContent = 'Start Speech Recognition';
document.getElementById('chatbot-feature').appendChild(speechButton);

speechButton.addEventListener('click', () => {
  speechRecognition.start();
});

speechRecognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  try {
    const formData = new FormData();
    const blob = new Blob([event.results[0][0].transcript], { type: "text/plain"});
    formData.append('audio', blob, 'audio.wav');

    const response = await fetch('/api/recognize_speech', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if(data.transcript){
      messageInput.value = data.transcript;
    } else {
      console.log("no transcript")
    }
  } catch (error) {
    console.error("Speech Recognition Error:", error);
  }
};
speechRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
};



