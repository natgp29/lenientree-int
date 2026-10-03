import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const { data: staff, error: staffError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (staffError || !staff) {
            return res.status(403).json({
                success: false,
                message: "Staff profile not found"
            });
        }

        req.user = {
            id: user.id,
            role: staff.role
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
}