import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { create as createTimeSpan, stop as stopTimeSpan, TimeSpan } from '../models/TimeSpan';
import { getOrCreate, ownsTimedExercise, ownsTimeSpan } from '../models/user';

const create: RequestHandler<{ id: number; exercise_id: number }, TimeSpan | string> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return ownsTimedExercise(user, req.params.exercise_id).then((isOwner) => {
                if (isOwner) {
                    return createTimeSpan(req.params.exercise_id).then((ts) => {
                        if (ts) {
                            res.status(201).json(ts);
                        } else {
                            res.status(500).send('COULD NOT CREATE');
                        }
                    });
                }
                res.status(401).send('Unauthorized');
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const stop: RequestHandler<{ span_id: number }, TimeSpan | string> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return ownsTimeSpan(user, req.params.span_id).then((isOwner) => {
                if (isOwner) {
                    return stopTimeSpan(req.params.span_id).then((ts) => {
                        if (ts) {
                            res.status(201).json(ts);
                        } else {
                            res.status(500).send('COULD NOT STOP');
                        }
                    });
                }
                res.status(401).send('Unauthorized');
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const TimeSpans = { create, stop };
export default TimeSpans;
