const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Too Many Requests</title>
                    <style>
                    body {
                        background-color: #f8d7da; /* light red background */
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: Arial, sans-serif;
                    }
                    .message-box {
                        text-align: center;
                        background-color: #fff3f3;
                        border: 2px solid #f5c2c7;
                        padding: 30px 40px;
                        border-radius: 10px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        max-width: 500px;
                    }
                    .message-box h1 {
                        color: #842029; /* dark red */
                        font-size: 24px;
                        margin-bottom: 15px;
                    }
                    .message-box p {
                        color: #6c1b1b;
                        font-size: 16px;
                    }
                    </style>
                    </head>
                    <body>
                    <div class="message-box">
                        <h1>Too Many Requests</h1>
                        <p>Please try again after <strong>15 minutes</strong>.</p>
                    </div>
                    </body>
                    </html>
                `
});