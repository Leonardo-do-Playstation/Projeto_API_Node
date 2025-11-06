import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowesHeaders: ['Content-type','Authorization'],
    credentials: false
}));


mongoose.connect(process.env.MONGODB_URI, { dbName: 'aulas' })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro de conexão', err.message))

const alunoSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true, minlength: 2 },
    idade: { type: Number, required: true, min: 0, max: 120 },
    curso: { type: String, required: true, trim: true },
    notas: { type: [Number], default: [], validate: v => v.every(n => n >= 0 && n <= 10) }
}, { collection: "alunos", timestamps: true });
const Aluno = mongoose.model('Aluno', alunoSchema, 'Aluno');


// CRUD


// Retornar alunos

app.get('/', (req, res) => res.json({ msg: 'API rodando' }));

app.post('/alunos', async (req, res) => {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
});

// Listar Alunos

app.get('/alunos', async (req, res) => {
    const alunos = await Aluno.find();
    res.json(alunos);
});

// Atualizar Alunos

app.put('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const aluno = await Aluno.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, overwrite: true }
        );

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        res.json(aluno);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Remover Alunos

app.delete('/alunos/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const aluno = await Aluno.findByIdAndDelete(req.params.id);

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json({ message: 'Aluno deletado com sucesso', aluno });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(aluno);
    } catch (err) {
        res.status(500).json({ error: err.message})
     }
    });
    

    // Iniciar Servidor 
    app.listen(process.env.PORT, () =>
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
);