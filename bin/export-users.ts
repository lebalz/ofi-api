import fs from 'fs';
import { users as allUsers, User, findByMail } from '../models/user';
import { all as allDocuments } from '../models/document';
import { all as allTimedTopics } from '../models/TimedTopic';
import { all as allComments } from '../models/comment';

const email2Filename = (email: string) => {
    return email.split('@')[0].replace(/\./g, '_');
}

if (fs.existsSync('export')) {
    fs.rmSync('export', { recursive: true });
}
fs.mkdirSync('export');

(async () => {
    const users = await allUsers();
    users.rows.forEach(async (user) => {
        Promise.all([
            Promise.resolve(user),
            allDocuments(user),
            allTimedTopics(user),
            allComments(user),
        ]).then(([user, docs, ttopics, comments]) => {
            const fname = `export/${user.class || ''}_${email2Filename(user.email)}.json`;
            return fs.writeFile(
                fname, 
                JSON.stringify({user: user, documents: docs, timed_topics: ttopics, comments: comments}, undefined, 2),
                (err) => {
                    if (err) throw err;
                    console.log(`Saved ${fname}`);
                }
            );
        });
    });
})();