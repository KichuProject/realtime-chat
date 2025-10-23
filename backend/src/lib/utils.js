import jwt from 'jsonwebtoken';
export const generateToken = (userID,res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.cookie('jwt', token, {
        maxAge:1000*60*60,
        httpOnly:true,
        sameSite:'strict',
        secure:process.env.NODE_ENV !== 'development',
    });
    return token;
}