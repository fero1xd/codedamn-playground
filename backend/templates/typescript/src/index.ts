import { getDB } from "./config";

import express from "express";

const main = () => {
	const app = express();

	app.get("/", (req, res) => {
		return res.json({
			name: "Hello",
		});
	});
	app.listen(42049, () => {
		console.log("Server listening on port 42049");
	});
};

main();
