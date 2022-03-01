const resGenerator = ({res, resHeader, statusCode, callback})=>{
    res.writeHead(statusCode, resHeader)
    if(callback){
        callback()
    }
    res.end()
}

const errorHandling = ({res, resHeader})=>{
    resGenerator({
        res,
        resHeader,
        statusCode: 400,
        callback: () => {
            res.write(JSON.stringify({
                status: 'fail',
                message: 'Your input is not correct or todo id does not exist.'
            }))
        }
    })
}

module.exports = {
    resGenerator,
    errorHandling
}