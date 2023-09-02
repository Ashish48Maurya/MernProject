const express = require('express');
const router = express.Router();
const user = require('../models/User')
const bcrypt = require('bcrypt');
const Authenticate = require('../middleware/authenticate')
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const Note = require('../models/Notes');
const { connect } = require('mongoose');

router.get('/', (req, res) => {
  res.send('Hello');
})

router.post('/signup', async (req, res) => {
  const { username, password, cpassword, email } = req.body;

  if (!username || !password || !cpassword || !email) {
    return res.status(400).json({ "error": "Please fill all the fields!" });
  }
  try {
    const isPresent = await user.findOne({ email });
    if (isPresent) {
      return res.status(422).json({ "error": "User Already Exist" });
    }

    const User = new user({ username, password, cpassword, email });


    await User.save();
    res.status(201).json({ "message": "User Registered Successfully" })
  }
  catch (err) {
    console.log(err);
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please fill all the fields!' });
    }

    const userLogin = await user.findOne({ email });
    if (!userLogin) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);

    const token = await userLogin.generateAuthToken();

    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 25892000000), // token will expires in 30 days
      httpOnly: true
    });

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    else {
      return res.status(200).json({ message: 'User Logged In Successfully' });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/getdata', Authenticate, (req, res) => {
  res.send(req.rootUser)
})

router.get('/logout', (req, res) => {
  res.clearCookie('jwtoken');
  res.redirect();
})

router.get('/notes', Authenticate, (req, res) => {
  res.send(req.rootUser)
})



//posting notes
router.post('/notes', Authenticate, async (req, res) => {
  try {
    const { title, decs } = req.body;
    if (!title || !decs) {
      return res.status(400).json({ error: "Please fill all the fields!" });
    }
    const Notes = new Note({ title, decs, user: req.UserId });
    res.send(Notes);
    await Notes.save();
    res.status(201).json({ "message": "Notes Saved Successfully" })
  }
  catch (err) {
    console.log(err);
  }
})


//finding notes
router.get('/findNote', Authenticate, async (req, res) => {
  try {
    // Find all notes where the user field matches the authenticated user's ID
    const notes = await Note.find({ user: req.UserId });

    if (!notes) {
      return res.status(404).json({ error: 'No notes found for this user' });
    }

    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//updating note
router.put('/editNote/:id', Authenticate, async (req, res) => {
  try {
    const { title, decs } = req.body;
    const newNote = {};

    if (title) {
      newNote.title = title;
    }

    if (decs) {
      newNote.decs = decs;
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      newNote,
      { new: true }
    );

    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    // Check if the user updating the note is the valid user
    if (note.user.toString() !== req.UserId.toString()) {
      return res.status(401).send("Not Allowed");
    }

    res.json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//Deleting Note
router.delete('/deleteNote/:id', Authenticate, async (req, res) => {
  try {

    //Checking whether note is present or not
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    // Check if user Updating note is Valid user or nit
    if (note.user.toString() !== req.UserId.toString()) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json("Success")
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;