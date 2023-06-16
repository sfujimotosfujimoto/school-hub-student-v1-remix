import winston from "winston"

const logFormatter = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD hh:mm:ss",
  }),
  winston.format.printf((meta) => {
    const { level, message, timestamp } = meta

    return `${level}:\t${message}\t${timestamp}`
  })
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormatter,
  // format: winston.format.json(),
  transports: [new winston.transports.Console()],
})
