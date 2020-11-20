import chai from 'chai';
import ChaiHttp from 'chai-http';

let requester:ChaiHttp.Agent;

chai.use(ChaiHttp);

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

const closeTestAgent = async () => {
    if (!requester) {
        return;
    }
    requester.close();

    requester = null;
};


export {
    closeTestAgent,
    getTestAgent
};
