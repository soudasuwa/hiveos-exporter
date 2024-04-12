import { Counter, Gauge } from "prom-client"

import { HiveOSAPI } from "./api.js"

if (typeof process.env.HIVEOS_API !== "string" || process.env.HIVEOS_API.length === 0) {
	throw new Error(`process.env.HIVEOS_API is not set`)
}

export const hive = new HiveOSAPI(process.env.HIVEOS_API)

const hiveos_updates_total = new Counter({
	name: "hiveos_updates_total",
	help: "Total number of HiveOS updates"
})

const hiveos_updates_errors_total = new Counter({
	name: "hiveos_updates_errors_total",
	help: "Total number of HiveOS update errors",
	labelNames: ["error"]
})

const hiveos_farms_total = new Gauge({
	name: "hiveos_farms_total",
	help: "Total number of farms"
})

const hiveos_workers_total = new Gauge({
	name: "hiveos_workers_total",
	help: "Total number of workers"
})

const hiveos_worker_problems_total = new Gauge({
	name: "hiveos_worker_problems_total",
	help: "Total number of workers with problems"
})

const hiveos_workers_online_total = new Gauge({
	name: "hiveos_workers_online_total",
	help: "Total number of online workers"
})

const hiveos_workers_offline_total = new Gauge({
	name: "hiveos_workers_offline_total",
	help: "Total number of offline workers"
})

const hiveos_boards_total = new Gauge({
	name: "hiveos_boards_total",
	help: "Total number of boards"
})

const hiveos_boards_online_total = new Gauge({
	name: "hiveos_boards_online_total",
	help: "Total number of online boards"
})

const hiveos_boards_offline_total = new Gauge({
	name: "hiveos_boards_offline_total",
	help: "Total number of offline boards"
})

export async function update() {
	hiveos_updates_total.inc()

	let result

	try {
		result = await hive.request("/farms")
	} catch (error) {
		hiveos_updates_errors_total.inc({ error: error?.constructor?.name })
		console.error(error)
	}

	hiveos_workers_total.set(0)
	hiveos_worker_problems_total.set(0)
	hiveos_workers_online_total.set(0)
	hiveos_workers_offline_total.set(0)

	hiveos_boards_total.set(0)
	hiveos_boards_online_total.set(0)
	hiveos_boards_offline_total.set(0)

	const farms = result.data

	hiveos_farms_total.set(farms.length)

	for (const { stats } of farms) {
		const {
			workers_total,
			workers_with_problem,
			workers_online,
			workers_offline,
			boards_total,
			boards_online,
			boards_offline,
		} = stats

		hiveos_workers_total.inc(workers_total)
		hiveos_worker_problems_total.inc(workers_with_problem)
		hiveos_workers_online_total.inc(workers_online)
		hiveos_workers_offline_total.inc(workers_offline)

		hiveos_boards_total.inc(boards_total)
		hiveos_boards_online_total.inc(boards_online)
		hiveos_boards_offline_total.inc(boards_offline)
	}
}