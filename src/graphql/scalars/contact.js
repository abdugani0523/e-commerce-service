import { GraphQLScalarType, Kind } from 'graphql'

const checkContact = value => {
    if ((/^([9]{2}[8][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2})$/g).test(value)) return value
    throw new Error('Invalid Phone Number!')
}

export default new GraphQLScalarType({
    name: 'contact',
    description: 'Phone number',
    serialize: checkContact,
    parseValue: checkContact,
    parseLiteral(ast) {
        if(ast.kind == Kind.STRING) {
            return checkContact(ast.value)
        } 
        throw new Error('Contact must be string!')
    }
})