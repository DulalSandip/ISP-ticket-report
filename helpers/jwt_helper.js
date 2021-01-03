const JWT = require('jsonwebtoken')
const createErrors = require("http-errors");
const client = require('./init_redis')


module.exports = {
  //generating sign access token
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        //iss: "technoinfoworldwide.blogspot.com",
      };
      const secret = process.env.ACCESS_SECRET_TOKEN;
      const options = {
        expiresIn: "15s",
        issuer: "technoinfoworldwide.blogspot.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createErrors.InternalServerError());

          //return reject(err)
        }
        resolve(token);
      });
    });
  },

  // generating refresh access token
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        //iss: "technoinfoworldwide.blogspot.com",
      };
      const secret = process.env.REFRESH_SECRET_TOKEN;
      const options = {
        expiresIn: "40s",
        issuer: "technoinfoworldwide.blogspot.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createErrors.InternalServerError());

          //return reject(err)
        }
        client.SET(userId,token,'EX', 40 , (err,reply)=>{
            if (err) {
              console.log(err.message)
              reject(createErrors.InternalServerError())
              return
            }
            resolve(token)

        })
        //resolve(token);
      })
    })
  },

  // verifying access token for authentic user only
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createErrors.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    JWT.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, payload) => {
      if (err) {
        console.log(err.message);
        return next(createErrors.Unauthorized(err.message));
      }
      req.payload = payload;
      next();
    });
  },

  //verifying refresh token
  verifyRefreshToken:(refreshToken)=>{
      return new Promise((resolve,reject)=>{
          JWT.verify(
            refreshToken,
            process.env.REFRESH_SECRET_TOKEN,
            (err, payload) => {
              if (err) return reject(createErrors.Unauthorized());
              const userId = payload.aud;
              //resolve(userId);
              client.GET(userId, (err, result) => {
                if (err) {
                  console.log(err.message)
                  reject(createError.InternalServerError())
                  return
                }
                if (refreshToken === result) return resolve(userId)
                reject(createError.Unauthorized())
              })
            }
          );
      })
  }

};
