const mongoose = require('mongoose');
const waitPort = require('wait-port');

const { MONGO_URI } = process.env;

// Define the Todo Schema
const todoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

// Create the Todo Model
const Todo = mongoose.model('Todo', todoSchema);

async function init() {
    if (!MONGO_URI) {
        throw new Error('MONGO_URI environment variable is required');
    }

    // Extract host from URI for waitPort
    const host = new URL(MONGO_URI).hostname;
    await waitPort({ host, port: 27017 });

    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${host}`);
}

async function teardown() {
    await mongoose.connection.close();
}

async function getItems() {
    const items = await Todo.find({});
    return items.map(item => ({
        id: item.id,
        name: item.name,
        completed: Boolean(item.completed)
    }));
}

async function getItem(id) {
    const item = await Todo.findOne({ id });
    if (item) {
        return {
            id: item.id,
            name: item.name,
            completed: Boolean(item.completed)
        };
    }
    return null;
}

async function storeItem(item) {
    const todo = new Todo({
        id: item.id,
        name: item.name,
        completed: Boolean(item.completed)
    });
    await todo.save();
}

async function updateItem(id, item) {
    await Todo.findOneAndUpdate(
        { id },
        { 
            name: item.name,
            completed: Boolean(item.completed)
        },
        { new: true }
    );
}

async function removeItem(id) {
    await Todo.findOneAndDelete({ id });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};