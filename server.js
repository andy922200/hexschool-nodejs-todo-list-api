const http = require('http')
const { v4: uuidv4 } = require('uuid')
const { resGenerator, errorHandling } = require('./tools')
const port = process.env.PORT || 8080
/*saved todos data*/
let todos = [
    {
        id: uuidv4(),
        content: 'Todo List Content Default'
    }
]

const requestListener = (req, res)=>{
    const resHeader = {
        "Access-Control-Allow-Headers": 'Content-Type, Authorization, Content-Length, X-Requested-With',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'PATCH, POST, GET, OPTIONS, DELETE',
        "content-type": "application/json"
    }
    const {method: reqMethod} = req

    /*get data from chunk*/
    let body = ''
    req.on('data', chunk =>{
        body += chunk
    })

    if(req.url === '/'){
        switch (reqMethod){
            default:
                resGenerator({
                    res,
                    resHeader,
                    statusCode:200,
                    callback: ()=>{
                        res.write(JSON.stringify({
                            status: 'success',
                            message: 'This is index page'
                        }))
                    }
                })
            break
        }
        return;
    }

    if (req.url.startsWith('/todos')) {
        switch (reqMethod) {
            case 'GET':
                resGenerator({
                    res,
                    resHeader,
                    statusCode: 200,
                    callback: () => {
                        res.write(JSON.stringify({
                            status: 'success',
                            data: todos
                        }))
                    }
                })
                break
            case 'OPTIONS':
                resGenerator({
                    res,
                    resHeader,
                    statusCode: 200
                })
                break
            case 'POST':
                req.on('end', async ()=>{
                    try{
                        const data = JSON.parse(body)
                        if (data && data.content) {
                            todos.push({
                                id: uuidv4(),
                                content: data.content
                            })
                            resGenerator({
                                res,
                                resHeader,
                                statusCode: 200,
                                callback: () => {
                                    res.write(JSON.stringify({
                                        status: 'success',
                                        message: 'New Content is added successfully.'
                                    }))      
                                }
                            })
                        } else {
                            errorHandling({
                                res,
                                resHeader
                            })
                        }
                    }catch(err){
                        errorHandling({
                            res,
                            resHeader
                        })
                    }
                })
                break
            case 'PATCH':
                req.on('end', async () => {
                    try {
                        const data = JSON.parse(body)
                        const id = req.url.split('/todos/')[1]
                        const index = todos.findIndex(item=> item.id === id)

                        if (data && data.content) {
                            if(id && index > -1){
                                todos[index].content = data.content
                                resGenerator({
                                    res,
                                    resHeader,
                                    statusCode: 200,
                                    callback: () => {
                                        res.write(JSON.stringify({
                                            status: 'success',
                                            message: `Todo Id ${id} is edited successfully.`
                                        }))
                                    }
                                })
                            }else{
                                errorHandling({
                                    res,
                                    resHeader
                                })
                            }
                        } else {
                            errorHandling({
                                res,
                                resHeader
                            })
                        }
                    } catch (err) {
                        errorHandling({
                            res,
                            resHeader
                        })
                    }
                })
                break
            case 'DELETE':
                resGenerator({
                    res,
                    resHeader,
                    statusCode: 200,
                    callback: () => {
                        const id = req.url.split('/todos/')[1]
                        const index = todos.findIndex(item => item.id === id)

                        if(id){
                            if(index > -1){
                                todos.splice(index, 1)
                                res.write(JSON.stringify({
                                    status: 'success',
                                    message: `Todo Id ${id} is deleted successfully.`
                                }))
                            }else{
                                errorHandling({
                                    res,
                                    resHeader
                                })
                            }
                        }else{
                            todos = []
                            res.write(JSON.stringify({
                                status: 'success',
                                message: 'Delete All todos successfully.'
                            }))
                        }
                    }
                })
                break
            default:
                resGenerator({
                    res,
                    resHeader,
                    statusCode: 200,
                    callback: () => {
                        res.write(JSON.stringify({
                            status: 'success',
                            message: 'This is index page'
                        }))
                    }
                })
                break
        }
        return;
    }

    resGenerator({
        res,
        resHeader,
        statusCode: 404,
        callback: () => {
            res.write(JSON.stringify({
                status: 'fail',
                message: 'Invalid Route'
            }))
        }
    })
}

const server = http.createServer(requestListener)
server.listen(port)
console.log(`The server is running on ${port}`)