import { Response } from 'express';

export const getMail = (authInfo?: Express.AuthInfo) => {
    if (!authInfo) {
        throw 'No AuthInfo provided';
    }
    return (authInfo as any).preferred_username.toLowerCase();
};

export const ErrorHandler = (res: Response, err: Error) => {
    console.error(err);
    res.status(500).send(err.name);
};
