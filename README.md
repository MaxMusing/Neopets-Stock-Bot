# Neopets Stock Bot

A simple Selenium bot that buys and sells stocks on the Neopets stock market.

## Usage

### Prerequisites

Neopets Stock Bot uses Node.js. Download the latest version [here](https://nodejs.org/).

### Installation

Install dependencies with either npm:

```
npm install
```

or Yarn:

```
yarn
```

Depending on your browser, you may need to download a driver or enable remote automation to use Selenium. Attempting to run the program without doing so will give you an error message with instructions on how to download the driver. Refer to the [Selenium documentation](https://docs.seleniumhq.org/docs/03_webdriver.jsp#selenium-webdriver-s-drivers) for more information.

### Usage

Create a `.env` file to store your Neopets username and password. You must also set your desired browser here.

```
BROWSER = <chrome/firefox/safari>
USERNAME = <neopets-username>
PASSWORD = <neopets-password>
```

Start the bot by simply running the program with Node.js:

```
node index.js
```
