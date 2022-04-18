import jwt from './jwt.js'
import model from './model.js'

export default (token, userAgent, checkAdmin) => {
    if (!token) throw new Error('Token required!')
    const { agent, id } = jwt.verify(token)
    const users = model.read('users')
    const user = users.find(user => user.id == id)
    if (!user) throw new Error("You are not a member!")
    if(checkAdmin && user.role != 'admin') throw new Error("You are not allowed!") 
    if (userAgent !== agent) throw new Error("Token is sent from wrong device!")
    return user
}