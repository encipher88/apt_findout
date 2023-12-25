import fs from 'fs'
// Target API endpoint URL
const url = 'https://letsfindout.ai/api/trpc/points.tryGive?batch=1';

// Headers for the HTTP request
const getRandomValue = (array) => array[Math.floor(Math.random() * array.length)];

const headers = {
    'accept': '*/*',
    'accept-language': getRandomValue(['ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7', 'en-US,en;q=0.9', 'es-ES,es;q=0.9']),
    'content-type': 'application/json',
    'sec-ch-ua': getRandomValue(['"Not_A Brand";v="8"', '"Chromium";v="120"', '"Mozilla";v="80"']),
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': getRandomValue(['"Windows"', '"Mac"', '"Linux"']),
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'trpc-batch-mode': 'stream',
    'x-trpc-source': 'react',
};

// File path containing recipient addresses
const filePath = 'address.txt';

// Function to send requests
async function sendRequests() {
    // Read the file asynchronously
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');

        // Split the file content into an array of lines
        const lines = data.split('\n');

        // Loop through each line in the file
        for (const line of lines) {
            // Extract the recipient address and remove any leading/trailing whitespace
            const toAddr = line.trim();

            // Construct the JSON data for the request
            const requestData = {
                "0": {
                    "json": {
                        "toAddr": toAddr
                    }
                }
            };

            // Print a message indicating the request is being sent
            console.log(`Sending request for ${toAddr}...`);

            try {
                // Send the POST request with JSON data and headers using the new fetch
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestData),
                    referrer: 'https://letsfindout.ai/crowd',
                    referrerPolicy: 'strict-origin-when-cross-origin',
                    mode: 'cors',
                    credentials: 'omit',
                });

                // Check for HTTP errors
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse and print the response for debugging purposes
                const responseBody = await response.text();
                console.log(`Response for ${toAddr}: ${responseBody}`);
            } catch (error) {
                // Handle any exceptions that may occur during the request
                console.error(`Error for ${toAddr}: ${error.message}`);
            }

            // Introduce a random delay between 1 and 5 seconds before the next request
            const delaySeconds = Math.random() * (500 - 200) + 1;
            console.log(`Waiting for ${delaySeconds.toFixed(2)} seconds before the next request...`);
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        }
    } catch (err) {
        console.error(`Error reading file: ${err}`);
    }
}

// Invoke the function to send requests
sendRequests();
