class Logger {
    constructor(){};
    
    info = (msg) => {
        if (process.env.ENV_MODE != "TEST" || process.env.DEBUG=="true") {
            console.log(`[${Date.now()}] ${msg}`);
        }
    }
    error = (msg) => {
        if (process.env.ENV_MODE != "TEST" || process.env.DEBUG=="true") {
            console.error(`[${Date.now()}] ${msg}`);
        }
    }
}

export const log = new Logger();