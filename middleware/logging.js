module.exports = (req, res, next) =>{
    console.log(`[Log] ${req.method} ${req.url} - ${new Date().toLocaleString()}`);
    next();    
}