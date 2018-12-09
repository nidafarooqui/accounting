import React from 'react';
import '../assets/css/NotFoundPage.css'
import { Link } from 'react-router-dom';
import { routes } from '../routers/routes';

const NotFoundPage = () => (
     <div className = "notFound">
        <div className="clouds">
                <div className="cloud x1"></div>
                <div className="cloud x1_5"></div>
                <div className="cloud x2"></div>
                <div className="cloud x3"></div>
                <div className="cloud x4"></div>
                <div className="cloud x5"></div>
            </div>
            <div className='c'>
                <div className='_404'>404</div>
                <hr className = "notFoundHR"/>
                <div className='_1'>THE PAGE</div>
                <div className='_2'>WAS NOT FOUND</div>
                <Link className='btn' to= {routes.ccrlAccounting}>GO BACK</Link>
            </div>
     </div>
);

export default NotFoundPage;