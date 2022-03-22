const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./Controllers/ErrorController');

const ShopRoutes = require('./Routes/ShopRoutes');
const ClientRoutes = require('./Routes/ClientRoutes');

const app = express();

app.enable('trust proxy');
app.use(cors());
app.options('*', cors());

// const corsOptions = {
//   origin: '*',
//   credentials: true,
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.use(
//   cors({
//     origin: http,
//     credentials: true,
//   })
// );
// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet({ contentSecurityPolicy: false }));

// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many request from this IP, Please try again after an hour!',
// });
// app.use('/api', limiter);

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'price'],
  })
);
app.use(compression());

// app.use('*', (req, res, next) => {
//   console.log('Cookies', req.cookies);
//   next();
// });
// Server APIs

app.use('/api/v1/gbdleathers/shop', ShopRoutes);
app.use('/api/v1/gbdleathers/client', ClientRoutes);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });
app.use(globalErrorHandler);

app.use(express.static(path.join(__dirname, 'public/build')));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});

module.exports = app;
