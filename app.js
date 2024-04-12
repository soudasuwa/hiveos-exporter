import express from "express"
import { register } from "prom-client"

import { update } from "./update.js"

export const app = express()

app.get("/", async (req, res) => {
	res.end("<a href='/metrics'>/metrics</a>")
})

app.get("/metrics", async (req, res) => {
	await update()

	res.set("Content-Type", register.contentType)
	res.end(await register.metrics())
	res.end()
})
