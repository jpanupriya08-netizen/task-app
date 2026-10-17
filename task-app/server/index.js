import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This website is not allowed to access the task API.'));
  },
}));
app.use(express.json({ limit: '20kb' }));

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  category: { type: String, enum: ['Personal', 'Work', 'Study'], default: 'Personal' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  due: {
    type: String,
    default: '',
    validate: {
      validator: (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      message: 'Due date must use YYYY-MM-DD format.',
    },
  },
  done: { type: Boolean, default: false },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

app.get('/api/health', (_request, response) => response.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.get('/api/tasks', async (_request, response, next) => {
  try {
    const tasks = await Task.find().sort({ due: 1, createdAt: -1 }).lean();
    return response.json(tasks);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/tasks', async (request, response, next) => {
  try {
    const task = await Task.create({
      title: request.body?.title,
      category: request.body?.category,
      priority: request.body?.priority,
      due: request.body?.due || '',
      done: false,
    });
    return response.status(201).json(task);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/tasks/:id', async (request, response, next) => {
  try {
    if (typeof request.body?.done !== 'boolean') {
      return response.status(400).json({ error: 'A valid completion status is required.' });
    }
    const task = await Task.findByIdAndUpdate(request.params.id, { done: request.body.done }, { new: true, runValidators: true });
    if (!task) return response.status(404).json({ error: 'Task not found.' });
    return response.json(task);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/tasks/:id', async (request, response, next) => {
  try {
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) return response.status(404).json({ error: 'Task not found.' });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError || error instanceof SyntaxError) {
    return response.status(400).json({ error: 'Please check the task details and try again.' });
  }
  console.error(error);
  return response.status(500).json({ error: 'The task service ran into a problem. Please try again.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(port, '0.0.0.0', () => console.log(`Task API ready at http://localhost:${port}`));
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

start();
