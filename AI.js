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
Collectivist/Capitalist:
Give the percentages in like a 3d axis like a graph

 Let some people get rich first - Deng Xiaoping
`;

    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
