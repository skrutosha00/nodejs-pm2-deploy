require('dotenv').config();

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF = 'origin/master',
} = process.env;

module.exports = {
  apps: [{
    name: 'api',
    script: './dist/app.js',
  }],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: 'git@github.com:skrutosha00/nodejs-pm2-deploy.git',
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp ./.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/.env`,
      'pre-deploy': 'scp ../shared/.env ./backend/.env',
      'post-deploy': 'cd backend && npm i && npm run build && pm2 kill && pm2 start ./dist/app.js && cd ../frontend && npm i && NODE_OPTIONS=--openssl-legacy-provider npm run build',
    },
  },
};
