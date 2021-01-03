const Joi = require('joi')

const registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName : Joi.string().required(),
    email : Joi.string().email().lowercase().required(),
    age : Joi.number().integer().min(18).max(65),
    gender: Joi.string().required(),
    password : Joi.string().alphanum().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .alphanum()
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

module.exports = {
    registerSchema,
    loginSchema
}