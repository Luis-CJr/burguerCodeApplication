import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth'
import * as Yup from 'yup'
import User from '../models/User'

class SessionController {
    async store(request, response) {
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required(),
        })

        const userIncorrectLogin = () => {
            return response
                .status(401)
                .json({ error: 'Make sure your email or password are correct' })
        }

        if (!(schema.isValid(request.body))) userIncorrectLogin()
        
        const { email, password } = request.body
        const user = await User.findOne({ where: { email }, })
        
        if (!user) {
            userIncorrectLogin()
        }

        if (!(await user.checkPassword(password))) userIncorrectLogin()

        return response.json({
            id: user.id,
            email, 
            name: user.name,
            admin: user.admin,
            token: jwt.sign({ id: user.id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        })
    }

}


export default new SessionController()