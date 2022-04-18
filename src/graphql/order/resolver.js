import checkToken from "../../utils/checkToken.js"
import { finished  } from 'stream/promises'
import { createWriteStream } from "fs"
import { join, parse } from "path"

export default {
    Query: {
        orders: (_, { id }, { read, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent)
                let orders = read('orders')
                if (user.role != 'admin') {
                    orders = orders.filter(order => order.user_id == user.id)
                }
                if (id) {
                    const order = orders.find(order => order.id == id)
                    orders = order ? [ order ] : []
                }
                return {
                    info: {
                        status: 200,
                        message: "Success"
                    },
                    data: orders
                }
            } catch(error) {
                return {
                    info: {
                        status: 400,
                        message: error.message
                    },
                    data: [] 
                }
            }
        },
    },
    Order: {
        user: (parent, _, { read }) => {
            const user = read('users').find(user => user.id == parent.user_id )
            return user ?? {}
        },
        total_price: (parent, _, { read }) => {
            const products = read('products')  
            return parent.products.reduce((prev, current) => {
                const product = products.find(product => product.id == current.id)
                return prev + (product.price * current.count)
            }, 0)
        }
    },
    outputProduct: {
        product: (parent, _, { read }) => {
            const product = read('products').find(product => product.id == parent.id)
            return product ?? {}
        }
    },

    Mutation: {
        addOrder: async (_, { products }, { read, write, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent)
                if (user.role == 'admin') throw new Error("You are an admin. You cannot order!")
                const orders = read('orders')
                const order = orders.find(order => order.user_id == user.id && !order.is_paid)
                if (order) throw new Error("You have an unpaid order yet!")
                const allProducts = read('products')
                const verify = products.every(product => {
                    const exists = allProducts.find(item => item.id == product.id)
                    return exists && (product.count < 11)
                })
                if (!verify) throw new Error('Some products were not found or the count did not match 0<count<=10')
                
                const newOrder = {
                    id: orders.length ? orders.at(-1).id + 1 : 1,
                    user_id: user.id,
                    products,
                    is_paid: false
                }

                orders.push(newOrder)
                write('orders', orders)
                return {
                    status: 200,
                    message: 'Order successfully added'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        removeOrder: (_, { id }, { read, write, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent)
                if (user.role == 'admin') throw new Error("You are an admin. You cannot remove order!")
                const orders = read('orders')
                const findIndex = orders.findIndex(order => order.id == id)
                const order = orders.at(findIndex)
                if (findIndex == -1) throw new Error("Order not found!")
                if (order.user_id != user.id) throw new Error("The order does not belong to you!")
                if (order.is_paid) throw new Error("Once paid, the order cannot be cancele.")
                orders.splice(findIndex, 1)
                write("orders", orders)
                return {
                    status: 200,
                    message: 'Order successfully removed'
                }
            } catch (error) {
                return {
                    status: 400,
                    message: error.message
                }
            }
        },
        updateOrder: (_, { id, products, is_paid }, { read, write, userAgent, token }) => {
            try {
                const user = checkToken(token, userAgent)
                if (user.role == 'admin') throw new Error("You are an admin. You cannot update order!")
                const orders = read('orders')
                const order = orders.find(order => order.id == id)
                if (!order) throw new Error("Order not found!")
                if (order.user_id != user.id) throw new Error("The order does not belong to you!")
                if (order.is_paid) throw new Error("Once paid, the order cannot be update.")
                const allProducts = read('products')
                const verify = products.every(product => {
                    const exists = allProducts.find(item => item.id == product.id)
                    return exists && (product.count < 11)
                })
                if (!verify) throw new Error('Some products were not found or the count did not match 0<count<=10')
                
                order.products = products
                order.is_paid == !!is_paid

                write('orders', orders)
                return {
                    status: 200,
                    message: 'Order successfully updated'
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