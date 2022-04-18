import { GraphQLScalarType, Kind } from 'graphql'

const checkEmail = value => {
    if ((/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(value)) return value
    throw new Error('Invalid Email!')
}

export default new GraphQLScalarType({
    name: 'email',
    description: 'Email',
    serialize: checkEmail,
    parseValue: checkEmail,
    parseLiteral(ast) {
        if(ast.kind == Kind.STRING) {
            return checkEmail(ast.value)
        } 
        throw new Error('Email must be string!')
    }
})