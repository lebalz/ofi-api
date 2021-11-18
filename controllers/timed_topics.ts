import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate } from '../models/user';
import {
    TimedTopicPayload,
    find as findTopic,
    create as createTopic
} from '../models/TimedTopic';

const find: RequestHandler<{web_key: string}> = (req, res) => {
    getOrCreate(getMail(req.authInfo)).then((user) => {
        return findTopic(user.id, req.params.web_key);
    }).then((topic) => {
        if (topic) {
            res.status(200).send(topic);
        } else {
            res.status(200).json(undefined);
        }
    }).catch((err) => ErrorHandler(res, err));
};

const create: RequestHandler<TimedTopicPayload> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return createTopic(user, req.body);
        })
        .then((topic) => {
            if (topic) {
                res.status(201).json(topic);
            } else {
                res.status(500).send('COULD NOT CREATE');
            }
        })
        .catch((err) => ErrorHandler(res, err));
};

const TimedTopics = { find, create };
export default TimedTopics;