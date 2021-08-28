// Import dependencies
const { createServer } = require("net");
const rsa = require("node-rsa");

// Create EventEmitter
require("util").inherits(server, require("events").EventEmitter);

function server(privateKey, port) {

    // Get the private key
    const key = new rsa(Buffer.from(`-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`), "pkcs8-private-pem", {
        encryptionScheme: "pkcs1"
    });

    // Create the vote server
    const server = createServer();

    // Handle inbound connections
    server.on('connection', socket => {
        // Set the socket timeout
        socket.setTimeout(3000);

        // Handle any socket errors
        socket.on("error", err => {
            this.emit("error", new Error(err));
        });

        // If the socket times out, then close it
        socket.on("timeout", () => {
            // Close the socket
            socket.end();
        });

        socket.on("data", (data) => {
            if (data.length !== 256) {
                // Emit an error
                this.emit("error", new Error("Invalid data length!"));

                // End an destroy the socket
                socket.end();
                socket.destroy();
            }

            let message;

            try {
                // Descrypt the data
                message = key.decrypt(data, "utf8");
            } catch (err) {
                // Emit an error
                this.emit("error", new Error(err));

                // End and destroy the socket
                socket.end("Failed to decrypt data!");
                socket.destroy();
            }

            // Return if no message data
            if (!message)
                return;

            // Split the message into a new line for each element
            const voteData = message.split("\n");

            // If the message type is not "VOTE" then return
            if (voteData[0] !== "VOTE") {
                // Emit an error
                this.emit("error", new Error("Invalid vote data was received!"));

                // End and destroy the socket
                socket.end("Invalid vote data was received!");
                socket.destroy();
            }

            // Emit the vote data
            this.emit("vote", voteData[2], voteData[1], voteData[3], Date.now());

            // End and destroy the socket
            socket.end();
            socket.destroy();
        });
    });

    // Listen to the specified port (if no port is specified default to 8192)
    server.listen(port || 8192);
}

module.exports = server;