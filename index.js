import { AptosClient, AptosAccount, CoinClient } from "aptos";
import { Buffer } from "buffer";
import { config } from "./config.js";
import consoleStamp from 'console-stamp';
import fs from 'fs'

consoleStamp(console, { format: ':date(HH:MM:ss)' });

const parseFile = fileName => fs.readFileSync(fileName, "utf8").split('\n').map(str => str.trim()).filter(str => str.length > 10);
const generateRandomNumber = (min, max) => Math.round(Math.random() * (max - min) + min);
const timeout = ms => new Promise(res => setTimeout(res, ms))

const client = new AptosClient(config.rpc);
const coinClient = new CoinClient(client)
const retriesMap = new Map();

function handleRetries(address) {
    let maxRetries = config.retries;
    let count = retriesMap.get(address) + 1 || 1;
    retriesMap.set(address, count);

    return count < maxRetries
}

async function sendTransaction(sender, payload) {
    try {
        const txnRequest = await client.generateTransaction(sender.address(), payload, {
            max_gas_amount: generateRandomNumber(1500, 2000),
        });
        const signedTxn = await client.signTransaction(sender, txnRequest);
        const transactionRes = await client.submitTransaction(signedTxn);
        console.log(`tx: https://explorer.aptoslabs.com/txn/${transactionRes?.hash}?network=mainnet`);

        return await client.waitForTransactionWithResult(transactionRes.hash, { checkSuccess: true })
    } catch (err) {
        try {
            console.log('[ERROR]', JSON.parse(err?.message).message)
        } catch { console.log('[ERROR]', err.message) }

        if (handleRetries(sender.address().toString())) {
            await timeout(10000)
            return await sendTransaction(sender, payload)
        }
    }
}


async function sendvote(sender, payload) {
        console.log('SENDING...');
        return await sendTransaction(sender, {
            function: "0x266cd0b98d94aa6b10b843cdf79ed05706323f2fca9e8faf6940f78e2c8a59af::question::vote",
            type_arguments: [],
            arguments: payload
        })
}


function generatePayload(viewerAddress) {
  const url = `https://www.letsfindout.ai/api/trpc/indexer.getQuestions?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22sortBy%22%3A%22created_at_secs%22%2C%22filterBy%22%3A%7B%22pollStatus%22%3A%22open%22%7D%2C%22limit%22%3A10%2C%22viewerAddress%22%3A%22${viewerAddress}%22%2C%22excludeNoVoteClosedQuestions%22%3Atrue%2C%22cursor%22%3Anull%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22cursor%22%3A%5B%22undefined%22%5D%7D%7D%7D%7D`;



  const getRandomValue = (array) => array[Math.floor(Math.random() * array.length)];
  
  const headers = {
      'authority': 'www.letsfindout.ai',
      'accept': '*/*',
      'accept-language': getRandomValue(['ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7', 'en-US,en;q=0.9', 'es-ES,es;q=0.9']),
      'content-type': 'application/json',
      'dnt': '1',
      'referer': 'https://www.letsfindout.ai/crowd',
      'sec-ch-ua': getRandomValue(['"Not_A Brand";v="8"', '"Chromium";v="120"', '"Mozilla";v="80"']),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': getRandomValue(['"Windows"', '"Mac"', '"Linux"']),
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'trpc-batch-mode': 'stream',
      'user-agent': getRandomValue([
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/120.0.0.0 Chrome/120.0.0.0 Safari/537.36',
          // Add more user-agents as needed
          // ...
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ]),
      'x-trpc-source': 'react',
  };
  
  return fetch(url, {
      method: 'GET',
      headers: headers,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const polls = data['0']?.result?.data?.json?.polls || [];
      const randomIndex = Math.floor(Math.random() * polls.length);
      const randomQuestion = polls[randomIndex]?.question;
      const questionAddress = randomQuestion?.question_address;

      if (questionAddress) {
        console.log(`Randomly Selected Question Address: ${questionAddress}`);
        // Set x1 as the questionAddress
        let x1 = questionAddress;
        // Generate one random number between 1 and 4
        let random = Math.ceil(Math.random() * 4);
        let x2 = `${random}`;
        let x3 = "1000000000";

        return [x1, x2, x3];
      } else {
        console.log('No questions found.');
        // If no question is found, return an array with default values
        return ["default_x1", "default_x2", "default_x3"];
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // If an error occurs, return an array with default values
      let default_x1 = `0x9de710e9b32aeadec973b8e55cfa49be983dd8cf7f082d1e4f8e7ccf18b8f001`;
      let random = Math.ceil(Math.random() * 4);
      let default_x2 = `${random}`;
      let default_x3 = "1000000000";
      return [default_x1, default_x2, default_x3];
    });
}


async function checkBalance(account) {
    try {
        let balance = Number(await coinClient.checkBalance(account)) / 100000000;
        console.log(`Balance ${balance} APT`);

        return balance
    } catch (err) {
        try {
            if (JSON.parse(err?.message).message.includes('Resource not found')) {
                console.log(`Balance 0 APT`);
                return 0
            } else console.log('[ERROR]', JSON.parse(err?.message).message)
        } catch {
            console.log('[ERROR]', err.message)
        }

        if (handleRetries(account.address().toString())) {
            await timeout(2000)
            return await checkBalance(account)
        }
    }
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delayedFunction() {
  console.log('This is executed after a delay');
}

// Function to log time remaining on the same line
function logTimeRemaining(remainingSeconds) {
  process.stdout.write(`Time remaining: ${remainingSeconds.toFixed(3)} seconds\r`);
}

(async () => {
  let privateKeys = parseFile('priv_key.txt');

  for (let str of privateKeys) {
    const pk = str.slice(2, str.length);
    const account = new AptosAccount(Uint8Array.from(Buffer.from(pk, 'hex')));
    const viewerAddress = account.address().toString(); // Change the variable name to viewerAddress
    console.log(viewerAddress);
    const balance = await checkBalance(account);

    if (balance > 0) {
      try {
        const payload = await generatePayload(viewerAddress);
        console.log(payload);
        await sendvote(account, payload);
        console.log("-".repeat(70));
        const minDelay = 200000; // replace with your minimum delay in milliseconds
        const maxDelay = 500000; // replace with your maximum delay in milliseconds
        const delay = getRandomDelay(minDelay, maxDelay);

        // Log the countdown during the delay
        for (let remainingSeconds = delay / 1000; remainingSeconds > 0; remainingSeconds--) {
          logTimeRemaining(remainingSeconds);
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
        }

        delayedFunction();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  // Add a newline after the loop completes
  console.log();
})();