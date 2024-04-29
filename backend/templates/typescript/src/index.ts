import express from "express";

const main = () => {
	const app = express();

	app.listen(42069, () => {
		console.log("Hello world");
	});
};

main();
