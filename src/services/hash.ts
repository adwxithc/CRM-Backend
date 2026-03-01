import bcrypt from "bcryptjs";


class Hash{

    async createHash(password: string) {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    }

    async comparePassword(password: string, hashPassword: string) {
        
        
        const passwordMatch = await bcrypt.compare(password, hashPassword);
        return passwordMatch;
    }
}

export const hash = new Hash();