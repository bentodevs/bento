const amqp = require("amqplib/callback_api");

// Define the exchange and queue
const exchange = "MESSENGER",
queue = "R2-D2_QUEUE";

exports.init = bot => {
    return new Promise((resolve, reject) => {
        // Define the database creds
        const db = bot.config.rabbit;

        amqp.connect(`amqp://${db.username}:${db.password}@${db.host}:${db.port}`, (error0, conn) => {
            // If something went wrong reject the error
            if (error0)
                return reject(error0);

            // Handle connection errors
            conn.on("error", err => {
                console.error(err);
            });

            conn.createChannel((error1, channel) => {
                // If something went wrong reject the error
                if (error1)
                    return reject(error1);

                // Handle channel errors
                channel.on("error", err => {
                    console.error(err);
                });

                // Assert the exchange
                channel.assertExchange(exchange, "fanout", {
                    durable: false
                });

                // Assert the queue
                channel.assertQueue(queue, {
                    exclusive: true,
                    durable: false
                }, error2 => {
                    // If something went wrong reject the error
                    if (error2)
                        return reject(error2);

                    // Bind the queue
                    channel.bindQueue(queue, exchange, "");
                });

                // Resole the channel
                resolve(channel);
            });
        });
    });
};