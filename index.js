require("dotenv").config();
if (isNaN(process.env["DELAY"])) {
  throw new Error("DELAY env variable is NaN.");
}
if (process.env["LINKS"] == undefined) {
  throw new Error("LINKS env variable is undefined.");
}
if (process.env["EMAIL"] == undefined) {
  throw new Error("EMAIL env variable is undefined.");
}
if (process.env["APP_PASSWORD"] == undefined) {
  throw new Error("APP_PASSWORD env variable is undefined.");
}
if (process.env["RECEIVERS"] == undefined) {
  throw new Error("LINKS env variable is undefined.");
}
if (process.env["PORT"] == undefined) {
  throw new Error("PORT env variable is undefined.");
}
const port = process.env["PORT"]
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env["EMAIL"],
    pass: process.env["APP_PASSWORD"],
  },
});

let emailCooldownTill = 0;
let errors = {
  count: 0,
  errorsRecord: [],
  increase: (e, url) => {
    const timestamp = new Date().toISOString(); // Add timestamp for when the error occurs
    errors.count++;
    errors.errorsRecord.push({ e, url, timestamp });
    if (errors.count > 5) {
      if (emailCooldownTill < Date.now()) {
        console.log("Sending email...");
        sendEmail(errors.errorsRecord);
        emailCooldownTill = Date.now() + 24 * 60 * 60 * 1000; // 24-hour cooldown
      }
    }
  },
};
const links = process.env["LINKS"].split(",").map((link) => link.trim());
const delay = parseInt(process.env["DELAY"]);

async function sendEmail(errors) {
  const info = await transporter.sendMail({
    to: process.env["RECEIVERS"], // list of receivers
    subject: `Service Pinger - Ping Fail`, // Subject line
    html: `<!DOCTYPE html>
  <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Error Alert</title>
  <style>
    body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1e1e2f;
    color: #e4e4e4;
    line-height: 1.6;
  }
   p {
   text-decoration: none;
} 
    .container {
    width: 100%;
    padding: 20px;
    background-color: #1e1e2f;
  }
    .alert-box {
      background-color: #2b2c43;
    border: 1px solid #444559;
    border-radius: 8px;
    padding: 20px;
    max-width: 700px;
    margin: auto;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  }
    .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 15px;
    border-bottom: 1px solid #444559;
  }
    .alert-header h1 {
    color: #ff5e5e;
    margin: 0;
    font-size: 22px;
  }
    .alert-header .status {
      background-color: #ff5e5e;
    padding: 5px 15px;
    border-radius: 12px;
    font-size: 14px;
    color: white;
    text-transform: uppercase;
  }
    .alert-body {
      padding-top: 15px;
  }
    .alert-body h3 {
    color: #f0f0f0;
    margin-top: 0;
    font-size: 18px;
    font-weight: 500;
  }
    .alert-body p {
    margin: 5px 0;
    font-size: 14px;
    color: #bbbbbb;
  }
    .data-box {
      background-color: #33334d;
    border-left: 4px solid #ff8c8c;
    padding: 15px;
    margin-top: 10px;
    border-radius: 4px;
    font-family: Consolas, 'Courier New', Courier, monospace;
    color: #ff8c8c;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
    .alert-footer {
      padding-top: 15px;
    text-align: center;
    font-size: 12px;
    color: #aaaaaa;
  }
    .alert-footer p {
    margin: 0;
  }
    .alert-footer a {
    color: #62dafb;
    text-decoration: none;
    font-weight: 500;
  }
    .alert-footer a:hover {
    color: #50c7e8;
  }
  </style>
</head>
  <body>
  <div class="container">
    <div class="alert-box">
      <div class="alert-header">
        <h1>⚠️ Service Error Alert - (Ping fail)</h1>
        <span class="status">Error</span>
      </div>
      <div class="alert-body">
        <h3>5 or more failed attempts when pinging services.</h3>
        ${
      errors.map((error) => {
        return `<p>${htmlEntities(error.url)}</p>
          <div class="data-box">${htmlEntities(error.e)}</div>`;
      }).join("")
    }
      </div>
      <div class="alert-footer">
        <p>Service Pinger</p>
      </div>
    </div>
  </div>
  </body>
</html>
`,
  });
  console.log("Sent Email.");
}
function htmlEntities(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
    />/g,
    "&gt;",
  ).replace(/"/g, "&quot;");
}
function pingSites() {
  for (const linkindex in links) {
    ping(links[linkindex]);
  }
}

async function ping(link) {
  let error = false;
  //console.log(`Pinging ${link}.`);
  const response = await fetch(link).then((res) => {
    if (!res.ok) {
      error = true;
      console.log(`Response from ${link} is not ok.`);
      errors.increase(`Response from ${link} is not ok.`, link);
    }
    return res.text();
  }).then((t) => {
    if (error) console.log(`Error response: ${t}`);
  }).catch((e) => {
    console.log(`Error pinging link(${link}): ${e}`);
    errors.increase(`Error pinging link(${link}): ${e}`, link);
    error = true;
  });
  if (!error) {
    //console.log(`Pinged ${link}.`);
  }
}

setInterval(pingSites, delay);
console.log(`Pinging started. Pinging in ${delay}ms`);

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Logs</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #1e1e2f;
        color: #e4e4e4;
        line-height: 1.6;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      h1 {
        font-size: 28px;
        color: #62dafb;
        margin-bottom: 20px;
      }

      .log-entry {
        background-color: #2b2c43;
        border: 1px solid #444559;
        border-radius: 8px;
        margin-bottom: 20px;
        padding: 15px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .log-header h3 {
        margin: 0;
        font-size: 20px;
        color: #f0f0f0;
      }

      .log-header .status {
        font-size: 14px;
        padding: 5px 12px;
        border-radius: 12px;
        background-color: #ff5e5e;
        color: white;
        text-transform: uppercase;
      }

      .log-body {
        font-size: 16px;
        background-color: #33334d;
        border-left: 4px solid #ff8c8c;
        padding: 15px;
        border-radius: 4px;
        color: #bbbbbb;
        font-family: Consolas, 'Courier New', Courier, monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .log-footer {
        font-size: 12px;
        color: #888888;
        text-align: right;
        padding-top: 10px;
      }

      .pagination {
        text-align: center;
        margin-top: 30px;
      }

      .pagination a {
        color: #62dafb;
        text-decoration: none;
        padding: 8px 15px;
        border: 1px solid #444559;
        border-radius: 4px;
        margin: 0 5px;
      }

      .pagination a:hover {
        background-color: #444559;
      }

      @media (max-width: 768px) {
        .log-header h3 {
          font-size: 18px;
        }

        .log-body {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Service Logs</h1>
      ${errors.count == 0 
        ? `<p>No errors logged yet.</p>` 
        : errors.errorsRecord
            .slice()
            .reverse() // Reverse the order to show newest logs first
            .map((log, index) => `
          <div class="log-entry">
            <div class="log-header">
              <h3>Error #${errors.count - index}</h3>
              <span class="status">ERROR</span>
            </div>
            <div class="log-body">
              <strong>URL:</strong> ${log.url}<br>
              <strong>Error Message:</strong> ${log.e}
            </div>
            <div class="log-footer">
              Logged at: ${new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
        `).join('')}
    </div>
  </body>
  </html>`);
});


app.listen(port, () => {
  console.log(`App listening on :${port}`)
})