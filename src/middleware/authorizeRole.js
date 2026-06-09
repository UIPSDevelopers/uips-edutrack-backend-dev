
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; 

    if (!user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to access this resource.",
      });
    }

    next();
  };
};
