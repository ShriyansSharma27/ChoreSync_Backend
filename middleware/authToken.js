const {getAuth} = require('@clerk/express');

// To ensure the user is authenticated
const ClerkMiddleAuth = (req,res,next) => {
  const {userId} = getAuth(req);

  if(!userId) {
    return res.status(401).json({"message": "unauthenticated"});
  }
  req.clerkId = userId;
  next();
}
  
module.exports = {ClerkMiddleAuth};