require('dotenv').config();

// const {
//   DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF = 'origin/master',
// } = process.env;

// module.exports = {
//   apps: [{
//     name: 'api',
//     script: './dist/app.js',
//   }],

//   deploy: {
//     production: {
//       user: DEPLOY_USER,
//       host: DEPLOY_HOST,
//       ref: DEPLOY_REF,
//       repo: 'git@github.com:skrutosha00/nodejs-pm2-deploy.git',
//       path: DEPLOY_PATH,
//       'pre-deploy-local': `scp ./.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/.env`,
//       'pre-deploy': 'scp ../shared/.env ./backend/.env',
//       'post-deploy': `cd backend && npm i && npm run build && pm2 kill
//        && pm2 start ./dist/app.js && cd ../frontend && npm i
//        && NODE_OPTIONS=--openssl-legacy-provider npm run build`,
//     },
//   },
// };

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF = 'origin/master',
} = process.env;

module.exports = {
  apps: [
    {
      name: 'api',
      cwd: './backend',
      script: 'dist/app.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: 'git@github.com:skrutosha00/nodejs-pm2-deploy.git',
      path: DEPLOY_PATH,

      'pre-deploy-local': 'scp ./backend/.env $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/.env',

      // PM2 runs post-deploy inside $DEPLOY_PATH/current
      'post-deploy': [
        // 2) link shared .env into release (НЕ scp; просто symlink/copy)
        'ln -sf ../shared/.env backend/.env',

        // 3) build backend
        'cd backend && npm run build',

        // 4) (optional) build frontend — но лучше делать это в CI.
        'cd ../frontend && NODE_OPTIONS=--openssl-legacy-provider npm run build',

        // 5) never use `pm2 kill` here; reload from ecosystem and refresh env
        'pm2 startOrReload ecosystem.config.js --env production --update-env',
      ].join(' && '),
    },
  },
};
