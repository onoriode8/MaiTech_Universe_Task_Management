
//ROLE-BASED ACCESS CONTROL (RBAC)
const authorize = (roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.role)) {
            return res.status(403).json("Access denied. You can't access this.")
        }
        next()
    }
}

export default authorize;