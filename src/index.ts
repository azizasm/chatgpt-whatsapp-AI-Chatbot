// cd 
//  npm run start
// 

const process = require("process")
const qrcode = require("qrcode-terminal");
// const { Client } = require("whatsapp-web.js");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { Message, ClientInfo, Buttons } = require('whatsapp-web.js/src/structures');

import { ChatGPTAPI } from 'chatgpt'



// Environment variables
require("dotenv").config()

// Prefix check
const prefixEnabled = process.env.PREFIX_ENABLED == "true"
//const prefix = '!gpt'
const prefix = '!cimb'

// Whatsapp Client
//const client = new Client()
const client = new Client({
	authStrategy: new LocalAuth()
});



const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

// Entrypoint
const start = async () => {


    // Whatsapp auth
    client.on("qr", (qr: string) => {
        console.log("[ChatGPT] Scan this QR code in whatsapp to log in:")
        qrcode.generate(qr, { small: true });
    })

    // Whatsapp ready
    client.on("ready", () => {
        console.log("[ChatGPT] Client is ready!");
    })

    // Whatsapp message
    client.on("message", async (message: any) => {
		
		
		let chat = await message.getChat();
        if (chat.isGroup) {
			console.log("[ChatGPT] ignore group chat from  : " + chat.name )
			return
		}
/*
        if (message.body.toUpperCase() === 'HELLO' || 
        message.body.toUpperCase() === 'HI'  ||
        message.body.toUpperCase() === 'HELP'  ||
        message.body.toUpperCase() === ' '  ||
        message.body.toUpperCase() === 'HOW'  ||
        message.body.toUpperCase() === 'WHY'  ||
        message.body.toUpperCase() === '.'  ||
        message.body.toUpperCase() === '?'         
        ) {
            console.log("[ChatGPT]  Hello -skip : " + message.body  )
            let button = new Buttons('Button body', [{ body: 'Aceptar' }, { body: 'rechazar' }], 'title', 'footer');
            //client.sendMessage(message.from, button);

            client.sendMessage(message.from, '*Automated Responses for customer enquiry*\n-Powered by _ChatGPT_\n```Please ask your enquiry in single request.```');
            //client.sendMessage(message.from, button); // TODO - issue with 
            
            return
        }

        if (message.body === '!chats') {
            const chats = await client.getChats();
            console.log("[ChatGPT]!chats -skip : " + chats.text )
            client.sendMessage(message.from, `The bot has ${chats.length} chats open.`);
            return
        } 
        if (message.hasMedia) {
            console.log("[ChatGPT]hasMedia -skip : "  )
           // client.sendMessage(message.from, `The bot does not support media`);
            return
        } 
        if (message.hasQuotedMsg) {
            console.log("[ChatGPT]hasQuotedMsg -skip : "  )
            client.sendMessage(message.from, `The bot does not support QuotedMsg`);
            return
        } 
        if(   message.body.length < 6 ){
            console.log("[ChatGPT]Message too short -skip : " + message.body  )
           // client.sendMessage(message.from, '```Error: Message too short.```');
            return
        }
        if (message.body === 'Aceptar' || message.body === 'rechazar' ) {
            console.log("[ChatGPT]  Aceptar rechazar -skip : " + message.body  )
            return
        }
		*/
        if (message.body.length == 0) return
        if (message.from == "status@broadcast") return
		
		

        if (prefixEnabled) {
            if (message.body.startsWith(prefix)  || message.body.startsWith("!gpt")  ) {
                // Get the rest of the message
                const prompt = message.body.substring(prefix.length + 1);
                //const prompt = message.body.substring(prefix.length );
                await handleMessage(message, prompt)
            }
        } else {
            await handleMessage(message, message.body)
        }
    })

    client.initialize()
}

const handleMessage = async (message: any, prompt: any) => {
    try {
        const start = Date.now()

        // Send the prompt to the API
        console.log("[ChatGPT] Received prompt from " + message.from + ": " + prompt)
		const  tmp  = prompt ; 
		//prompt = " " + tmp;

        prompt = process.env.GPT_PROMPTS_CUSTOMER_SUPPORT01  + tmp;
		//console.log("[ChatGPT] full msg before send:  " + prompt )

        if (message.body.startsWith("!gpt")) {
            prompt =   tmp.substring("!gpt".length + 1); //direct call TODO
        }

        const response = await api.sendMessage(prompt)

        console.log(`[ChatGPT] Answer to ${message.from}: ${response.text}`)

        const end = Date.now() - start

        console.log("[ChatGPT] ChatGPT took " + end + "ms")

        // Send the response to the chat
        message.reply(response.text)
    } catch (error: any) {
        console.error("An error occured", error)
        message.reply("An error occured, please contact the administrator. (" + error.message + ")")
    }
}

start()
