import checkToken from "../../utils/checkToken.js"

export default {
    Query: {
        categories: (_, { id }, { read }) => {
            const categories = read('categories')
            if (id) {
                const category = categories.find(category => category.id == id)
                return category ? [ category ] : []
            }
            return categories
        }
    },

    Mutation: {
        addCategory: (_, { name }, { read, write, userAgent, token }) => {
            try {
                checkToken(token, userAgent, true)
                const categories = read('categories')
                const newCategory = {
                    id: categories.length ? categories.at(-1).id + 1 : 1,
                    name
                }
                categories.push(newCategory)
                write('categories', categories)
                return {
                    status: 200,
                    message: 'Category successfully added'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        removeCategory: (_, { id }, { read, write, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent, true)
                const categories = read('categories')
                const findIndex = categories.findIndex(category => category.id == id)
                if(findIndex == -1) throw new Error("Category not found!")
                categories.splice (findIndex,1)
                write("categories", categories)
                return {
                    status: 200,
                    message: 'Category successfully removed'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        updateCategory: (_, { id, name }, { read, write, userAgent, token }) => {
            try {
                checkToken(token, userAgent, true)
                const categories = read('categories')
                const find = categories.find(category => category.id == id)
                if(!find) throw new Error("Category not found!")
                find.name = name
                write("categories", categories)
                return {
                    status: 200,
                    message: 'Category successfully updated!'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        }

    }
}
