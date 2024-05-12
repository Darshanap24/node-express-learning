const express = require('express');
const router = express.Router()

router.get('/', (req, res) => {
    res.render('pages/example', {
        subject: 'EJS template engine',
        name: 'our template',
        link: 'https://google.com'
      })
  });

router.post('/generateHtml', (req, res) => {
    res.render('pages/userProfile', {
      name: req.body.user.name,
      designation: req.body.user.designation,
      profile: req.body.user.profile,
      companies: req.body.user.companies,
    });

  });

module.exports = router