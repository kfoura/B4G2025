const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const apiKey = "AIzaSyDNlRlDeYHGm4kwDrmtctvXSi2j1pv4iNc";
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig,
  systemInstruction: "Determine the Political Bias of the following text and output in JSON format.",
});

async function run() {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `Determine the politcal bias of the following text and output in JSON format with the following structure:
{
  "axis": {
    "progressiveConservativeBias": {
      "progressive": 0%,
      "conservative": 0%
    },
    "authoritarianLibertarianBias": {
      "authoritarian": 0%,
      "libertarian": 0%
    },
    "communistCapitalistBias": {
      "communist": 0%,
      "capitalist": 0%
    }
  },
  "justification": "",
  "falseMisleadingInformation": [["Quote from the article", "Source of the fact-checked information (include the url)", "Summary"]],
  "factualTrueInformation": [["Quote from the article", "Source of the fact-checked information (include the url)", "Summary"]],
  "confidenceInAccuracy": 0%
  "articleLink": ""
}

Artcle Link: https://thebatt.com/life-arts/farm-fresh-and-locally-grown-an-ethical-approach-to-livestock/

When determining the bias, don't just look at the text, but also look at the title and the url as well as the date, author (do research on the author), fact-checking databases, and transparency of the source.
Specifically mention false/misleading information as part of the justification, indicate the quote and the source. For the confidence in accuracy, use the fact-checking databases and the transparency of the source to determine the confidence in accuracy.
MAKE SURE YOU GET ALL FACTUAL AND MISLEADING INFORMATION FROM THE ARTICLE

March 28, 2025:
Katie Faulkenberry and Taylor Hurst ‘20’s journey into ethical farming was shaped by a blend of shared values and a focus on sustainability. Faulkenberry, who had once been a vegetarian, and Hurst, whose roots run deep in East Texas ranching, found common ground in their passion for animal welfare and sustainable practices. Together, they have built Hurst Livestock Co., where respect for the land and animals is a top priority.

Hurst , a research engineer at the Bush Combat Development Center at Texas A&M’s RELLIS campus, specializes in research and development for the Department of Defense. Despite Hurst’s demanding career, his heart is deeply connected to the farm. 

“I grew up in East Texas,” Hurst said. “I’m a fourth-generation rancher, so being around animals was just a part of life for me.” 

For Faulkenberry, the shift toward farming was more gradual. As a vegetarian, she had never considered raising animals for food. But after meeting Hurst, her perspective began to change. 

“I was always hesitant about farming, especially raising animals for consumption,” Faulkenberry said. “But as we started working with animals ourselves, I realized how much care they need. It became about respect, not just raising them to eat.”

Combining Hurst’s lifelong passion for livestock with Faulkenberry’s shift toward ethical, sustainable agriculture. The couple’s journey took a significant turn one day when they posted to social media that they were selling a dozen free-range eggs.

3t6a5567
Katie Faulkenberry and Taylor Hurst show off two young turkeys on their farm on Friday, March 21, 2025. (Lillian Lopez/The Battalion)
“Within one hour, fifty-two people reached out wanting to buy them,” Faulkenberry said. “That was the moment we realized we had something special.”

They started small, raising chickens and cattle, all while learning the practices of animal welfare and sustainable farming. Without a blueprint to guide them, the couple relied on trial and error, research and advice from experienced ranchers. 

“I went to our USDA processing facility and I walked around for three and a half hours asking the most intricate questions that I could think of,” Faulkenberry said. “I went from never touching a cow in my life to selling beef from the cows that I have in my backyard in four years.” 

Over time, they expanded their operation and built a business that reflects their values, providing high-quality, ethically raised meat to their local community. Today, the couple manages a 31-acre free-range farm in Bryan-College Station, where they raise a variety of animals, including 410 egg-laying hens. 

Their diverse flock includes breeds such as Easter Eggers, Copper Marans, Leghorn and Freedom Rangers, providing a wide range of colorful eggs that have become a hallmark of their farm.

“We have everything from blue and green eggs to dark brown ones,” Hurst said. “It’s important to us to offer variety, and we love raising chickens that are as unique as they are productive.”

The couple sells their eggs on their website and directly to customers at Brazos Valley Farmers’ Market. Prices for their eggs range from $5 per half a dozen to $8 per dozen. 

“We want to make sure our products are affordable while still reflecting the care and quality we put into raising the animals,” Faulkenberry said. “At the end of the day, it’s about making sure our customers are getting the best.”

But it’s not just about the eggs. Their vision for the farm extends beyond just farming. Faulkenberry has plans to turn part of the land into a storefront and a potential spot for local schools to have field trips.

“We want to offer fresh, ethical products to the community and provide educational opportunities for kids,” Faulkenberry said. “It’s important to me to teach the next generation about where their food comes from. When I was younger, I didn’t learn these things, and I want to change that.”

The couple hopes to expand in the future, eyeing a nearby 40-acre parcel of land that would allow them to double their operation and create more opportunities for hands-on education and farming. 

3t6a5459
Taylor Hurst pets one of the cows on the farm on March 21, 2025. (Lillian Lopez/The Battalion)
 “We want to create something that’s not only self-sustaining but also benefits the community,” said Hurst. “We’re signing our names on these products, so it’s important to give people something they can trust and know was raised with care.”

One of the ways they accomplish this goal is by involving customers in the selection process for their livestock. By visiting the farm, customers can see firsthand how the animals are raised.  Hurst believes this strengthens their confidence in the process and deepens their connection to the food they’re consuming. 

“We let customers come onto the land and pick out their cows,” Hurst said. “They get to see the animals up close, understand how they’re raised and choose the exact one they want. It’s all about transparency and building trust.”

Hurst and Faulkenberry are focused on building something that will leave a lasting impact. It’s about more than just farming, it’s about building something that will endure. 

“Our legacy will stand for a family that has, one, stayed true to their word, and two, has built something that not only is self-deserving but a representation of the local community,”  Hurst said. “Providing to locals a product that was made by Texans for Texans … something that will carry on long after we’re gone.”






`

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    
    // Try to parse the response as JSON to validate it
    const jsonData = JSON.parse(responseText);
    
    // Write the formatted JSON to a file
    fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));
    console.log('Output has been written to output.json');
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
