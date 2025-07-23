export const tenantMiddleware = (req, res, next) => {
    try {
        const hostname = req.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2) {
            req.schoolCode = parts[0];
        }
        const schoolCodeHeader = req.headers['x-school-code'];
        if (schoolCodeHeader) {
            req.schoolCode = schoolCodeHeader;
        }
        const schoolCodeQuery = req.query.schoolCode;
        if (schoolCodeQuery) {
            req.schoolCode = schoolCodeQuery;
        }
        if (!req.schoolCode) {
            req.schoolCode = 'default';
        }
        next();
    }
    catch (error) {
        console.error('租户中间件错误:', error);
        next();
    }
};
//# sourceMappingURL=tenant.middleware.js.map