import { ErrorHandler, getMail } from './helpers';
import { RequestHandler } from 'express';
import { getOrCreate, ownsTimedExercise, ownsTimedTopic } from '../models/user';
import {
    create as createExercise,
    update as updateExercise,
    destroy as destroyExercise,
    TimedExercisePayload,
    TimedExerciseRecord,
} from '../models/TimedExercise';
import { UpdateResponse } from '../models/helpers';

const create: RequestHandler<{ id: number }, TimedExerciseRecord | string, TimedExercisePayload> = (
    req,
    res
) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return ownsTimedTopic(user, req.params.id).then((isOwner) => {
                if (isOwner) {
                    return createExercise(req.params.id, req.body).then((topic) => {
                        if (topic) {
                            res.status(201).json(topic);
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

const update: RequestHandler<
    { id: number; exercise_id: number },
    UpdateResponse | string,
    TimedExercisePayload
> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return ownsTimedExercise(user, req.params.exercise_id).then((isOwner) => {
                if (isOwner?.permission) {
                    return updateExercise(req.params.exercise_id, req.body).then((topic) => {
                        if (topic) {
                            res.status(201).json(topic);
                        } else {
                            res.status(500).send('COULD NOT UPDATE');
                        }
                    });
                }
                res.status(401).send('Unauthorized');
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const destroy: RequestHandler<
    { id: number; exercise_id: number },
    UpdateResponse | string,
    TimedExercisePayload
> = (req, res) => {
    getOrCreate(getMail(req.authInfo))
        .then((user) => {
            return ownsTimedExercise(user, req.params.exercise_id).then((isOwner) => {
                if (isOwner) {
                    return destroyExercise(req.params.exercise_id).then((topic) => {
                        if (topic) {
                            res.status(204).send();
                        } else {
                            res.status(500).send('COULD NOT DESTROY');
                        }
                    });
                }
                res.status(401).send('Unauthorized');
            });
        })
        .catch((err) => ErrorHandler(res, err));
};

const TimedExercises = { create, update, delete: destroy };
export default TimedExercises;
