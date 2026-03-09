import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        // Shield protects app from common attacks e.g. SQL injection
        shield({ mode: 'LIVE' }),
        // Create a bot detection rule
        detectBot({
            mode: 'LIVE', // Blocks requests. Use "DRY_RUN" to log only
            // Block all bots except the following
            allow: [
                'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
                'CATEGORY:PREVIEW',
            ],
        }),
        slidingWindow({
            mode: 'LIVE',
            interval: '2m',
            max: 5,
        }),
    ],
});

export default aj;
