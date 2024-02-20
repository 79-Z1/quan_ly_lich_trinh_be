const winston = require('winston');
const path = require('path');


const infoFilter = winston.format((log, opts) => {
    return log.level === 'info' ? log : false;
});

const errorFilter = winston.format((log, opts) => {
    return log.level === 'error' ? log : false;
});



const logger = winston.createLogger({
    // format của log được kết hợp thông qua format.combine
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.prettyPrint(),
    ),
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                infoFilter(),
                winston.format.label({ label: 'INFO' }),
                winston.format.printf(
                    log => {
                        return `[🚀🚀🚀] [${log.timestamp}] [${log.label}] ${log.message}`;
                    }
                ),
                winston.format.colorize({ all: true }),
            )
        }),
        new winston.transports.File({
            level: 'info',
            filename: path.join(__dirname, '../logs', 'trace.log'),
            format: winston.format.combine(
                infoFilter(),
                winston.format.label({ label: 'INFO' }),
                winston.format.printf(
                    log => {
                        return `[🚀🚀🚀] [${log.timestamp}] [${log.label}] ${log.message}`;
                    },
                ),
            )
        }),
        new winston.transports.Console({
            level: 'error',
            format: winston.format.combine(
                errorFilter(),
                winston.format.label({ label: 'ERROR' }),
                winston.format.printf(log => {
                    return `[❌❌❌] [${log.timestamp}] [${log.label}] ${log.message}`;
                    // if (log.stack) return `[❌❌❌] [${log.timestamp}] [${log.label}] ${log.stack}`;
                }),
                winston.format.colorize({ all: true }),
            )
        }),
        new winston.transports.File({
            level: 'error',
            filename: path.join(__dirname, '../logs', 'trace.log'),
            format: winston.format.combine(
                errorFilter(),
                winston.format.label({ label: 'ERROR' }),
                winston.format.printf(log => {
                    return `[❌❌❌] [${log.timestamp}] [${log.label}] ${log.message}`;
                }),
            )
        })
    ],
    exitOnError: false
})

module.exports = {
    logger
};
