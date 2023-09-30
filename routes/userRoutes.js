const { User } = require('../models/userModel');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash');

  if (!userList) {
    res.status(500).json({ success: false })
  }
  res.send(userList);
})

// get user by id
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    res.status(500).json({ message: 'The user with the given ID was not found.' })
  }
  res.status(200).send(user);
})

// register new user

router.post(`/`, async (req, res) => {
  const password = await bcrypt.hash(req.body.passwordHash, 10);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: password,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,

  })

  user = await user.save();

  if (!user)
    return res.status(404).send('the user cannot be created!')

  res.send(user);
})

//login user
router.post('/login', async (req, res) => {
  const user = await User.fineOne({ email: req.body.email })

  if (!user) {
    return res.status(400).send('The user not found')
  }
  if(user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller
      },
      process.env.secret,
      { expiresIn: '1d' }
    )
    res.status(200).send({ user: user.email, token: token })

  } else {
    res.status(400).send('password is wrong')
  }
})

// get user count
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false })
  }
  res.send({
    userCount: userCount
  });
})


module.exports = router;