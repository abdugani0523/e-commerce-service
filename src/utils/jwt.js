import jwt from 'jsonwebtoken'
import { secret } from '../../config.js'

export default {
    sign: payload => jwt.sign(payload, secret),
    verify: token => jwt.verify(token, secret),
}