module.exports = (req, res, next) => {

  req.user = {
    user_id: 1,
    username: "testuser"
  };

  next();
};