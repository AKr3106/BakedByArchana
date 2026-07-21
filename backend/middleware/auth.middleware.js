import jwt from "jsonwebtoken";

// Middleware to verify the JWT token from cookies
export const verifyToken = (req, res, next) => {
    // Retrieve the token from the cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
        
        // Attach the decoded user payload to the request object
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// Middleware to authorize specific roles
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if the user's role is in the list of allowed roles
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}` 
            });
        }
        
        next();
    };
};
