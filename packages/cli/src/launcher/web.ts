import express from 'express';

export default function launch() {
    const app = express();
    const port = 9000;
    const publicPath = `${__dirname}/../../web-ui`;
    console.log('publicPath', publicPath);
    app.use(express.static(publicPath));
    app.listen(port, () => console.log(`nexex-ui listening on port ${port}!`))
}
