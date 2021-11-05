const express = require('express');
const router = express.Router();
const {Notes, validateNotes} = require("../models/notes");


router.get('/', async (req, res)=>{
    const notes = await Notes.find().sort("_id");

    res.send(notes);
})

router.post('/', async (req, res)=>{
    
    const {error} = validateNotes(req.body);
    if(error)return res.status(400).send(error.details[0].message);

    

    const notes = new Notes({
        title: req.body.title,
        body: req.body.body,
        userId: req.body.userId,
    });
    await notes.save();

    res.send(notes);
});


module.exports = router;