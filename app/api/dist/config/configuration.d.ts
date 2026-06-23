declare const _default: () => {
    environment: string;
    port: number;
    database: {
        uri: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
