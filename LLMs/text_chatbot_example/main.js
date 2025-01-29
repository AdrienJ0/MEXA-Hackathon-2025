import { GoogleGenerativeAI } from "@google/generative-ai";

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

const API_KEY = "ENTER YOUR API KEY";
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
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);

            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              modelMessages = document.querySelectorAll(".chat-window .chat div.model");
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
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
        
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", ()=>sendMessage());

document.querySelector(".chat-button")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.remove("chat-open");
});

