import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate } from '../models/user';

const current: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => ErrorHandler(res, err));
};

const Users = { current };
export default Users;
