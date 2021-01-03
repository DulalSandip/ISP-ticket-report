const createErrors = require("http-errors");
//const Joi = require('joi')
const client = require('../helpers/init_redis')

const { registerSchema, loginSchema } = require('../helpers/validation_schema')
const User = require('../models/User.model')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../helpers/jwt_helper");


module.exports= {
    register: async (req, res, next) => {
        try {
            const result = await registerSchema.validateAsync(req.body)
            const doesExist = await User.findOne({ email: result.email })
            if (doesExist)
                throw createErrors.Conflict(`${result.email} already registered.Please provide new email`);
            const user = new User(result)
            const savedUser = await user.save()
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken = await signRefreshToken(savedUser.id)
            res.send({ accessToken, refreshToken })


        } catch (error) {

            if (error.isJoi === true) error.status = 422
            console.log(error)
            next(error)
        }

    },

    login: async (req, res, next) => {
        //res.send('login route')
        try {
            const result = await loginSchema.validateAsync(req.body)
            const user = await User.findOne({ email: result.email })
            if (!user) throw createErrors.NotFound('Username / password is invalid')
            const isPasswordMatch = await user.isValidPassword(result.password)
            if (!isPasswordMatch) throw createErrors.Unauthorized('Username / Password is invalid')

            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
            res.send({ accessToken, refreshToken })
        } catch (error) {
            if (error.isJoi === true) error.status = 400
            next(error)
            //return(next(createErrors.BadRequest('Invalid username/password')))
        }
    },

    refreshToken: async (req, res, next) => {
        //res.send('refresh token route')
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createErrors.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)
            // console.log({ accessToken: accessToken, refreshToken: refToken });

            res.send({ accessToken: accessToken, refreshToken: refToken });
            console.log({ accessToken: accessToken, refreshToken: refToken });

        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        //res.send('logout route')
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createErrors.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)

            client.DEL(userId, (err, value) => {
                if (err) {
                    console.log(err.message)
                    throw createErrors.InternalServerError()
                }
                console.log(value)
                res.sendStatus(204)
            })

        } catch (error) {
            next(error)
        }
    }
}