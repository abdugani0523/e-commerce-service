import contact from "../scalars/contact.js"
import email from "../scalars/email.js"
import jwt from "../../utils/jwt.js" 
import checkToken from "../../utils/checkToken.js" 
import sha256 from "sha256"

export default {
    contact,
    email,
    Query: {
        users: (_, { id }, { read, userAgent, token }) => {
                checkToken(token, userAgent, true)
                const users = read('users').filter(user => user.role != 'admin')
                if (id) {
                    let user = users.find(user => user.id == id)
                    return [ user ]
                }
                return users
        },
        login: (_, { email, password }, { read, userAgent }) => {
            try {
                const users = read('users')
                const user = users.find(user => user.email == email)
                if (!user) throw new Error("This email address is not registered!")
                if (user.password != sha256(password)) throw new Error("Incorrect password!")
                return {
                    status: 200,
                    message: "Success",
                    token: jwt.sign({
                        id: user.id,
                        agent: userAgent
                    })
                }

            } catch(error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        }
    },

    Mutation: {
        register: (_, { info }, { read, write, userAgent }) => {
            try {
                const users = read('users')
                const user = users.find(user => user.email == info.email)
                if (user) throw new Error('Your email is already registered!')
                info.password = sha256(info.password)
                const newUser = {
                    id: users.length ? users.at(-1).id + 1 : 1,
                    ...info
                }

                users.push(newUser)
                write('users', users)
                return {
                    status: 200,
                    message: "Success",
                    token: jwt.sign({
                        id: newUser.id,
                        agent: userAgent
                    })
                }

            } catch(error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        updateUser: (_, { info }, { read, write, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent)
                const users = read('users')
                if (user.role == 'admin') throw new Error("You are an admin. You cannot change your account!")
                if (info.password) info.password = sha256(info.password)
                const find = users.find(item => user.id == item.id)
                for (let key in info){
                    find[key] = info[key]
                }
                write('users', users)
                return {
                    status: 200,
                    message: "Updated"
                }

            } catch(error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
    }
}