//const {logger} = require("./errorLogger")

const QueryResutls = (req, res) => {

    req.body.query.then((result) => {
        if(req?.body?.processResults){
        req.body.processResults(result)
        }
        res.status(200).send({
            message: req.body.returnMessage,
            result: result
        })
    }).catch((err) => {
        console.log(err)
        res.status(400).send({
            message: req.body.failedMessage,
            error: err.stack
        });

    })
}


module.exports = {QueryResutls}