import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import {Configuration, OpenAIApi} from 'openai';

dotenv.config(); // initiate the dotenv setup configs

// create a new configuration and setup the api key :
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// initialize the express app :
const app = express();

// setup the middleware cors : to faciliate Cross-Origin Requests
app.use(cors());

// logic to allow passing of json from frontend :
app.use(express.json());

// logic to implement a dummy root route :
app.get('/', async(req,resp) =>{
    resp.status(200).send({
        message: "Hello From codeGenie",
    })
});

// utility to handle the response from the API : we basically use response 
// -----------------------------------------------------------------------
// with the following @params :
// ----------------------------
// model = model name <text-davinci-003 in our case>,
// prompt = the prompt fetched from frontend as user query based on which
//          the API generates response !!
// temperature = higher temperature means model will take more risks and 
//               think MORE before responding , but we want it to answer
//               whatever it knows without any overthinking !!
// max tokens = upper bound of length of responses (we want the bot to give
//              pretty long responses !!)
// frequency_penalty = its a kindof penalty meaning the bot will not repeat  
//                     similar responses even if the same query's Re-FIRED !
app.post('/', async(req,resp) => {
    // allows fetching of the data from the body of the frontend requests
    try {
        const prompt = req.body.prompt;
        const response = await openai.createCompletion({
            model:"text-davinci-003",
            prompt:`${prompt}`,
            temperature:0,
            max_tokens:3000,
            top_p:1,
            frequency_penalty:0.5,
            presence_penalty:0,
        });
        resp.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        resp.status(500).send({error})
    }
})

// Logic to ensure that Our Server ALways Passively Listens for Connections :
// --------------------------------------------------------------------------
app.listen(5000,() => console.log('[Server] running on port http://localhost:5000'));
