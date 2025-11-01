const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Job = require('../models/Job');
const Workshop = require('../models/Workshop');
const Feedback = require('../models/Feedback');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Initialize MongoDB change streams and broadcast via Socket.IO
function initChangeStreams(io) {
  const connection = mongoose.connection;

  const startWatchers = () => {
    // Common helper to safely create a watcher
    const makeWatcher = (model, collectionName, eventBase, payloadKey) => {
      try {
        const changeStream = model.collection.watch([], { fullDocument: 'updateLookup' });

        changeStream.on('change', (change) => {
          const { operationType } = change;
          const id = change.documentKey && change.documentKey._id;
          const fullDocument = change.fullDocument || null;
          const updatedFields = change.updateDescription ? change.updateDescription.updatedFields : undefined;
          const removedFields = change.updateDescription ? change.updateDescription.removedFields : undefined;

          switch (operationType) {
            case 'insert':
              io.emit(`${eventBase}:created`, { [payloadKey]: fullDocument });
              break;
            case 'update':
              io.emit(`${eventBase}:updated`, { _id: id, updatedFields, removedFields, fullDocument });
              break;
            case 'replace':
              io.emit(`${eventBase}:replaced`, { _id: id, fullDocument });
              break;
            case 'delete':
              io.emit(`${eventBase}:deleted`, { _id: id });
              break;
            case 'invalidate':
            default:
              break;
          }
        });

        changeStream.on('error', (err) => {
          console.error(`[ChangeStream] Error on ${collectionName}:`, err.message);
        });

        console.log(`[ChangeStream] Watching ${collectionName} for real-time updates`);
        return changeStream;
      } catch (err) {
        console.error(`[ChangeStream] Failed to watch ${collectionName}:`, err.message);
        return null;
      }
    };

    const watchers = [];
    watchers.push(makeWatcher(Blog, 'blogs', 'blogs', 'blog'));
    watchers.push(makeWatcher(Job, 'jobs', 'jobs', 'job'));
    watchers.push(makeWatcher(Workshop, 'workshops', 'workshops', 'workshop'));
    watchers.push(makeWatcher(Feedback, 'feedback', 'feedback', 'feedback'));
    watchers.push(makeWatcher(Chat, 'chats', 'chats', 'chat'));
    watchers.push(makeWatcher(User, 'users', 'users', 'user'));

    // Cleanup on process exit
    const cleanup = async () => {
      await Promise.all(
        watchers
          .filter(Boolean)
          .map((w) => new Promise((resolve) => w.close().then(resolve).catch(resolve)))
      );
      process.exit(0);
    };

    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
  };

  if (connection.readyState === 1) {
    startWatchers();
  } else {
    connection.once('open', startWatchers);
  }
}

module.exports = initChangeStreams;


