require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');

run();

async function run() {
	const broswer = process.env.BROWSER;
	const driver = await new Builder().forBrowser(broswer).build();

	try {
		await driver.manage().window().maximize();
		await driver.get('http://www.neopets.com');

		await login(driver);
		await collectInterest(driver);
		await buyStocks(driver);
		await sellStocks(driver);
	} catch(e) {
		console.log('Error while running\n', e);
	} finally {
		await driver.sleep(3000);
		await driver.quit();
	}
}

async function login(driver) {
	const username = process.env.USERNAME;
	const password = process.env.PASSWORD;
	const xpath = {
		loginLink: '//*[@id="header"]/table/tbody/tr[1]/td[3]/a[1]',
		usernameField: '//*[@id="templateLoginPopupUsername"]',
		passwordField: '//*[@id="templateLoginPopup"]/div/form/table/tbody/tr[2]/td[2]/input',
		logoutLink: '//*[@id="logout_link"]',
	}

	await driver.navigate().to('http://www.neopets.com');
	await driver.findElement(By.xpath(xpath.loginLink)).click();
	await driver.findElement(By.xpath(xpath.usernameField)).sendKeys(username);
	await driver.findElement(By.xpath(xpath.passwordField)).sendKeys(password, Key.RETURN);
	await driver.wait(until.elementLocated(By.xpath(xpath.logoutLink)));
}

async function collectInterest(driver) {
	const xpath = {
		interestBox: '//*[@id="content"]/table/tbody/tr/td[2]/table[2]',
		button: '//*[@id="content"]/table/tbody/tr/td[2]/table[2]/tbody/tr/td/div/table/tbody/tr[2]/td/div/form/input[2]',
	}

	await driver.navigate().to('http://www.neopets.com/bank.phtml');
	await driver.wait(until.elementLocated(By.xpath(xpath.interestBox)));

	try {
		await driver.findElement(By.xpath(xpath.button)).click();
	} catch (e) {
		if (e.name !== 'NoSuchElementError') {
			console.log('Bank error', e);
		}
	}

	await driver.sleep(3000);
}

async function buyStocks(driver) {
	const buyPrice = 20;
	const numShares = 10;
	const xpath = {
		stockField: '//*[@id="content"]/table/tbody/tr/td[2]/div[2]/form/input[2]',
		stockTable: '//*[@id="content"]/table/tbody/tr/td[2]/div[2]/table/tbody',
		stockLink: '//*[@id="content"]/table/tbody/tr/td[2]/div[2]/table/tbody/tr[1]/td[2]/a/b/font',
		stockNumberField: '//*[@id="content"]/table/tbody/tr/td[2]/div[2]/form/table/tbody/tr[2]/td[2]/input',
	}

	await driver.navigate().to('http://www.neopets.com/stockmarket.phtml?type=list');
	let stockField = await driver.wait(until.elementLocated(By.xpath(xpath.stockField)));
	await stockField.sendKeys(Key.SPACE, Key.RETURN);

	let stockTable = await driver.wait(until.elementLocated(By.xpath(xpath.stockTable)));
	let stocks = await stockTable.findElements(By.css('tr:not(:first-child)'));

	let stockInfo = [];

	for (stock of stocks) {
		try {
			let stockLink = await stock.findElement(By.css('td:nth-child(2) a b'));
			let stockPrice = await stock.findElement(By.css('td:nth-child(6)')).getText();

			stockInfo.push({
				link: stockLink,
				price: stockPrice,
			});
		} catch (e) {
			if (e.name !== 'NoSuchElementError') {
				console.log('Stock error', e);
			}

			continue;
		}
	}

	stockInfo = stockInfo.filter((stock) => stock.price >= 15 && stock.price <= buyPrice);
	stockInfo = stockInfo.sort((a, b) => a.price - b.price);

	if (stockInfo.length > 0) {
		await stockInfo[0].link.click();

		let stockLink = await driver.wait(until.elementLocated(By.xpath(xpath.stockLink)));
		await stockLink.click();

		let stockNumberField = await driver.wait(until.elementLocated(By.xpath(xpath.stockNumberField)));
		await stockNumberField.sendKeys(numShares.toString(), Key.RETURN);
	}

	await driver.sleep(3000);
}

async function sellStocks(driver) {
	const sellPrice = 30;
	const xpath = {
		stockTable: '//*[@id="postForm"]/table[1]/tbody',
		sellButton: '//*[@id="show_sell"]/center/input',
	}

	await driver.navigate().to('http://www.neopets.com/stockmarket.phtml?type=portfolio');
	let stockTable = await driver.wait(until.elementLocated(By.xpath(xpath.stockTable)));
	let stocks = await stockTable.findElements(By.css('tr:not(:nth-child(-n+2)):not(:last-child):nth-child(odd)'));

	let stockInfo = [];

	for (stock of stocks) {
		try {
			let stockArrow = await stock.findElement(By.css('td:first-child img:first-child'));
			let stockShareTable = await stock.findElement(By.xpath('following-sibling::*[1]'));
			let stockPrice = await stock.findElement(By.css('td:nth-child(4)')).getText();

			stockInfo.push({
				arrow: stockArrow,
				shareTable: stockShareTable,
				price: stockPrice,
			});
		} catch (e) {
			if (e.name !== 'NoSuchElementError') {
				console.log('Stock error', e);
			}

			continue;
		}
	}

	stockInfo = stockInfo.filter((stock) => stock.price >= sellPrice);
	stockInfo = stockInfo.sort((a, b) => a.price - b.price);

	if (stockInfo.length > 0) {
		for (stock of stockInfo) {
			await stock.arrow.click();

			let shares = await stock.shareTable.findElements(By.css('tbody tr:not(:first-child)'));

			for (share of shares) {
				let numShares = await share.findElement(By.css('td:first-child')).getText();
				let shareField = await share.findElement(By.css('input'));
				await shareField.sendKeys(numShares);
			}
		}

		await driver.findElement(By.xpath(xpath.sellButton)).click();
	}

	await driver.sleep(3000);
}
