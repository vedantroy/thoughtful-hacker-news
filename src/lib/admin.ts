import { NextApiRequest, NextApiResponse } from "next";
import * as dotenv from 'dotenv' 

dotenv.config()

const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
    throw new Error("ADMIN_KEY not set");
}

export function isAdmin(req: NextApiRequest): boolean {
    return req.headers.admin === ADMIN_KEY;
}

export function unauthorized(res: NextApiResponse) {
    return res.status(401).json({ error: "unauthorized" });
}

export function invalidMethod(res: NextApiResponse) {
    const methodName = res.req.method;
    return res.status(405).json({ error: `Method ${methodName} not allowed` });
}