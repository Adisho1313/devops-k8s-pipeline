import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose, { InferSchemaType } from 'mongoose';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it in backend/.env');
  process.exit(1);
}

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  },
);

todoSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const transformed = ret as any;
    transformed.id = transformed._id.toString();
    transformed.createdAt = transformed.createdAt?.toISOString?.() || transformed.createdAt;
    delete transformed._id;
    delete transformed.updatedAt;
    return transformed;
  },
});

type Todo = InferSchemaType<typeof todoSchema>;

const Todo = mongoose.model<Todo>('Todo', todoSchema);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

const getTodos = async (_req: Request, res: Response) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    res.status(500).json({ message: 'Failed to fetch todos.' });
  }
};

const createTodo = async (req: Request, res: Response) => {
  const { title } = req.body as { title?: string };

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const todo = await Todo.create({ title: title.trim() });
    res.status(201).json(todo);
  } catch (error) {
    console.error('Failed to create todo:', error);
    res.status(500).json({ message: 'Failed to create todo.' });
  }
};

const updateTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body as {
    title?: string;
    completed?: boolean;
  };

  if (typeof title !== 'undefined' && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ message: 'Title must be a non-empty string when provided.' });
  }

  if (typeof completed !== 'undefined' && typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Completed must be a boolean when provided.' });
  }

  const updatePayload: Partial<Todo> = {};
  if (typeof title === 'string') updatePayload.title = title.trim();
  if (typeof completed === 'boolean') updatePayload.completed = completed;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.json(updatedTodo);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    console.error('Failed to update todo:', error);
    res.status(500).json({ message: 'Failed to update todo.' });
  }
};

const deleteTodo = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    console.error('Failed to delete todo:', error);
    res.status(500).json({ message: 'Failed to delete todo.' });
  }
};

app.get('/api/todos', getTodos);
app.get('/todos', getTodos);

app.post('/api/todos', createTodo);
app.post('/todos', createTodo);

app.put('/api/todos/:id', updateTodo);
app.put('/todos/:id', updateTodo);

app.delete('/api/todos/:id', deleteTodo);
app.delete('/todos/:id', deleteTodo);

async function startServer(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

void startServer();
