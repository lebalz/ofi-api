import { getStrategy } from './azure-ad';
import { getStrategy as mockStrategy } from './mock';

export const strategyForEnvironment = () => {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'test' || (process.env.TEST_USER_EMAIL && process.env.NODE_ENV !== 'production')) {
        if (process.env.TEST_USER_EMAIL) {
            const tmail = process.env.TEST_USER_EMAIL;
            const n = tmail.length >= 38 ? 0 : 38 - tmail.length;
            console.log([   "",
                            "┌──────────────────────────────────────────────────────────┐",
                            '│                                                          │',
                            "│   _   _                       _   _                      │",
                            "│  | \\ | |           /\\        | | | |                     │",
                            "│  |  \\| | ___      /  \\  _   _| |_| |__                   │",
                            "│  | . ` |/ _ \\    / /\\ \\| | | | __| '_ \\                  │",
                            "│  | |\\  | (_) |  / ____ \\ |_| | |_| | | |                 │",
                            "│  |_| \\_|\\___/  /_/    \\_\\__,_|\\__|_| |_|                 │",
                            '│                                                          │',
                            '│                                                          │',
                            `│   TEST_USER_EMAIL: ${tmail + ' '.repeat(n)}│`,
                            '│                                                          │',
                            '│                                                          │',
                            '│   --> enable authentication by removing "TEST_USER_EMAIL"│',
                            '│       from the environment (or the .env file)            │',
                            '│                                                          │',
                            "└──────────────────────────────────────────────────────────┘",
            ].join('\n'))
        }
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        console.log('USING MOCK STRATEGY');
        return mockStrategy();
    }
    return getStrategy();
};
