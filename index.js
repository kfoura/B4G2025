const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

const PORT = 4000;
require('dotenv').config();

app.use(express.json());

const scrapeData = async (url) => {
    try {
        const {data} = await axios.get(url);
        const $ = cheerio.load(data);
        const article = $('p').text();
        //article = article.substring(0, 400);
        const date = getDate($);
        if (date === null) {
            date = ""; }
        return {article, date};
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to handle it in the route
    }
};

const getDate = async ($) => {
    const metaSelectors = [
        'meta[property="article:published_time"]',
        'meta[name="publish-date"]',
        'meta[name="date"]',
        'meta[name="dcterms.created"]',
        'meta[itemprop="datePublished"]'
    ];

    for (const selector of metaSelectors) {
        const meta = $(selector);
        if (meta.length) {
            return meta.attr('content');
        }
    }
    console.log("Published date not found in meta tags.");
    return null;
}

app.get('/api/scrape', async (req, res) => {
    try {
        const url = req.query.url; // Get URL from query parameters
        if (!url) {
            return res.status(400).json({ 
                error: 'URL parameter is required',
                example: 'Use /api/scrape?url=https://example.com'
            });
        }
        
        const data = await scrapeData(url);
        res.json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to scrape data',
            details: error.message
        });
    }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
//const fs = require("fs");

const apiKey = process.env.API_KEY;
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

async function run(url, article, date) {
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
  "impartiality": 0%
  "articleLink": ""
}

Article Link: ${url}

When determining the bias, don't just look at the text, but also look at the title and the url as well as the date, author (do research on the author), fact-checking databases, and transparency of the source.
Specifically mention false/misleading information as part of the justification, indicate the quote and the source. For the confidence in accuracy, use the fact-checking databases and the transparency of the source to determine the confidence in accuracy.
MAKE SURE YOU GET ALL FACTUAL AND MISLEADING INFORMATION FROM THE ARTICLE

${date}):
${article}
`

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    
    // Try to parse the response as JSON to validate it
    const jsonData = JSON.parse(responseText);
    return jsonData;
    // Write the formatted JSON to a file
    //fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));
    console.log('Output has been written to output.json');
  } catch (error) {
    console.error("Error:", error);
  }
}

app.post('/api/run', async (req, res) => {
    let client;
    try {
        const {url} = req.body;
        const scrapedData = await axios.get(`http://localhost:4000/api/scrape?url=${url}`);
        
        // Extract article and date from scrapedData
        const { article, date } = scrapedData.data;
        
        const result = await run(url, article, date);
        
        // Initialize MongoDB client
        client = new MongoClient(process.env.MONGO_URI);
        
        try {
            await client.connect();
            const db = client.db('RepufyAI');
            const collection = db.collection('RepufyAI');
            await collection.insertOne(result);
            res.json({message: 'Run completed', result});
        } finally {
            if (client) {
                await client.close();  // Make sure to close the connection
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Failed to process request',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
