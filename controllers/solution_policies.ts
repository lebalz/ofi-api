import { SolutionPolicyPayload, PolicyModifier } from './../models/SolutionPolicy';
import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate } from '../models/user';
import { authorized as userAuthorized, create as createSolutionPolicy, update } from '../models/SolutionPolicy';

const authorized: RequestHandler = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return userAuthorized(user, req.params.web_key);
        })
        .then((auth) => {
            res.status(200).send(auth);
        })
        .catch((err) => ErrorHandler(res, err));
};

const create: RequestHandler<SolutionPolicyPayload> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return createSolutionPolicy(req.body);
        })
        .then((policy) => {
            if (policy) {
                res.status(201).json(policy);
            } else {
                res.status(500).send('COULD NOT CREATE');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const SolutionPolicies = { authorized, create };
export default SolutionPolicies;
