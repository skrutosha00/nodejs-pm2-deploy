require('dotenv').config();

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REF = 'origin/master',
} = process.env;

module.exports = {
  apps: [
    {
      name: 'api',
      cwd: './backend',
      script: 'dist/app.js',
      env: { NODE_ENV: 'production', DB_ADDRESS: process.env.DB_ADDRESS },
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

      'pre-deploy-local': 'scp ./.env $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/shared/.env',

      'post-deploy': [
        'ln -sf ../shared/.env backend/.env',

        'cd backend && npm run build',

        'cd ../frontend && NODE_OPTIONS=--openssl-legacy-provider npm run build',

        'cd ../backend',

        'pm2 startOrReload ecosystem.config.js --env production --update-env',
      ].join(' && '),
    },
  },
};
