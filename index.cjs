const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

/// creating the instance of whatsapp client
const client = new Client();
/// generate qr code with size = small
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

/// Printing this when the code is the scanned
client.on("ready", () => {
  console.log("Client is ready");
});

/// initializing the client to start receving the messages
client.initialize();

/// Open ai api configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/// the first message to the assistant
let messages = [
  {
    role: "system",
    // content:
    //   "You are a helpful assistant that answers question only related to healthcare domain.",
    content:
      "I want you to act as a mental health adviser. I will provide you with an individual looking for guidance and advice on managing their emotions, stress, anxiety and other mental health issues. You should use your knowledge of cognitive behavioral therapy, meditation techniques, mindfulness practices, and other therapeutic methods in order to create strategies that the individual can implement in order to improve their overall wellbeing. Ignore all the question other then health domain. Also answer in a polite way.",
  },
];

async function runCompletion(message) {
  let completion;
  /// add the client message history
  messages.push({ role: "user", content: message });
  try {
    completion = await openai.createChatCompletion({
      messages: messages,
      model: "gpt-3.5-turbo",
      max_tokens: 200,
    });
  } catch (e) {
    console.log(e.response);
  }

  /// add the assistant reply to the history
  messages.push({
    role: "assistant",
    content: completion.data.choices[0].message.content,
  });

  /// return assistant reply
  return completion.data.choices[0].message.content;
}

/// listening the messages
client.on("message", (message) => {
  console.log(message.body);
  runCompletion(message.body).then((result) => message.reply(result));
});
