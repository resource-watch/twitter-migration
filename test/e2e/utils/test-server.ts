import chai from 'chai';
import chaiHttp from 'chai-http';

let requester;

chai.use(chaiHttp);

const getTestAgent = async (forceNew = false) => {
    if (forceNew && requester) {
        await new Promise((resolve) => {
            requester.close(() => {
                requester = null;
                resolve();
            });
        });
    }

    if (requester) {
        return requester;
    }

    const { init } = await import('app');
    const { server } = await init();

    requester = chai.request.agent(server);

    return requester;
};

const getTestServer = async () => {
    if (requester) {
        return requester;
    }

    const { init } = await import('app');
    const server = await init();

    requester = chai.request(server).keepOpen();

    return requester;
};

const closeTestAgent = async () => {
    if (!requester) {
        return;
    }
    requester.close();

    requester = null;
};


export {
    closeTestAgent,
    getTestAgent,
    getTestServer
};
