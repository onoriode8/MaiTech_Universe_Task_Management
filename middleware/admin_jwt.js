import jwt from 'jsonwebtoken'


const adminAuthJwt = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if(!token) return res.status(400).json("token can't be empty.") 
        const decodedToken = jwt.verify(
            token, process.env.ADMIN_JWT_SECRET_TOKEN)
        if(!decodedToken) {
            return res.status(400).json("You can't access this route.")
        }
        req.decodedUserId = decodedToken.id
        next()
    } catch(err) {
        if(err.name === "TokenExpiredError") {
            return res.status(500).json(
            "Your session time out. Login again to continue using the app."
            )
        }
        return res.status(500).json("Error occur, try again later.")
    }
}

export default adminAuthJwt;