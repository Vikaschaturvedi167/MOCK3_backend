const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./models/User.model');
const AppointmentModel = require('./models/Doctor.model'); 
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use(
    cors({
        origin: '*',
    })
);


const MONGODB_URI = process.env.MONGODB_URL;

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connection successful!');
    } catch (error) {
        console.log('Connection to MongoDB failed:', error);
    }
}
main();

app.get('/', (req, res) => {
    res.send('Base endpoint running');
});

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.send({ msg: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword });
        res.send({ msg: 'Signup successful!' });
    } catch (error) {
        res.status(500).send({ error: 'Signup failed!' });
        console.error(error);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.send({ msg: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.send({ msg: 'Incorrect password' });
        }
        const token = jwt.sign({ userId: user._id }, 'masaisecret');
        res.send({ msg: 'Login successful!', token });
    } catch (error) {
        res.status(500).send({ error: 'Login failed!' });
        console.error(error);
    }
});

// Other routes and endpoints go here...
app.get('/appointments', async (req, res) => {
    try {
        const appointments = await AppointmentModel.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments!' });
        console.error(error);
    }
});

app.post('/appointments', async (req, res) => {
    try {
        const {
            name,
            imageUrl,
            specialization,
            experience,
            location,
            date,
            slots,
            fee,
        } = req.body;

        const newAppointment = await AppointmentModel.create({
            name,
            imageUrl,
            specialization,
            experience,
            location,
            date,
            slots,
            fee,
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create appointment!' });
        console.error(error);
    }
});

app.patch('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            imageUrl,
            specialization,
            experience,
            location,
            date,
            slots,
            fee,
        } = req.body;

        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            id,
            {
                name,
                imageUrl,
                specialization,
                experience,
                location,
                date,
                slots,
                fee,
            },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update appointment!' });
        console.error(error);
    }
});

app.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAppointment = await AppointmentModel.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete appointment!' });
        console.error(error);
    }
});


app.get('/appointments/search', async (req, res) => {
    try {
        const { specialization, sort, name } = req.query;

        const filter = {};
        if (specialization) filter.specialization = specialization;

        const sortOptions = {};
        if (sort === 'ascending' || sort === 'descending') {
            sortOptions.date = sort === 'ascending' ? 1 : -1;
        }

        const search = {};
        if (name) {
            search.name = { $regex: new RegExp(name, 'i') };
        }

        const finalQuery = { ...filter, ...search };

        const appointments = await AppointmentModel.find(finalQuery).sort(sortOptions).exec();

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments!' });
        console.error(error);
    }
});





const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port 8000}`);
});
