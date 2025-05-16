import jwt from 'jsonwebtoken'


const authJwt = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if(!token) return res.status(400).json("token can't be empty.") 
        const decodedToken = jwt.verify(
            token, "SECRET_TASK_MANAGEMENT_PROJECT_UNIVERSE_PRIVATE")
        if(!decodedToken) {
            return res.status(400).json("You can't access this route.")
        }
        req.decodedUserId = decodedToken.id
        req.role = decodedToken.role
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

export default authJwt;