import type { NextFunction, Request, Response } from 'express';
import type { RateLimitRole } from '../type';
import aj from '../config/arcjet';
import { slidingWindow, type ArcjetNodeRequest } from '@arcjet/node';

const securityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (process.env.NODE_ENV === 'development') return next();

    try {
        const role: RateLimitRole = req.user?.role ?? 'guest';
        let limit: number;
        let message: string;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin Rate Limit Exceeded!';
                break;
            case 'teacher':
                limit = 10;
                message = 'Teacher Rate Limit Exceeded';
                break;

            case 'student':
                limit = 5;
                message = 'Student Rate Limit Exceeded';
                break;

            default:
                limit = 3;
                message = 'Guest Rate Limit Exceeded';
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit,
            })
        );

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: {
                remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0',
            },
        };

        const decision = await client.protect(arcjetRequest);

        if (decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Automated requests are not allowed!',
            });
        }
        if (decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Request blocked by security policy',
            });
        }
        if (decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Too many requests!',
            });
        }

        next();
    } catch (e) {
        console.error('Error in arcjet middleware', e);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong...',
        });
    }
};

export default securityMiddleware;
