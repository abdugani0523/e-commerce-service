import { GraphQLUpload } from "graphql-upload"
import checkToken from "../../utils/checkToken.js"
import { finished  } from 'stream/promises'
import { createWriteStream, unlink } from "fs"
import { join, parse } from "path"

export default {
    Upload: GraphQLUpload,
    Query: {
        products: (_, { id }, { read }) => {
            const products = read('products')
            if (id) {
                const product = products.find(product => product.id == id)
                return product ? [product] : []
            }
            return products
        }
    },

    Mutation: {
        addProduct: async (_, { info }, { read, write, userAgent, token }) => {
            try {
                checkToken(token, userAgent, true)
                const products = read('products')
                const categories = read('categories')

                const { picture, category }  = info
                const findCategory = categories.find(item => category == item.id)
                if (!findCategory) throw new Error("The selected category was not found!")
                
                // Upload image
                let { createReadStream, filename, mimetype } = await picture;
                if (!mimetype?.includes('image')) throw new Error('You can only upload image!')
                let { name, ext } = parse(filename)
                filename = name + '-' + Date.now() + ext
                const stream = createReadStream();
                const out = createWriteStream(join(process.cwd(), 'src', 'assets', filename));
                stream.pipe(out);
                await finished(out);
                
                info.picture = '/assets/' + filename

                const newProduct = {
                    id: products.length ? products.at(-1).id + 1 : 1,
                    ...info
                }

                products.push(newProduct)
                write('products', products)
                return {
                    status: 200,
                    message: 'Product successfully added'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        removeProduct: (_, { id }, { read, write, userAgent, token }) => {
            try {
                checkToken(token, userAgent, true)
                const products = read('products')
                const findIndex = products.findIndex(product => product.id == id)
                if(findIndex == -1) throw new Error("Product not found!")
                products.splice (findIndex, 1)
                write("products", products)
                return {
                    status: 200,
                    message: 'Product successfully removed'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        updateProduct: async (_, { id, info }, { read, write, userAgent, token }) => {
            try {
                checkToken(token, userAgent, true)
                const products = read('products')
                const categories = read('categories')

                const product = products.find(product => product.id == id)
                if (!product) throw new Error("Product not found!")
                
                if (info.category && !(categories.find(item => info.category == item.id))) throw new Error("The selected category was not found!")

                if (info.picture) {
                    // Upload image
                    let { createReadStream, filename, mimetype } = await info.picture;
                    if (!mimetype?.includes('image')) throw new Error('You can only upload image!')
                    let { name, ext } = parse(filename)
                    filename = name + '-' + Date.now() + ext
                    const stream = createReadStream();
                    const path = join(process.cwd(), 'src')
                    const out = createWriteStream(join(path, 'assets', filename));
                    stream.pipe(out);
                    await finished(out)
                                        
                    info.picture = '/assets/' + filename
                    unlink(join(path, product.picture), err => {
                        if (err) console.log(err.message);
                    })
                }
            
                for (let key in info){
                    product[key] = info[key]
                }

                write('products', products)
                return {
                    status: 200,
                    message: 'Product successfully updated!'
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
