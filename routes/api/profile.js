const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route   GET api/profile/me
// @desc    Get Logged In User's Profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).json({ msg: "No Profile Exists for this user" });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).send("Server Error");
    console.error(error.message);
  }
  // res.send("Profile Route");
});

// @route   POST api/profile
// @desc    Create / Update User's Profile
// @access  Private

router.post(
  '/',
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      experience,
      education,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      date
    } = req.body;
    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (skills) profileFields.skills = skills.split(',').map((skill) => skill.trim())
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (experience) profileFields.experience = experience;
    if (education) profileFields.education = education;
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    try {
      let profile = await Profile.findOne({ user: profileFields.user });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: profileFields.user },
          { $set: profileFields },
          { new: true })
        return res.json(profile);
      }
      else {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error')
    }



  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get Profile by user_id
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    res.json(profile);
    if (!profile) return res.status(400).json({ msg: 'Profile not found' })

  } catch (err) {
    if (err.kind == 'ObjectId') {
      console.error(err.message);
      return res.status(400).json({ msg: 'Profile not found' })
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/profile
// @desc     Delete Profile, User and Posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Todo Delete Posts
    // Remove Profile
    console.log(req.params)
    await Profile.findOneAndRemove({ user: req.user.id })
    // Remove User
    await User.findOneAndRemove({ _id: req.user.id })
    res.json({ msg: 'User/Profile Deleted Successfully' })
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route    PUT api/profile/experience
// @desc     Add Profile Experience
// @access   Private
router.put('/experience', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()

]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() })
  }

  // Get request Data
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  // Create Experience Array
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    profile.experience.unshift(newExp)
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error....');
  }
})

// @route    DELETE api/profile/experience
// @desc     Delete Profile Experience
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  const expId = req.params.exp_id;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience.map(item => item.id).indexOf(expId);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error....');
  }

})

module.exports = router;