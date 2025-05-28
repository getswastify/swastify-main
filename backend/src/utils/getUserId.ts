import jwt from 'jsonwebtoken';


export const getUserId = (authToken:string) => {
    if (!authToken) {
        throw new Error('Auth token is required');
    }
    
    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'default_secret');
        if (typeof decoded === 'object' && 'userId' in decoded) {
            return decoded.userId;
        }
        throw new Error('Invalid token structure');
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid or expired token');
    }
}