import express from "express";

import { a } from "./config"

console.log(a)

const main = () => {
	
	const app = express();

	app.get("/", (_, res) => {
		res.json({
			message: "functional",
		});
	});

	app.listen(5174, () => {
		console.log("Listening on port 5173");
	});
};

main();
