import pino from "pino"
import pretty from "pino-pretty"

const streamDev = pretty({
  levelFirst: true,
  colorize: true,
  ignore: "hostname,pid",
})

const loggerDev = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    // level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
  streamDev,
)

const streamProd = pretty({
  levelFirst: true,
  colorize: false,
  ignore: "hostname,pid",
})

const loggerProd = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
  },
  streamProd,
)

let logger = process.env.NODE_ENV === "production" ? loggerProd : loggerDev

export { logger }

// import winston from "winston"

// const logFormatterDev = winston.format.combine(
//   winston.format.timestamp({
//     format: "YY-MM-DD hh:mm:ss",
//   }),
//   winston.format.printf((meta) => {
//     const { level, message, timestamp } = meta

//     return `${timestamp} ${level}: ${message}`
//   }),
//   winston.format.colorize({
//     all: true,
//   }),
//   winston.format.align(),
// )

// const logFormatterProd = winston.format.combine(
//   winston.format.timestamp({
//     format: "YY-MM-DD hh:mm:ss",
//   }),
//   winston.format.printf((meta) => {
//     const { level, message, timestamp } = meta

//     return `${timestamp} ${level}: ${message}`
//   }),
//   winston.format.align(),
// )
// export const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || "info",
//   format:
//     process.env.NODE_ENV === "production" ? logFormatterProd : logFormatterDev,
//   transports: [new winston.transports.Console()],
// })
