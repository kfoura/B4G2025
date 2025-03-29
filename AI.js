const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyDNlRlDeYHGm4kwDrmtctvXSi2j1pv4iNc";
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig,
  systemInstruction: "Determine the Political Bias of the following text.",
});

async function run() {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `Determine the politcal bias of the following text Answer like:

Progressive/Conservative Bias:
Authoritarian/Libertarian:
Communist/Capitalist:
Give the percentages in like a 3d axis like a graph and provide a justification for the answer. If there isn't really a discussion of a particular axis, put 0 for both
When determining the bias, don't just look at the text, but also look at the title and the url as well as the date, author (do research on the author), fact-checking databases, and transparency of the source.
Specifically mention false/misleading information as part of the justification, indicate the quote and the source.
For Your total justifaction and what you wll output, use the following format (Don't Add "*"s to your output):


Axis:
Progressive/Conservative Bias:
Authoritarian/Libertarian Bias:
Communist/Capitalist Bias:

Justification:

False/Misleading Information (include the exact quote from the article and include sources of the fact-checked information and summary (Bullet Points should not have "*"s)):

Factual/True Information (include the exact quote from the article and include sources of the fact-checked information and summary (Bullet Points should not have "*"s)):

Confidence in Accuracy (1-100%):


March 29, 2025
`

    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
